#!/usr/bin/env python3
"""
Libsource Restore command - Restore missing libsource files from config.

Usage: /libsource-restore [lib-name]
       /libsource-restore (restores all missing)

Example: /libsource-restore react
         /libsource-restore
"""

import sys
from libsource_utils import (
    load_config,
    verify_all_libsources,
    restore_missing_libsources,
    ensure_libsource_exists
)


def restore_single_library(lib_name):
    """Restore a single library if missing."""
    config = load_config()
    
    if lib_name not in config["libraries"]:
        print(f"❌ Library '{lib_name}' not found in collection.")
        print("\nAvailable libraries:")
        for name in sorted(config["libraries"].keys()):
            print(f"  • {name}")
        return False
    
    print(f"🔍 Checking {lib_name} libsource...")
    
    if ensure_libsource_exists(lib_name, config):
        print(f"✅ {lib_name} libsource is ready!")
        return True
    else:
        print(f"❌ Failed to restore {lib_name} libsource.")
        return False


def restore_all_missing():
    """Restore all missing libsource files."""
    config = load_config()
    
    if not config["libraries"]:
        print("📚 No libraries registered yet.")
        print("Use /libsource-add [library-name] to add libraries!")
        return False
    
    # Check what's missing
    existing, missing = verify_all_libsources(config)
    
    if not missing:
        print("🎉 All libsource files are already present!")
        print(f"✅ {len(existing)} libraries verified and ready")
        return True
    
    print(f"🔍 Found {len(missing)} missing libsource files out of {len(config['libraries'])} total")
    
    # Show what will be restored
    total_size = 0
    for lib_name in missing:
        info = config["libraries"][lib_name]
        size_mb = info['file_size'] / 1024 / 1024
        total_size += size_mb
        print(f"  📥 {lib_name} ({size_mb:.1f}MB) from {info['url']}")
    
    print(f"\n📊 Total download size: {total_size:.1f}MB")
    
    # Confirm before proceeding
    response = input(f"\n🔄 Restore {len(missing)} missing libsource files? (Y/n): ").strip().lower()
    if response and response != 'y' and response != 'yes':
        print("Cancelled.")
        return False
    
    # Restore missing files
    success_count, total_count = restore_missing_libsources(missing, config)
    
    if success_count == total_count:
        print(f"\n🎉 Successfully restored all {success_count} missing libsource files!")
        return True
    else:
        print(f"\n⚠️  Restored {success_count}/{total_count} files. Some failures occurred.")
        return False


def main():
    """Main command entry point."""
    if len(sys.argv) > 1:
        # Restore specific library
        lib_name = sys.argv[1].lower().strip()
        if not lib_name:
            print("❌ Library name cannot be empty.")
            sys.exit(1)
        
        success = restore_single_library(lib_name)
        if not success:
            sys.exit(1)
    else:
        # Restore all missing libraries
        success = restore_all_missing()
        if not success:
            sys.exit(1)


if __name__ == "__main__":
    main()