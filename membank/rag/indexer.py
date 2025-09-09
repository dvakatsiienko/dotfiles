#!/usr/bin/env python3
"""
RAG Indexer Integration Module
Provides auto-indexing functionality for libsource operations.
"""

import sys
import time
from pathlib import Path
from typing import Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import DATABASE_PATH
from rag.processor import LibsourceProcessor
from rag.chunker import LibsourceChunker
from rag.tagger import SemanticTagger


class RagIndexer:
    """Handles automatic RAG indexing for libsources."""
    
    def __init__(self, db_path: Optional[str] = None):
        """Initialize indexer with database path."""
        if db_path is None:
            db_path = str(DATABASE_PATH)
        self.db_path = db_path
        self.chunker = LibsourceChunker()
        self.tagger = SemanticTagger()
    
    def auto_index(self, lib_name: str, txt_file_path: Path, silent: bool = False) -> Tuple[bool, dict]:
        """
        Automatically index a libsource file for RAG.
        
        Args:
            lib_name: Name of the library
            txt_file_path: Path to the .txt libsource file
            silent: If True, suppress console output
        
        Returns:
            (success, metrics) tuple
        """
        try:
            start_time = time.time()
            
            if not silent:
                print(f"  ✂️  Chunking into 300-line segments...")
            
            # Read the file
            with open(txt_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Chunk the file
            chunks = self.chunker.chunk_file(content, str(txt_file_path))
            
            if not silent:
                print(f"  🏷️  Applying semantic tags...")
            
            # Tag chunks
            tagged_chunks = self.tagger.tag_chunks(chunks)
            
            # Analyze tagging
            tag_analysis = self.tagger.analyze_tags(tagged_chunks)
            
            if not silent:
                print(f"  💾 Indexing in database...")
            
            # Store in database
            with LibsourceProcessor(self.db_path) as processor:
                # Clear any existing chunks for this library
                processor.clear_library(lib_name)
                # Store new chunks
                processor._store_chunks(tagged_chunks, lib_name)
            
            process_time = time.time() - start_time
            
            metrics = {
                'chunk_count': len(chunks),
                'avg_tags_per_chunk': tag_analysis['avg_tags_per_chunk'],
                'tag_coverage': tag_analysis['tag_coverage'],
                'process_time': process_time,
                'chunks_per_second': len(chunks) / process_time if process_time > 0 else 0
            }
            
            if not silent:
                print(f"✅ RAG augmentation complete ({len(chunks)} chunks, {tag_analysis['tag_coverage']:.0f}% coverage)")
            
            return True, metrics
            
        except Exception as e:
            if not silent:
                print(f"⚠️  RAG augmentation failed: {str(e)}")
            return False, {'error': str(e)}
    
    def reindex(self, lib_name: str, txt_file_path: Path, silent: bool = False) -> Tuple[bool, dict]:
        """
        Reindex an existing libsource (same as auto_index but with different messaging).
        """
        if not silent:
            print(f"🔄 Updating RAG augmentation for {lib_name}...")
        
        return self.auto_index(lib_name, txt_file_path, silent=silent)
    
    def remove_from_index(self, lib_name: str, silent: bool = False) -> bool:
        """
        Remove a library from the RAG index.
        
        Args:
            lib_name: Name of the library to remove
            silent: If True, suppress console output
        
        Returns:
            True if successful, False otherwise
        """
        try:
            with LibsourceProcessor(self.db_path) as processor:
                processor.clear_library(lib_name)
            
            if not silent:
                print(f"🗑️  Removed {lib_name} from RAG index")
            
            return True
            
        except Exception as e:
            if not silent:
                print(f"⚠️  Failed to remove from RAG index: {str(e)}")
            return False
    
    def check_index_status(self, lib_name: str) -> dict:
        """
        Check if a library is indexed and get its stats.
        
        Returns:
            Dictionary with index status and statistics
        """
        try:
            with LibsourceProcessor(self.db_path) as processor:
                stats = processor.get_library_stats(lib_name)
                
                return {
                    'indexed': stats['chunk_count'] > 0,
                    'chunk_count': stats['chunk_count'],
                    'total_tokens': stats['total_tokens']
                }
        except:
            return {
                'indexed': False,
                'chunk_count': 0,
                'total_tokens': 0
            }


# Convenience functions for direct import
def auto_index(lib_name: str, txt_file_path: Path, silent: bool = False) -> Tuple[bool, dict]:
    """Auto-index a libsource file."""
    indexer = RagIndexer()
    return indexer.auto_index(lib_name, txt_file_path, silent)


def reindex(lib_name: str, txt_file_path: Path, silent: bool = False) -> Tuple[bool, dict]:
    """Reindex an existing libsource."""
    indexer = RagIndexer()
    return indexer.reindex(lib_name, txt_file_path, silent)


def remove_from_index(lib_name: str, silent: bool = False) -> bool:
    """Remove a library from the index."""
    indexer = RagIndexer()
    return indexer.remove_from_index(lib_name, silent)