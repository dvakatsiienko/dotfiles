#!/usr/bin/env python3
"""
Gitingest List command - List all registered library sources.

Usage: /gitingest-list
"""

import json
from pathlib import Path


def load_config():
    """Load the gitingest configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "gitingest" / ".gitingest-config.json"
    
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {"libraries": {}, "last_updated": None, "version": "1.0"}


def main():
    """Main command entry point."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use /gitingest [library-name] to add libraries!")
        return
    
    print("📚 Registered Library Sources:")
    print("=" * 50)
    
    for lib_name, info in config["libraries"].items():
        print(f"📖 {lib_name}")
        print(f"   🔗 URL: {info['url']}")
        print(f"   📁 File: {info['filename']}")
        print(f"   📅 Updated: {info['last_updated'][:10]}")
        
        # Show file size in human readable format
        size_bytes = info['file_size']
        if size_bytes > 1024 * 1024:
            size_str = f"{size_bytes / 1024 / 1024:.1f} MB"
        elif size_bytes > 1024:
            size_str = f"{size_bytes / 1024:.1f} KB"
        else:
            size_str = f"{size_bytes} bytes"
        
        print(f"   📊 Size: {size_str}")
        
        # Show LOC in human readable format
        loc = info.get('loc')
        if loc is not None:
            if loc > 1000000:
                loc_str = f"{loc / 1000000:.1f}M lines"
            elif loc > 1000:
                loc_str = f"{loc / 1000:.1f}K lines" 
            else:
                loc_str = f"{loc} lines"
            print(f"   📏 LOC: {loc_str}")
        else:
            print(f"   📏 LOC: Not calculated")
        
        # Show quality rating
        quality = info.get('quality')
        if quality is not None:
            print(f"   ⭐ Quality: {quality}%")
        else:
            print(f"   ⭐ Quality: Not rated")
            
        print()


if __name__ == "__main__":
    main()