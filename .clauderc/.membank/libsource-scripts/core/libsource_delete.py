#!/usr/bin/env python3
"""
Libsource Delete command - Remove library sources.

Usage: python3 libsource-delete.py [library-name] [--force]
Examples: 
  python3 libsource-delete.py vue                # Interactive confirmation
  python3 libsource-delete.py vue --force        # Skip confirmation
  
Auto-detects non-interactive mode and skips confirmation automatically.
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


def delete_library(lib_name, force=False):
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

    # Confirm deletion (skip if force=True or non-interactive)
    if not force:
        import sys
        # Check if stdin is available and we're in an interactive terminal
        if not sys.stdin.isatty():
            print("🤖 Non-interactive mode detected, auto-confirming deletion...")
        else:
            try:
                response = input(f"\n⚠️  Are you sure you want to delete '{lib_name}'? (y/N): ").strip().lower()
                if response != 'y':
                    print("❌ Deletion cancelled.")
                    return False
            except (EOFError, KeyboardInterrupt):
                print("\n❌ Deletion cancelled.")
                return False

    # Remove from RAG index first (before deleting the file)
    config = load_config()
    rag_enabled = config.get('rag_enabled', True)
    
    if rag_enabled:
        print(f"🗑️  Removing from RAG index...")
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from rag.indexer import remove_from_index
        
        if remove_from_index(lib_name, silent=True):
            print(f"✅ Removed from RAG index")
        else:
            print(f"⚠️  Failed to remove from RAG index (continuing anyway)")
    
    # Delete the actual file
    membank_dir = Path.home() / ".dotfiles" / ".clauderc" / ".membank" / "libsource"
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
        print("Usage: python3 libsource-delete.py [library-name] [--force]")
        print("Example: python3 libsource-delete.py vue")
        print("         python3 libsource-delete.py vue --force")
        sys.exit(1)

    # Parse arguments
    args = sys.argv[1:]
    force = "--force" in args
    if force:
        args.remove("--force")
    
    if not args:
        print("❌ Library name is required.")
        sys.exit(1)
        
    lib_name = args[0].lower().strip()

    if not lib_name:
        print("❌ Library name cannot be empty.")
        sys.exit(1)

    success = delete_library(lib_name, force=force)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
