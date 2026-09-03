"""
Convenience launcher for the Python backend.

Usage:
    python run.py

Set environment variables to customize:
    PORT            Backend port (default 4000)
    ADMIN_NAME      Default admin username (default admin)
    ADMIN_PASSWORD  Default admin password (default admin)
    SECRET_KEY      Flask session secret (change in production)
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend" / "app.py"

if not BACKEND.exists():
    print(f"Backend entry point not found: {BACKEND}")
    sys.exit(1)

subprocess.run([sys.executable, str(BACKEND)], cwd=ROOT)
