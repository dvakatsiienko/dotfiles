#!/usr/bin/env python3
"""
Libsource Read command - Read and analyze library source with auto-recovery.

Usage: /libsource-read [library-name] "prompt"
Example: /libsource-read react "hooks patterns for state management"
"""

import sys
from pathlib import Path

# Import our shared utilities
from libsource_utils import (
    load_config, 
    get_libsource_path, 
    ensure_libsource_exists
)


def read_libsource_with_prompt(lib_name, prompt):
    """Read libsource file and provide targeted analysis based on prompt."""
    config = load_config()
    
    # Ensure libsource exists (auto-fetch if missing)
    if not ensure_libsource_exists(lib_name, config):
        print(f"❌ Failed to ensure {lib_name} libsource is available.")
        return False
    
    # Read the file
    file_path = get_libsource_path(lib_name)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (FileNotFoundError, UnicodeDecodeError) as e:
        print(f"❌ Error reading {lib_name} libsource: {e}")
        return False
    
    # Get library info for context
    library_info = config["libraries"][lib_name]
    file_size_mb = library_info['file_size'] / 1024 / 1024
    loc = library_info.get('loc', 'unknown')
    
    print(f"📚 Libsource Analysis: {lib_name} - \"{prompt}\"")
    print(f"📊 Source: {file_size_mb:.1f}MB, {loc:,} LOC")
    print(f"🔗 URL: {library_info['url']}")
    print(f"📅 Last updated: {library_info['last_updated'][:10]}")
    print()
    
    # Provide the content for Claude to analyze with the prompt
    print("🎯 **Analyzing libsource content with your prompt...**")
    print(f"**Prompt:** \"{prompt}\"")
    print(f"**Content Length:** {len(content):,} characters")
    print()
    print("**Library Source Content:**")
    print("```")
    print(content)
    print("```")
    
    return True


def main():
    """Main command entry point."""
    if len(sys.argv) < 3:
        print("Usage: /libsource-read [library-name] \"prompt\"")
        print("Example: /libsource-read react \"hooks patterns for state management\"")
        print()
        
        # Show available libraries
        config = load_config()
        if config["libraries"]:
            print("Available libraries:")
            for lib_name in sorted(config["libraries"].keys()):
                lib_info = config["libraries"][lib_name]
                file_size_mb = lib_info['file_size'] / 1024 / 1024
                loc = lib_info.get('loc', '?')
                status = "✅" if get_libsource_path(lib_name).exists() else "❌"
                print(f"  {status} {lib_name} ({file_size_mb:.1f}MB, {loc:,} LOC)")
        else:
            print("No libraries registered yet. Use 'pnpm lib:add [lib] [url]' to add libraries!")
        
        sys.exit(1)
    
    lib_name = sys.argv[1].lower().strip()
    prompt = sys.argv[2].strip()
    
    if not lib_name:
        print("❌ Library name cannot be empty.")
        sys.exit(1)
    
    if not prompt:
        print("❌ Prompt cannot be empty.")
        sys.exit(1)
    
    success = read_libsource_with_prompt(lib_name, prompt)
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()