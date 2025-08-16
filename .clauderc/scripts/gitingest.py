#!/usr/bin/env python3
"""
Gitingest command - Get and register library source code.

Usage: /gitingest [library-name]
Example: /gitingest vue
"""

import json
import sys
import subprocess
from datetime import datetime
from pathlib import Path


def load_config():
    """Load the gitingest configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "gitingest" / ".gitingest-config.json"
    
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {"libraries": {}, "last_updated": None, "version": "1.0"}


def save_config(config):
    """Save the gitingest configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "gitingest" / ".gitingest-config.json"
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


def get_library_source(lib_name, repo_url):
    """Download library source using gitingest."""
    membank_dir = Path.home() / ".claude" / ".membank" / "gitingest"
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    
    print(f"🚀 Fetching {lib_name} source from {repo_url}...")
    print(f"📁 Output: {output_file}")
    
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
        print("Usage: /gitingest [library-name]")
        print("Example: /gitingest vue")
        sys.exit(1)
    
    lib_name = sys.argv[1]
    
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
    
    # Get repo URL from user
    repo_url = input(f"Enter GitHub repo URL for '{lib_name}': ").strip()
    
    if not repo_url.startswith('https://github.com/'):
        print("❌ Please provide a valid GitHub URL starting with 'https://github.com/'")
        sys.exit(1)
    
    # Download the library source
    file_size = get_library_source(lib_name, repo_url)
    
    # Calculate LOC
    membank_dir = Path.home() / ".claude" / ".membank" / "gitingest"
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