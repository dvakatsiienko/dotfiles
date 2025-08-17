#!/usr/bin/env python3
"""
Libsource Add command - Get and register library source code.

Usage: /libsource-add [library-name] [optional-url-or-path]
Examples: 
  /libsource-add vue
  /libsource-add vue https://github.com/vuejs/core
  /libsource-add next-local /path/to/nextjs
  /libsource-add my-project .
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
        json.dump(config, f, indent=2)


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


def get_library_source(lib_name, source_path):
    """Process library source using gitingest (from URL or local path)."""
    membank_dir = Path.home() / ".claude" / ".membank" / "libsource"
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    
    print(f"🚀 Processing {lib_name} source from {source_path}...")
    print(f"📁 Output: {output_file}")
    
    # Run gitingest command
    cmd = [
        "gitingest", 
        source_path,
        "--output", str(output_file),
        "--max-size", "51200",  # 50KB max file size
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        # Get file size
        file_size = output_file.stat().st_size
        print(f"✅ Successfully fetched {lib_name} source!")
        print(f"💾 Saved to: {output_file}")
        print(f"📊 File size: {file_size:,} bytes ({file_size / 1024 / 1024:.1f} MB)")
        
        return file_size
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running gitingest: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        sys.exit(1)


def main():
    """Main command entry point."""
    if len(sys.argv) < 2:
        print("Usage: /libsource-add [library-name] [optional-url-or-path]")
        print("Examples:")
        print("  /libsource-add vue https://github.com/vuejs/core")
        print("  /libsource-add next-local /path/to/nextjs")
        print("  /libsource-add my-project .")
        sys.exit(1)
    
    lib_name = sys.argv[1]
    provided_url = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Load existing config
    config = load_config()
    
    # Check if library already exists
    if lib_name in config["libraries"]:
        existing = config["libraries"][lib_name]
        print(f"📚 Library '{lib_name}' already registered!")
        print(f"🔗 URL: {existing['url']}")
        print(f"📅 Last updated: {existing['last_updated']}")
        print(f"📁 File: {existing['filename']}")
        
        response = input("\nOverwrite existing library? (y/N): ").strip().lower()
        if response != 'y':
            print("Cancelled.")
            sys.exit(0)
    
    # Get repo URL or local path from user or command line
    if provided_url:
        repo_url = provided_url
    else:
        repo_url = input(f"Enter GitHub repo URL or local path for '{lib_name}': ").strip()
    
    # Validate input: accept GitHub URLs or local paths
    if repo_url.startswith('https://github.com/'):
        # GitHub URL - validation passed
        source_type = "remote"
    elif Path(repo_url).exists():
        # Local path exists - validation passed  
        source_type = "local"
        repo_url = str(Path(repo_url).resolve())  # Convert to absolute path
        print(f"📁 Using local repository: {repo_url}")
    else:
        print("❌ Please provide either:")
        print("   - A valid GitHub URL starting with 'https://github.com/'")
        print("   - A valid local directory path")
        sys.exit(1)
    
    # Process the library source
    file_size = get_library_source(lib_name, repo_url)
    
    # Calculate LOC
    membank_dir = Path.home() / ".claude" / ".membank" / "libsource"
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    loc_count = calculate_loc(output_file)
    
    if loc_count:
        print(f"📏 Lines of code: {loc_count:,}")
    
    # Update config
    config["libraries"][lib_name] = {
        "url": repo_url,
        "filename": f"libsource-{lib_name}.txt",
        "last_updated": datetime.now().isoformat(),
        "file_size": file_size,
        "loc": loc_count,
        "quality": None
    }
    config["last_updated"] = datetime.now().isoformat()
    
    # Save config
    save_config(config)
    
    print(f"🎉 Library '{lib_name}' registered successfully!")


if __name__ == "__main__":
    main()