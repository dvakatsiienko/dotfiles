#!/usr/bin/env python3
"""
Shared utilities for libsource management.
Provides missing file detection, auto-recovery, and common operations.
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path


def get_config_file():
    """Get path to libsource config file."""
    return Path.home() / ".dotfiles" / "membank" / "libsource" / ".libsource-config.json"


def get_membank_dir():
    """Get path to libsource directory."""
    return Path.home() / ".dotfiles" / "membank" / "libsource" / "sources"


def get_libsource_path(lib_name):
    """Get path to specific libsource file."""
    return get_membank_dir() / f"libsource-{lib_name}.txt"


def load_config():
    """Load the libsource configuration file."""
    config_file = get_config_file()
    
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {"libraries": {}, "last_updated": None, "version": "1.0"}


def save_config(config):
    """Save the libsource configuration file."""
    config_file = get_config_file()
    config_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=4)


def calculate_loc(file_path):
    """Calculate lines of code in a libsource file."""
    try:
        result = subprocess.run(['wc', '-l', str(file_path)], 
                              capture_output=True, text=True, check=True)
        # Extract the number from "12345 filename" output
        loc_count = int(result.stdout.strip().split()[0])
        return loc_count
    except (subprocess.CalledProcessError, ValueError, IndexError):
        return None


def format_duration(seconds):
    """Convert seconds to human readable format: 1h 2m 16s"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60) 
    secs = int(seconds % 60)
    
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 or not parts:  # Always show seconds if nothing else
        parts.append(f"{secs}s")
    
    return " ".join(parts)


def detect_project_type(path):
    """Detect project type for smart exclusions."""
    path = Path(path)
    
    if (path / "package.json").exists():
        return "node"
    elif (path / "requirements.txt").exists() or (path / "pyproject.toml").exists():
        return "python"  
    elif (path / "Cargo.toml").exists():
        return "rust"
    elif (path / "go.mod").exists():
        return "go"
    elif (path / "pom.xml").exists() or (path / "build.gradle").exists():
        return "java"
    else:
        return "generic"


def get_smart_exclusions(project_type):
    """Get smart exclusion patterns based on project type."""
    
    # Common exclusions for all projects
    common_excludes = [
        ".git/*", ".DS_Store", "*.log", "*.tmp", "*.cache",
        ".env*", "coverage/*", "*.coverage", ".nyc_output/*"
    ]
    
    # Project-specific exclusions
    project_excludes = {
        "node": [
            "node_modules/*", "dist/*", "build/*", "out/*", 
            ".next/*", ".nuxt/*", ".vite/*", ".turbo/*",
            "pnpm-lock.yaml", "package-lock.json", "yarn.lock",
            ".yarn/*", ".pnp.*", "npm-debug.log*", "yarn-debug.log*",
            "*.tsbuildinfo", ".eslintcache"
        ],
        "python": [
            "__pycache__/*", "*.pyc", "*.pyo", "*.pyd", 
            "venv/*", ".venv/*", "env/*", ".env/*",
            "dist/*", "build/*", "*.egg-info/*",
            ".pytest_cache/*", ".mypy_cache/*", ".tox/*"
        ],
        "rust": [
            "target/*", "Cargo.lock"
        ],
        "go": [
            "vendor/*", "*.exe", "*.dll", "*.so", "*.dylib"
        ],
        "java": [
            "target/*", "build/*", "*.class", "*.jar", "*.war"
        ],
        "generic": []
    }
    
    return common_excludes + project_excludes.get(project_type, [])


