#!/usr/bin/env python3
"""
Libsource Update command - Update existing library sources.

Usage: python3 libsource-update.py [library-name]
       python3 libsource-update.py (updates all)

Example: python3 libsource-update.py react
         python3 libsource-update.py
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


# Import our shared utilities  
from libsource_utils import fetch_libsource, format_duration


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
    old_generation_time = library_info.get('generation_time', 'unknown')
    
    print(f"\n📚 Updating library: {lib_name}")
    print(f"   🔗 URL: {library_info['url']}")
    print(f"   📊 Current: {old_file_size:,} bytes, {old_loc:,} LOC")
    print(f"   ⏱️  Last generation: {old_generation_time}")
    
    # Update the source
    print(f"🔄 Updating {lib_name} source from {library_info['url']}...")
    new_file_size, generation_time = fetch_libsource(lib_name, library_info['url'])
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
        "generation_time": generation_time
    })
    
    # Show results
    print(f"⏱️  Generation time: {generation_time}")
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
    else:
        print(f"✨ No changes detected (same size and LOC)")
    
    return True, content_changed


def main():
    """Main command entry point."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use 'pnpm lib:add [library-name] [url]' to add libraries!")
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
        
        # Sort libraries by generation time (fastest first, slowest last)
        # Convert generation time strings to seconds for sorting
        def parse_generation_time(time_str):
            """Convert generation time string like '59m 7s' or '3s' to seconds."""
            if not time_str or time_str == 'unknown':
                return 0
            
            total_seconds = 0
            parts = time_str.split()
            
            for part in parts:
                if part.endswith('h'):
                    total_seconds += int(part[:-1]) * 3600
                elif part.endswith('m'):
                    total_seconds += int(part[:-1]) * 60
                elif part.endswith('s'):
                    total_seconds += int(part[:-1])
            
            return total_seconds
        
        # Sort by generation time, with fallback to file size for new libraries
        sorted_libs = sorted(
            config["libraries"].keys(),
            key=lambda lib: (
                parse_generation_time(config["libraries"][lib].get("generation_time", "0s")) 
                if config["libraries"][lib].get("generation_time") 
                else config["libraries"][lib].get("file_size", 0) / 1000000  # Convert to rough seconds estimate
            )
        )
        
        print("📊 Processing order (fastest → slowest):")
        for lib in sorted_libs:
            gen_time = config["libraries"][lib].get("generation_time", "unknown")
            size = config["libraries"][lib].get("file_size", 0)
            size_mb = size / 1024 / 1024 if size > 0 else 0
            print(f"  • {lib}: {size_mb:.1f} MB, last gen time: {gen_time}")
        print()
        
        for i, lib_name in enumerate(sorted_libs, 1):
            gen_time = config["libraries"][lib_name].get("generation_time", "unknown")
            size = config["libraries"][lib_name].get("file_size", 0)
            size_mb = size / 1024 / 1024 if size > 0 else 0
            print(f"[{i}/{len(config['libraries'])}] (prev: {gen_time})", end=" ")
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
            print(f"\n🔍 Libraries with changes:")
            for lib in changed_libraries:
                print(f"  • {lib}")
            print(f"\n💡 Suggestion: Run /libsource-inspect for changed libraries")
        else:
            print(f"\n✨ No content changes detected in any library")
    else:
        print(f"\n❌ No libraries were successfully updated")


if __name__ == "__main__":
    main()