#!/usr/bin/env python3
"""
Libsource List command - List all registered library sources.

Usage: 
  /libsource-list              # List all libraries
  /libsource-list [lib-name]   # Show specific library details
"""

import json
import sys
from pathlib import Path


def load_config():
    """Load the libsource configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "libsource" / ".libsource-config.json"
    
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {"libraries": {}, "last_updated": None, "version": "1.0"}


def format_library_info(lib_name, info):
    """Format library information for display."""
    lines = []
    lines.append(f"📖 {lib_name}")
    lines.append(f"   🔗 URL: {info['url']}")
    lines.append(f"   📁 File: {info['filename']}")
    lines.append(f"   📅 Updated: {info['last_updated'][:10]}")
    
    # Show file size in human readable format
    size_bytes = info['file_size']
    if size_bytes > 1024 * 1024:
        size_str = f"{size_bytes / 1024 / 1024:.1f} MB"
    elif size_bytes > 1024:
        size_str = f"{size_bytes / 1024:.1f} KB"
    else:
        size_str = f"{size_bytes} bytes"
    
    lines.append(f"   📊 Size: {size_str}")
    
    # Show LOC in human readable format
    loc = info.get('loc')
    if loc is not None:
        if loc > 1000000:
            loc_str = f"{loc / 1000000:.1f}M lines"
        elif loc > 1000:
            loc_str = f"{loc / 1000:.1f}K lines" 
        else:
            loc_str = f"{loc} lines"
        lines.append(f"   📏 LOC: {loc_str}")
    else:
        lines.append(f"   📏 LOC: Not calculated")
    
    # Show quality rating
    quality = info.get('quality')
    if quality is not None:
        lines.append(f"   ⭐ Quality: {quality}%")
    else:
        lines.append(f"   ⭐ Quality: Not rated")
        
    return "\n".join(lines)


def show_specific_library(config, lib_name):
    """Show details for a specific library."""
    if lib_name not in config["libraries"]:
        print(f"❌ Library '{lib_name}' not found in collection.")
        print("\nAvailable libraries:")
        for name in sorted(config["libraries"].keys()):
            print(f"  • {name}")
        return False
    
    print(f"📚 Libsource Details: {lib_name}")
    print("=" * 50)
    print(format_library_info(lib_name, config["libraries"][lib_name]))
    return True


def show_all_libraries(config):
    """Show all registered libraries."""
    print("📚 Registered Library Sources:")
    print("=" * 50)
    
    for lib_name, info in config["libraries"].items():
        print(format_library_info(lib_name, info))
        print()


def main():
    """Main command entry point."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use /libsource-add [library-name] to add libraries!")
        return
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        lib_name = sys.argv[1].lower()
        show_specific_library(config, lib_name)
    else:
        show_all_libraries(config)


if __name__ == "__main__":
    main()