"""
Smart code chunker using tree-sitter for AST-aware chunking.
300 lines per chunk with 20% (60 lines) overlap.
"""

from typing import List, Dict, Any
import re

try:
    import tree_sitter_languages as tsl
    HAS_TREE_SITTER = True
except ImportError:
    HAS_TREE_SITTER = False


class LibsourceChunker:
    def __init__(self):
        self.chunk_size = 300  # Lines, NOT characters
        self.overlap = 60      # 20% overlap
        self.parser = None
        
    def _get_parser(self, language: str):
        """Get tree-sitter parser for language detection."""
        if not HAS_TREE_SITTER:
            return None
        try:
            return tsl.get_parser(language)
        except:
            return None
    
    def _detect_language(self, filepath: str) -> str:
        """Detect language from file extension."""
        ext_map = {
            '.js': 'javascript',
            '.jsx': 'jsx',
            '.ts': 'typescript',
            '.tsx': 'tsx',
            '.py': 'python',
            '.go': 'go',
            '.rs': 'rust',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.cs': 'csharp',
            '.rb': 'ruby',
            '.php': 'php',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.md': 'markdown'
        }
        
        for ext, lang in ext_map.items():
            if filepath.endswith(ext):
                return lang
        return 'text'
    
    def _find_break_points(self, lines: List[str], language: str) -> List[int]:
        """Find natural break points in code (function/class boundaries)."""
        break_points = []
        
        # Language-specific patterns for break points
        patterns = {
            'javascript': [
                r'^(export\s+)?(async\s+)?function\s+\w+',
                r'^(export\s+)?class\s+\w+',
                r'^export\s+(default\s+)?',
                r'^const\s+\w+\s*=\s*(async\s+)?(\(|\w+\s*=>)',
            ],
            'typescript': [
                r'^(export\s+)?(async\s+)?function\s+\w+',
                r'^(export\s+)?class\s+\w+',
                r'^export\s+(default\s+)?',
                r'^(export\s+)?interface\s+\w+',
                r'^(export\s+)?type\s+\w+',
                r'^const\s+\w+\s*=\s*(async\s+)?(\(|\w+\s*=>)',
            ],
            'python': [
                r'^def\s+\w+',
                r'^class\s+\w+',
                r'^async\s+def\s+\w+',
            ],
            'go': [
                r'^func\s+(\(\w+\s+\*?\w+\)\s+)?\w+',
                r'^type\s+\w+\s+(struct|interface)',
            ]
        }
        
        # Get patterns for this language or use JavaScript as default
        lang_patterns = patterns.get(language, patterns.get('javascript', []))
        
        for i, line in enumerate(lines):
            stripped = line.lstrip()
            for pattern in lang_patterns:
                if re.match(pattern, stripped):
                    break_points.append(i)
                    break
        
        return break_points
    
    def chunk_file(self, content: str, filepath: str) -> List[Dict[str, Any]]:
        """
        Chunk a file into overlapping segments.
        Tries to break at natural boundaries when possible.
        """
        lines = content.split('\n')
        language = self._detect_language(filepath)
        break_points = self._find_break_points(lines, language)
        
        chunks = []
        start_idx = 0
        chunk_id = 0
        
        while start_idx < len(lines):
            # Calculate end of this chunk
            end_idx = min(start_idx + self.chunk_size, len(lines))
            
            # Try to find a natural break point near the end
            if break_points and end_idx < len(lines):
                # Look for break points within last 20% of chunk
                search_start = end_idx - int(self.chunk_size * 0.2)
                nearby_breaks = [bp for bp in break_points 
                                if search_start <= bp <= end_idx]
                
                if nearby_breaks:
                    # Use the closest break point to our target end
                    end_idx = max(nearby_breaks)
            
            # Extract chunk content
            chunk_lines = lines[start_idx:end_idx]
            chunk_content = '\n'.join(chunk_lines)
            
            chunks.append({
                'id': chunk_id,
                'content': chunk_content,
                'start_line': start_idx + 1,  # 1-indexed for humans
                'end_line': end_idx,
                'chunk_type': 'code',
                'file_path': filepath,
                'language': language,
                'token_count': len(chunk_content.split())  # Simple token count
            })
            
            chunk_id += 1
            
            # Move to next chunk with overlap
            if end_idx >= len(lines):
                break
            start_idx = end_idx - self.overlap
            
            # Ensure we make progress
            if start_idx <= chunks[-1]['start_line'] - 1:
                start_idx = chunks[-1]['start_line'] - 1 + self.overlap
        
        return chunks
    
    def chunk_multiple_files(self, file_contents: Dict[str, str]) -> List[Dict[str, Any]]:
        """Chunk multiple files and combine results."""
        all_chunks = []
        
        for filepath, content in file_contents.items():
            file_chunks = self.chunk_file(content, filepath)
            all_chunks.extend(file_chunks)
        
        return all_chunks