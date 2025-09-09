"""
Central configuration for membank system.
Single source of truth for all configuration values.
"""
from pathlib import Path

# Database configuration
DATABASE_NAME = "db.sqlite"
DATABASE_PATH = Path(__file__).parent / DATABASE_NAME

# Server configuration  
SERVER_PORT = 1409
SERVER_HOST = "0.0.0.0"

# Indexing configuration
CHUNK_SIZE = 300
CHUNK_OVERLAP = 20  # 20% overlap

# Libsource configuration
LIBSOURCE_CONFIG = ".libsource-config.json"
LIBSOURCE_DIR = "sources"