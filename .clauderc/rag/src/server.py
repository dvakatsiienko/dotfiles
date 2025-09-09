"""
FastAPI server for RAG search API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from search import SearchEngine

# Initialize FastAPI app
app = FastAPI(
    title="Libsource RAG Search API",
    description="Semantic search for libsource code repositories",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global search engine instance
search_engine = None


class SearchRequest(BaseModel):
    """Search request model."""
    query: str = Field(..., description="Search query string")
    library: str = Field(..., description="Library name to search in (e.g., 'react', 'ai')")
    limit: int = Field(5, description="Maximum number of results to return", ge=1, le=20)


class MultiSearchRequest(BaseModel):
    """Multi-library search request."""
    query: str = Field(..., description="Search query string")
    limit_per_library: int = Field(3, description="Max results per library", ge=1, le=10)


class ChunkRequest(BaseModel):
    """Request for full chunk content."""
    chunk_id: int = Field(..., description="Chunk ID to retrieve")


@app.on_event("startup")
async def startup_event():
    """Initialize search engine on startup."""
    global search_engine
    search_engine = SearchEngine()
    search_engine.__enter__()
    print("✅ Search engine initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up search engine on shutdown."""
    global search_engine
    if search_engine:
        search_engine.__exit__(None, None, None)
    print("👋 Search engine shutdown")


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Libsource RAG Search API",
        "version": "1.0.0",
        "endpoints": {
            "/api/search": "Search within a specific library",
            "/api/search/all": "Search across all libraries",
            "/api/chunk/{chunk_id}": "Get full chunk content",
            "/api/libraries": "List available libraries",
            "/api/stats": "Get database statistics"
        }
    }


@app.post("/api/search")
async def search(request: SearchRequest) -> Dict[str, Any]:
    """
    Search for code chunks within a specific library.
    
    Target: <500ms response time
    Returns: Top matching chunks with scores
    """
    try:
        results = search_engine.search(
            query=request.query,
            library=request.library,
            limit=request.limit
        )
        
        # Check response time
        if results['search_time_ms'] > 500:
            print(f"⚠️  Slow search: {results['search_time_ms']}ms for query: {request.query}")
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search/all")
async def search_all(request: MultiSearchRequest) -> Dict[str, Any]:
    """Search across all available libraries."""
    try:
        results = search_engine.search_all_libraries(
            query=request.query,
            limit_per_library=request.limit_per_library
        )
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chunk/{chunk_id}")
async def get_chunk(chunk_id: int) -> Dict[str, Any]:
    """Get full content of a specific chunk."""
    content = search_engine.get_chunk_content(chunk_id)
    
    if content is None:
        raise HTTPException(status_code=404, detail=f"Chunk {chunk_id} not found")
    
    return {
        "chunk_id": chunk_id,
        "content": content
    }


@app.get("/api/libraries")
async def list_libraries() -> Dict[str, Any]:
    """List all available libraries in the database."""
    try:
        search_engine.cursor.execute("""
            SELECT library, COUNT(*) as chunk_count
            FROM chunks
            GROUP BY library
            ORDER BY library
        """)
        
        libraries = []
        for row in search_engine.cursor.fetchall():
            libraries.append({
                "name": row[0],
                "chunk_count": row[1]
            })
        
        return {
            "libraries": libraries,
            "total": len(libraries)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats() -> Dict[str, Any]:
    """Get database statistics."""
    try:
        # Total chunks
        search_engine.cursor.execute("SELECT COUNT(*) FROM chunks")
        total_chunks = search_engine.cursor.fetchone()[0]
        
        # Total libraries
        search_engine.cursor.execute("SELECT COUNT(DISTINCT library) FROM chunks")
        total_libraries = search_engine.cursor.fetchone()[0]
        
        # Average chunk size
        search_engine.cursor.execute("SELECT AVG(LENGTH(content)) FROM chunks")
        avg_chunk_size = search_engine.cursor.fetchone()[0]
        
        # Tags distribution
        search_engine.cursor.execute("""
            SELECT semantic_tags, COUNT(*) 
            FROM chunks 
            WHERE semantic_tags != '[]'
            GROUP BY semantic_tags
            LIMIT 10
        """)
        
        return {
            "total_chunks": total_chunks,
            "total_libraries": total_libraries,
            "average_chunk_size": int(avg_chunk_size) if avg_chunk_size else 0,
            "database_ready": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "rag-search"}


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting RAG Search API server...")
    print("📍 API docs available at: http://localhost:1408/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=1408,
        log_level="info"
    )