def fetch_libsource(lib_name, source_path, silent=False):
    """
    Fetch library source using gitingest (from URL or local path).
    For local paths, automatically applies smart filtering to exclude common non-source files.
    Returns (file_size, generation_time) on success, (None, None) on failure.
    """
    import threading
    import time
    
    membank_dir = get_membank_dir()
    output_file = membank_dir / f"libsource-{lib_name}.txt"
    
    # Validate and handle different source types
    if source_path.startswith('https://github.com/'):
        # Remote GitHub repository
        if not silent:
            print(f"📥 Fetching {lib_name} source from {source_path}...")
        source_type = "remote"
    elif Path(source_path).exists():
        # Local repository or directory
        resolved_path = str(Path(source_path).resolve())
        if not silent:
            print(f"📥 Processing {lib_name} source from local path: {resolved_path}...")
        source_path = resolved_path  # Use absolute path
        source_type = "local"
    else:
        # Invalid source
        if not silent:
            print(f"❌ Invalid source for {lib_name}: {source_path}")
            print("   Path doesn't exist and isn't a valid GitHub URL")
        return None
    
    # Build gitingest command with smart exclusions for local paths
    cmd = [
        "gitingest", 
        source_path,
        "--output", str(output_file),
    ]
    
    # Add smart exclusions for local directories
    if source_type == "local":
        project_type = detect_project_type(source_path)
        exclusions = get_smart_exclusions(project_type)
        
        if not silent:
            print(f"🧠 Detected project type: {project_type}")
            print(f"🚫 Applying {len(exclusions)} exclusion patterns...")
        
        # Add each exclusion pattern as a separate --exclude-pattern flag
        for pattern in exclusions:
            cmd.extend(["--exclude-pattern", pattern])
    
    # Progress indication (only if not silent)
    progress_active = True
    start_time = time.time()
    
    def show_progress():
        """Show animated progress while gitingest is running."""
        spinners = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        i = 0
        while progress_active:
            elapsed = int(time.time() - start_time)
            mins, secs = divmod(elapsed, 60)
            time_str = f"{mins:02d}:{secs:02d}"
            print(f"\r{spinners[i % len(spinners)]} Processing... [{time_str}]", end="", flush=True)
            i += 1
            time.sleep(0.1)
    
    # Start progress thread (only if not silent)
    if not silent:
        progress_thread = threading.Thread(target=show_progress, daemon=True)
        progress_thread.start()
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        # Stop progress indication
        if not silent:
            progress_active = False
            print("\r" + " " * 50 + "\r", end="")  # Clear progress line
        
        # Get file size and calculate generation time
        file_size = output_file.stat().st_size
        elapsed = time.time() - start_time
        generation_time = format_duration(elapsed)
        
        if not silent:
            print(f"✅ Successfully processed {lib_name} in {generation_time}! ({file_size / 1024 / 1024:.1f} MB)")
        
        return file_size, generation_time
        
    except subprocess.CalledProcessError as e:
        # Stop progress indication
        if not silent:
            progress_active = False
            print("\r" + " " * 50 + "\r", end="")  # Clear progress line
            print(f"❌ Error fetching {lib_name}: {e}")
            print(f"STDERR: {e.stderr}")
        return None, None


def ensure_libsource_exists(lib_name, config=None, silent=False):
    """
    Ensure libsource file exists, fetch if missing.
    Returns True if file exists/was fetched, False if failed.
    """
    if config is None:
        config = load_config()
    
    # Check if library is registered
    if lib_name not in config["libraries"]:
        if not silent:
            print(f"❌ Library '{lib_name}' not found in collection.")
        return False
    
    # Check if file exists
    file_path = get_libsource_path(lib_name)
    if file_path.exists():
        return True
    
    # File missing, attempt to fetch
    library_info = config["libraries"][lib_name]
    source_path = library_info["url"]
    
    if not silent:
        print(f"🔍 Libsource file missing for {lib_name}, auto-fetching...")
    
    file_size, generation_time = fetch_libsource(lib_name, source_path, silent)
    if file_size is None:
        return False
    
    # Update config with fresh metadata
    new_loc = calculate_loc(file_path)
    config["libraries"][lib_name].update({
        "last_updated": datetime.now().isoformat(),
        "file_size": file_size,
        "loc": new_loc,
        "generation_time": generation_time
    })
    save_config(config)
    
    return True


def verify_all_libsources(config=None, silent=False):
    """
    Check which libsource files are missing.
    Returns (existing_libs, missing_libs) tuple.
    """
    if config is None:
        config = load_config()
    
    existing = []
    missing = []
    
    for lib_name in config["libraries"]:
        file_path = get_libsource_path(lib_name)
        if file_path.exists():
            existing.append(lib_name)
        else:
            missing.append(lib_name)
    
    if not silent and missing:
        print(f"🔍 Found {len(missing)} missing libsource files:")
        for lib in missing:
            print(f"  • {lib}")
    
    return existing, missing


def restore_missing_libsources(missing_libs=None, config=None):
    """
    Restore all missing libsource files from config.
    Returns (success_count, total_count).
    """
    if config is None:
        config = load_config()
    
    if missing_libs is None:
        _, missing_libs = verify_all_libsources(config, silent=True)
    
    if not missing_libs:
        print("✨ All libsource files are already present!")
        return 0, 0
    
    print(f"🔄 Restoring {len(missing_libs)} missing libsource files...")
    
    success_count = 0
    for i, lib_name in enumerate(missing_libs, 1):
        print(f"\n[{i}/{len(missing_libs)}] Restoring {lib_name}...")
        if ensure_libsource_exists(lib_name, config):
            success_count += 1
    
    print(f"\n✅ Restoration complete: {success_count}/{len(missing_libs)} successful")
    return success_count, len(missing_libs)