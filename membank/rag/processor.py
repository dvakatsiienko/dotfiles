"""
Processing pipeline to orchestrate chunking, tagging, and storage.
"""

import sqlite3
import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from .chunker import LibsourceChunker
from .tagger import SemanticTagger
from .db_init import ensure_database_exists


class LibsourceProcessor:
    def __init__(self, db_path: str = "db.sqlite"):  # Default matches config.DATABASE_NAME
        self.db_path = db_path
        self.chunker = LibsourceChunker()
        self.tagger = SemanticTagger()
        self.conn = None
        self.cursor = None
        
    def __enter__(self):
        # Ensure database exists before connecting
        ensure_database_exists(self.db_path, prompt=False)
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            self.conn.close()
    
    def _store_chunks(self, chunks: List[Dict[str, Any]], library_name: str):
        """Store processed chunks in SQLite database."""
        for chunk in chunks:
            self.cursor.execute("""
                INSERT INTO chunks (
                    library, file_path, content, semantic_tags, 
                    bm25_tokens, start_line, end_line, chunk_type, token_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                library_name,
                chunk['file_path'],
                chunk['content'],
                json.dumps(chunk.get('semantic_tags', [])),
                json.dumps(chunk.get('bm25_tokens', [])[:500]),  # Limit stored tokens
                chunk['start_line'],
                chunk['end_line'],
                chunk.get('chunk_type', 'code'),
                chunk.get('token_count', 0)
            ))
        
        self.conn.commit()
    
    def process_libsource(self, filepath: str, library_name: str) -> Dict[str, Any]:
        """
        Process a libsource file through the complete pipeline.
        
        Steps:
        1. Read file content
        2. Chunk file (300 lines with 60 line overlap)
        3. Tag each chunk (extract semantic patterns)
        4. Generate BM25 tokens with boost weights
        5. Store in SQLite
        
        Returns processing metrics.
        """
        start_time = time.time()
        
        # Read file
        print(f"📖 Reading {library_name} from {filepath}...")
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_size = len(content)
        line_count = content.count('\n') + 1
        
        # Chunk the file
        print(f"✂️  Chunking {line_count:,} lines...")
        chunks = self.chunker.chunk_file(content, filepath)
        print(f"   Created {len(chunks)} chunks")
        
        # Tag chunks
        print(f"🏷️  Tagging chunks with semantic patterns...")
        tagged_chunks = self.tagger.tag_chunks(chunks)
        
        # Analyze tagging results
        tag_analysis = self.tagger.analyze_tags(tagged_chunks)
        print(f"   Average {tag_analysis['avg_tags_per_chunk']:.1f} tags per chunk")
        print(f"   {tag_analysis['tag_coverage']:.1f}% chunks have tags")
        
        # Store in database
        print(f"💾 Storing in SQLite database...")
        self._store_chunks(tagged_chunks, library_name)
        
        # Calculate metrics
        process_time = time.time() - start_time
        
        metrics = {
            'library': library_name,
            'filepath': filepath,
            'file_size': file_size,
            'line_count': line_count,
            'chunk_count': len(chunks),
            'process_time': f"{process_time:.2f}s",
            'chunks_per_second': len(chunks) / process_time if process_time > 0 else 0,
            'tag_analysis': tag_analysis,
            'storage': {
                'chunks_stored': len(tagged_chunks),
                'avg_chunk_lines': self.chunker.chunk_size,
                'overlap_lines': self.chunker.overlap
            }
        }
        
        print(f"✅ Processed {library_name} in {process_time:.2f} seconds")
        print(f"   {len(chunks)} chunks @ {metrics['chunks_per_second']:.1f} chunks/sec")
        
        return metrics
    
    def clear_library(self, library_name: str):
        """Clear existing chunks for a library before reprocessing."""
        self.cursor.execute("DELETE FROM chunks WHERE library = ?", (library_name,))
        self.conn.commit()
        print(f"🗑️  Cleared existing chunks for {library_name}")
    
    def get_library_stats(self, library_name: str) -> Dict[str, Any]:
        """Get statistics for a processed library."""
        self.cursor.execute("""
            SELECT COUNT(*) as chunk_count,
                   SUM(token_count) as total_tokens,
                   AVG(LENGTH(semantic_tags)) as avg_tags_length
            FROM chunks 
            WHERE library = ?
        """, (library_name,))
        
        result = self.cursor.fetchone()
        
        return {
            'library': library_name,
            'chunk_count': result[0] if result else 0,
            'total_tokens': result[1] if result else 0,
            'avg_tags_length': result[2] if result else 0
        }
    
    def list_libraries(self) -> List[str]:
        """List all processed libraries in the database."""
        self.cursor.execute("SELECT DISTINCT library FROM chunks")
        return [row[0] for row in self.cursor.fetchall()]


def process_multiple_libsources(libsources: Dict[str, str], 
                               db_path: str = "db.sqlite") -> List[Dict[str, Any]]:
    """
    Process multiple libsource files.
    
    Args:
        libsources: Dictionary of {library_name: filepath}
        db_path: Path to SQLite database
    
    Returns:
        List of processing metrics for each library
    """
    all_metrics = []
    
    with LibsourceProcessor(db_path) as processor:
        for library_name, filepath in libsources.items():
            # Clear existing data
            processor.clear_library(library_name)
            
            # Process the library
            metrics = processor.process_libsource(filepath, library_name)
            all_metrics.append(metrics)
            
            print("-" * 60)
    
    return all_metrics


if __name__ == "__main__":
    # Test with a small sample if run directly
    test_content = """
import React, { useState, useEffect } from 'react';

export default function TestComponent() {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/data');
                const json = await response.json();
                setData(json);
            } catch (error) {
                console.error('Failed to fetch:', error);
            }
        }
        
        fetchData();
    }, []);
    
    return <div>{data ? data.message : 'Loading...'}</div>;
}
    """
    
    # Write test file
    test_file = Path("test_component.jsx")
    test_file.write_text(test_content)
    
    try:
        with LibsourceProcessor() as processor:
            processor.clear_library("test")
            metrics = processor.process_libsource(str(test_file), "test")
            print(json.dumps(metrics, indent=2))
    finally:
        test_file.unlink()  # Clean up test file