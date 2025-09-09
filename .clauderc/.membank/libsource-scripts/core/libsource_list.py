#!/usr/bin/env python3
"""
Libsource List command - List all registered library sources with file verification.

Usage: 
  /libsource-list              # List all libraries
  /libsource-list [lib-name]   # Show specific library details
  /libsource-list --verify     # Verify all files exist and show missing ones
"""

import json
import sys
from pathlib import Path

# Import our shared utilities
from libsource_utils import load_config, get_libsource_path, verify_all_libsources


def format_library_info(lib_name, info, show_file_status=True):
    """Format library information for display."""
    lines = []
    
    # Check if file exists and add status indicator
    if show_file_status:
        file_exists = get_libsource_path(lib_name).exists()
        status_icon = "✅" if file_exists else "❌"
        lines.append(f"{status_icon} 📖 {lib_name}")
    else:
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
    
    # Show generation time if available
    generation_time = info.get('generation_time')
    if generation_time:
        lines.append(f"   ⏱️  Generation: {generation_time}")
    else:
        lines.append(f"   ⏱️  Generation: Not recorded")
    
    # Show file status if missing
    if show_file_status and not get_libsource_path(lib_name).exists():
        lines.append(f"   ⚠️  File missing (use 'pnpm lib:restore')")
        
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


def show_verification_report(config):
    """Show comprehensive verification report."""
    existing, missing = verify_all_libsources(config)
    
    print("🔍 Libsource File Verification Report:")
    print("=" * 50)
    
    if existing:
        print(f"✅ Found {len(existing)} existing files:")
        for lib in sorted(existing):
            info = config["libraries"][lib]
            size_mb = info['file_size'] / 1024 / 1024
            generation_time = info.get('generation_time', 'unknown')
            print(f"  ✅ {lib} ({size_mb:.1f}MB, {generation_time})")
    
    if missing:
        print(f"\n❌ Missing {len(missing)} files:")
        for lib in sorted(missing):
            info = config["libraries"][lib]
            size_mb = info['file_size'] / 1024 / 1024
            generation_time = info.get('generation_time', 'unknown')
            print(f"  ❌ {lib} ({size_mb:.1f}MB, {generation_time}) - from {info['url']}")
        
        print(f"\n💡 Run 'pnpm lib:restore' to fetch all missing files")
    else:
        print(f"\n🎉 All libsource files are present!")


def main():
    """Main command entry point."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use 'pnpm lib:add [library-name] [url]' to add libraries!")
        return
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        arg = sys.argv[1].lower()
        
        if arg == "--verify":
            show_verification_report(config)
        else:
            # Treat as library name
            show_specific_library(config, arg)
    else:
        show_all_libraries(config)


if __name__ == "__main__":
    main()