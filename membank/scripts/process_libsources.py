#!/usr/bin/env python3
"""
Process React and AI libsources through the RAG pipeline.
"""

import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from processor import process_multiple_libsources


def main():
    # Define libsource paths
    libsource_dir = Path.home() / '.dotfiles' / '.clauderc' / '.membank' / 'libsource'
    
    libsources = {
        'react': str(libsource_dir / 'libsource-react.txt'),
        'ai': str(libsource_dir / 'libsource-ai.txt')
    }
    
    # Check if files exist
    for name, path in libsources.items():
        if not Path(path).exists():
            print(f"❌ {name} libsource not found at {path}")
            print(f"   Please ensure libsource files are generated first")
            return 1
    
    print("🚀 Starting RAG pipeline for React and AI libsources")
    print("=" * 60)
    
    # Process libsources
    metrics = process_multiple_libsources(libsources)
    
    # Save metrics
    metrics_file = Path(__file__).parent / 'output' / 'processing_metrics.json'
    metrics_file.parent.mkdir(exist_ok=True)
    
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("\n" + "=" * 60)
    print("📊 Processing Summary:")
    
    total_chunks = sum(m['chunk_count'] for m in metrics)
    total_time = sum(float(m['process_time'].rstrip('s')) for m in metrics)
    
    print(f"   Total chunks created: {total_chunks}")
    print(f"   Total processing time: {total_time:.2f}s")
    print(f"   Average speed: {total_chunks/total_time:.1f} chunks/sec")
    
    print(f"\n📁 Metrics saved to: {metrics_file}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())