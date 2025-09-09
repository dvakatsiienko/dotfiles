#!/usr/bin/env python3
"""
Process ALL libsources into the RAG database.
"""

import sys
import json
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from processor import process_multiple_libsources


def main():
    # Get all libsource files
    libsource_dir = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource'
    
    all_libsources = {}
    for file in sorted(libsource_dir.glob('libsource-*.txt')):
        name = file.stem.replace('libsource-', '')
        all_libsources[name] = str(file)
    
    print("🚀 RAG Processing ALL Libsources")
    print("=" * 60)
    print(f"Found {len(all_libsources)} libraries to process:")
    
    # Show what we'll process with sizes
    total_size = 0
    for name, path in all_libsources.items():
        size = Path(path).stat().st_size / (1024 * 1024)  # MB
        total_size += size
        print(f"  • {name:20} {size:6.1f} MB")
    
    print(f"\nTotal input size: {total_size:.1f} MB")
    print("=" * 60)
    
    response = input("\n⚠️  This will clear and rebuild the entire database. Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return 1
    
    print("\n🔄 Processing (this may take 2-3 minutes)...")
    print("-" * 60)
    
    # Process all libsources
    start_time = datetime.now()
    metrics = process_multiple_libsources(all_libsources)
    
    # Save detailed metrics
    metrics_file = Path(__file__).parent / 'output' / 'all_libraries_metrics.json'
    metrics_file.parent.mkdir(exist_ok=True)
    
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # Calculate summary
    elapsed = (datetime.now() - start_time).total_seconds()
    total_chunks = sum(m['chunk_count'] for m in metrics)
    total_lines = sum(m['line_count'] for m in metrics)
    avg_tags = sum(m['tag_analysis']['avg_tags_per_chunk'] for m in metrics) / len(metrics)
    
    print("\n" + "=" * 60)
    print("✅ ALL LIBSOURCES PROCESSED!")
    print("=" * 60)
    
    print(f"\n📊 Summary:")
    print(f"  Libraries processed: {len(metrics)}")
    print(f"  Total chunks created: {total_chunks:,}")
    print(f"  Total lines processed: {total_lines:,}")
    print(f"  Average tags per chunk: {avg_tags:.1f}")
    print(f"  Processing time: {elapsed:.1f} seconds")
    print(f"  Speed: {total_chunks/elapsed:.1f} chunks/sec")
    
    print(f"\n📁 Detailed metrics: {metrics_file}")
    
    # Show per-library stats
    print(f"\n📚 Per-Library Results:")
    print(f"{'Library':<20} {'Chunks':<10} {'Tags/Chunk':<12} {'Time':<10}")
    print("-" * 52)
    for m in sorted(metrics, key=lambda x: x['library']):
        print(f"{m['library']:<20} {m['chunk_count']:<10} "
              f"{m['tag_analysis']['avg_tags_per_chunk']:<12.1f} "
              f"{m['process_time']:<10}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())