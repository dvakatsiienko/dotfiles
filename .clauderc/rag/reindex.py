#!/usr/bin/env python3
"""
Re-index libsources after updates.
Usage: python reindex.py [library_name or 'all']
"""

import sys
import json
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from processor import process_multiple_libsources


def get_available_libsources():
    """Get all available libsource files."""
    libsource_dir = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource'
    libsources = {}
    
    for file in libsource_dir.glob('libsource-*.txt'):
        name = file.stem.replace('libsource-', '')
        libsources[name] = str(file)
    
    return libsources


def reindex_library(library_name: str = None):
    """Re-index specific library or all libraries."""
    all_libsources = get_available_libsources()
    
    if library_name and library_name != 'all':
        # Re-index specific library
        if library_name not in all_libsources:
            print(f"❌ Library '{library_name}' not found")
            print(f"   Available: {', '.join(sorted(all_libsources.keys()))}")
            return 1
        
        libsources_to_process = {library_name: all_libsources[library_name]}
        print(f"🔄 Re-indexing {library_name} libsource...")
    else:
        # Re-index all
        libsources_to_process = all_libsources
        print(f"🔄 Re-indexing {len(all_libsources)} libsources...")
    
    print("=" * 60)
    
    # Process libsources
    start_time = datetime.now()
    metrics = process_multiple_libsources(libsources_to_process)
    
    # Save metrics
    metrics_file = Path(__file__).parent / 'output' / f'reindex_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    metrics_file.parent.mkdir(exist_ok=True)
    
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    total_chunks = sum(m['chunk_count'] for m in metrics)
    
    print("\n" + "=" * 60)
    print("✅ Re-indexing Complete!")
    print(f"   Libraries processed: {len(metrics)}")
    print(f"   Total chunks: {total_chunks:,}")
    print(f"   Time: {elapsed:.1f}s")
    print(f"   Metrics saved: {metrics_file}")
    
    return 0


def check_freshness():
    """Check if index is stale compared to source files."""
    libsource_dir = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource'
    db_path = Path(__file__).parent / 'libsources.db'
    
    if not db_path.exists():
        print("⚠️  No database found. Run initial indexing first.")
        return
    
    db_mtime = db_path.stat().st_mtime
    stale_libraries = []
    
    for file in libsource_dir.glob('libsource-*.txt'):
        if file.stat().st_mtime > db_mtime:
            lib_name = file.stem.replace('libsource-', '')
            stale_libraries.append(lib_name)
    
    if stale_libraries:
        print(f"⚠️  Stale index detected for: {', '.join(stale_libraries)}")
        print(f"   Run: python reindex.py {stale_libraries[0]}")
    else:
        print("✅ Index is up to date")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == '--check':
            check_freshness()
        else:
            sys.exit(reindex_library(sys.argv[1]))
    else:
        print("Usage: python reindex.py [library_name or 'all']")
        print("       python reindex.py --check")
        print("\nExamples:")
        print("  python reindex.py react      # Re-index React only")
        print("  python reindex.py all        # Re-index everything")
        print("  python reindex.py --check    # Check if index is stale")
        check_freshness()