#!/usr/bin/env python3
"""
Libsource Delete command - Remove library sources.

Usage: /libsource-delete [library-name]
Example: /libsource-delete vue
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


def save_config(config):
    """Save the libsource configuration file."""
    config_file = Path.home() / ".claude" / ".membank" / "libsource" / ".libsource-config.json"
    config_file.parent.mkdir(parents=True, exist_ok=True)

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=4)


def delete_library(lib_name):
    """Delete a library from both file system and config."""
    config = load_config()

    # Check if library exists in config
    if lib_name not in config["libraries"]:
        print(f"❌ Library '{lib_name}' not found in collection.")
        print("\nAvailable libraries:")
        for name in sorted(config["libraries"].keys()):
            print(f"  • {name}")
        return False

    library_info = config["libraries"][lib_name]

    # Show library details before deletion
    print(f"📚 Found library: {lib_name}")
    print(f"   🔗 URL: {library_info['url']}")
    print(f"   📁 File: {library_info['filename']}")
    print(f"   📅 Last updated: {library_info['last_updated'][:10]}")

    # Confirm deletion
    response = input(f"\n⚠️  Are you sure you want to delete '{lib_name}'? (y/N): ").strip().lower()
    if response != 'y':
        print("❌ Deletion cancelled.")
        return False

    # Delete the actual file
    membank_dir = Path.home() / ".claude" / ".membank" / "libsource"
    libsource_file = membank_dir / library_info['filename']

    if libsource_file.exists():
        try:
            libsource_file.unlink()
            print(f"🗑️  Deleted file: {libsource_file}")
        except OSError as e:
            print(f"❌ Error deleting file {libsource_file}: {e}")
            return False
    else:
        print(f"⚠️  File {libsource_file} not found (already deleted?)")

    # Remove from config
    del config["libraries"][lib_name]

    # Update timestamp
    from datetime import datetime
    config["last_updated"] = datetime.now().isoformat()

    # Save updated config
    try:
        save_config(config)
        print(f"📝 Updated config: removed '{lib_name}' entry")
    except Exception as e:
        print(f"❌ Error updating config: {e}")
        return False

    print(f"✅ Successfully deleted library '{lib_name}'!")
    print(f"📊 Remaining libraries: {len(config['libraries'])}")
    return True


def main():
    """Main command entry point."""
    if len(sys.argv) < 2:
        print("Usage: /libsource-delete [library-name]")
        print("Example: /libsource-delete vue")
        sys.exit(1)

    lib_name = sys.argv[1].lower().strip()

    if not lib_name:
        print("❌ Library name cannot be empty.")
        sys.exit(1)

    success = delete_library(lib_name)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
