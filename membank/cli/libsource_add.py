#!/usr/bin/env python3
"""
Libsource Add command - Get and register library source code.

Usage: python3 libsource-add.py [library-name] [optional-url-or-path]
Examples: 
  python3 libsource-add.py vue
  python3 libsource-add.py vue https://github.com/vuejs/core
  python3 libsource-add.py next-local /path/to/nextjs
  python3 libsource-add.py my-project .
"""

import json
import sys
import subprocess
from datetime import datetime
from pathlib import Path


# Import our shared utilities
from libsource_utils import (
    load_config, 
    save_config, 
    calculate_loc, 
    fetch_libsource, 
    format_duration,
    get_membank_dir
)


def main():
    """Main command entry point."""
    if len(sys.argv) < 2:
        print("Usage: python3 libsource-add.py [library-name] [optional-url-or-path]")
        print("Examples:")
        print("  python3 libsource-add.py vue https://github.com/vuejs/core")
        print("  python3 libsource-add.py next-local /path/to/nextjs")
        print("  python3 libsource-add.py my-project .")
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
    print(f"🚀 Processing {lib_name} source from {repo_url}...")
    file_size, generation_time = fetch_libsource(lib_name, repo_url)
    
    if file_size is None:
        print(f"❌ Failed to process {lib_name} source.")
        sys.exit(1)
    
    # Calculate LOC
    membank_dir = get_membank_dir()
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    loc_count = calculate_loc(output_file)
    
    if loc_count:
        print(f"📏 Lines of code: {loc_count:,}")
    
    # RAG augmentation
    config = load_config()
    rag_enabled = config.get('rag_enabled', True)
    rag_metrics = {}
    
    if rag_enabled:
        print(f"🔄 Creating RAG augmentation...")
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from rag.indexer import auto_index
        
        success, metrics = auto_index(lib_name, output_file)
        if success:
            rag_metrics = metrics
            print(f"✅ RAG augmentation complete ({metrics['chunk_count']} chunks, {metrics['tag_coverage']:.0f}% coverage)")
        else:
            print(f"⚠️  RAG augmentation failed but libsource created successfully")
    
    # Update config
    config["libraries"][lib_name] = {
        "url": repo_url,
        "filename": f"libsource-{lib_name}.txt",
        "last_updated": datetime.now().isoformat(),
        "file_size": file_size,
        "loc": loc_count,
        "generation_time": generation_time
    }
    config["last_updated"] = datetime.now().isoformat()
    
    # Save config
    save_config(config)
    
    print(f"🎉 Library '{lib_name}' registered successfully!")


if __name__ == "__main__":
    main()