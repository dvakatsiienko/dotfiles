#!/usr/bin/env python3
"""
Libsource Update command - Update existing library sources.

Usage: /libsource-update [library-name]
       /libsource-update (updates all)

Example: /libsource-update react
         /libsource-update
"""

import json
import sys
import subprocess
from datetime import datetime
from pathlib import Path


def load_config():
    """Load the libsource configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "libsource" / ".libsource-config.json"
    
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {"libraries": {}, "last_updated": None, "version": "1.0"}


def save_config(config):
    """Save the libsource configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "libsource" / ".libsource-config.json"
    config_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=4)


def calculate_loc(file_path):
    """Calculate lines of code in a libsource file."""
    try:
        result = subprocess.run(['wc', '-l', str(file_path)], 
                              capture_output=True, text=True, check=True)
        # Extract the number from "12345 filename" output
        loc_count = int(result.stdout.strip().split()[0])
        return loc_count
    except (subprocess.CalledProcessError, ValueError, IndexError):
        return None


def update_library_source(lib_name, repo_url):
    """Update library source using gitingest."""
    membank_dir = Path.home() / ".claude" / ".membank" / "libsource"
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    
    print(f"🔄 Updating {lib_name} source from {repo_url}...")
    
    # Run gitingest command
    cmd = [
        "gitingest", 
        repo_url,
        "--output", str(output_file),
        "--max-size", "51200",  # 50KB max file size
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        # Get file size
        file_size = output_file.stat().st_size
        print(f"✅ Successfully updated {lib_name} source!")
        print(f"📊 File size: {file_size:,} bytes ({file_size / 1024 / 1024:.1f} MB)")
        
        return file_size
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running gitingest for {lib_name}: {e}")
        print(f"STDERR: {e.stderr}")
        return None


def update_single_library(config, lib_name):
    """Update a single library and return change status."""
    if lib_name not in config["libraries"]:
        print(f"❌ Library '{lib_name}' not found in collection.")
        print("\nAvailable libraries:")
        for name in sorted(config["libraries"].keys()):
            print(f"  • {name}")
        return False, False
    
    library_info = config["libraries"][lib_name]
    old_file_size = library_info.get('file_size', 0)
    old_loc = library_info.get('loc', 0)
    old_quality = library_info.get('quality')
    
    print(f"\n📚 Updating library: {lib_name}")
    print(f"   🔗 URL: {library_info['url']}")
    print(f"   📊 Current: {old_file_size:,} bytes, {old_loc:,} LOC")
    if old_quality is not None:
        print(f"   ⭐ Current quality: {old_quality}% (will be reset)")
    
    # Update the source
    new_file_size = update_library_source(lib_name, library_info['url'])
    if new_file_size is None:
        return False, False
    
    # Calculate new LOC
    membank_dir = Path.home() / ".claude" / ".membank" / "libsource"
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    new_loc = calculate_loc(output_file)
    
    # Check if content actually changed
    content_changed = (new_file_size != old_file_size or new_loc != old_loc)
    
    # Update config
    config["libraries"][lib_name].update({
        "last_updated": datetime.now().isoformat(),
        "file_size": new_file_size,
        "loc": new_loc,
        "quality": None  # Reset quality after update
    })
    
    # Show results
    if content_changed:
        print(f"📈 Changes detected:")
        if new_file_size != old_file_size:
            size_diff = new_file_size - old_file_size
            sign = "+" if size_diff > 0 else ""
            print(f"   📊 Size: {old_file_size:,} → {new_file_size:,} bytes ({sign}{size_diff:,})")
        if new_loc != old_loc:
            loc_diff = new_loc - old_loc
            sign = "+" if loc_diff > 0 else ""
            print(f"   📏 LOC: {old_loc:,} → {new_loc:,} lines ({sign}{loc_diff:,})")
        print(f"   ⭐ Quality: {old_quality}% → reset to null (needs re-evaluation)")
    else:
        print(f"✨ No changes detected (same size and LOC)")
        print(f"   ⭐ Quality: reset to null anyway (standard after update)")
    
    return True, content_changed


def main():
    """Main command entry point."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use /libsource-add [library-name] to add libraries!")
        return
    
    updated_libraries = []
    changed_libraries = []
    
    if len(sys.argv) > 1:
        # Update single library
        lib_name = sys.argv[1].lower().strip()
        if not lib_name:
            print("❌ Library name cannot be empty.")
            sys.exit(1)
        
        success, changed = update_single_library(config, lib_name)
        if success:
            updated_libraries.append(lib_name)
            if changed:
                changed_libraries.append(lib_name)
    else:
        # Update all libraries
        print(f"🔄 Updating all {len(config['libraries'])} registered libraries...\n")
        
        for i, lib_name in enumerate(sorted(config["libraries"].keys()), 1):
            print(f"[{i}/{len(config['libraries'])}]", end=" ")
            success, changed = update_single_library(config, lib_name)
            if success:
                updated_libraries.append(lib_name)
                if changed:
                    changed_libraries.append(lib_name)
            print()  # Add spacing between libraries
    
    # Save updated config
    if updated_libraries:
        config["last_updated"] = datetime.now().isoformat()
        save_config(config)
        
        print(f"\n✅ Update complete!")
        print(f"📊 Updated: {len(updated_libraries)} libraries")
        print(f"📈 Changed: {len(changed_libraries)} libraries")
        
        if changed_libraries:
            print(f"\n🔍 Libraries with changes (need quality re-evaluation):")
            for lib in changed_libraries:
                print(f"  • {lib}")
            print(f"\n💡 Suggestion: Run /libsource-inspect for changed libraries")
        else:
            print(f"\n✨ No content changes detected in any library")
    else:
        print(f"\n❌ No libraries were successfully updated")


if __name__ == "__main__":
    main()