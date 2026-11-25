"""
Deepfake Awareness & Detection System - Local Python Server
Autonomous Forensics Engine & Web Application
"""
import io
import os
import sys
import base64
import json
import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS

import uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles
from starlette.routing import Route, Mount

BASE_DIR = os.path.dirname(__file__)
HTML_FILE_PATH = os.path.join(BASE_DIR, "index.html")

async def homepage(request):
    if os.path.exists(HTML_FILE_PATH):
        with open(HTML_FILE_PATH, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>index.html not found</h1>", status_code=404)

async def health(request):
    return JSONResponse({"status": "healthy", "service": "Deepfake Defense Local Engine"})

routes = [
    Route("/", homepage),
    Route("/api/health", health),
    Mount("/css", StaticFiles(directory=os.path.join(BASE_DIR, "css")), name="css"),
    Mount("/js", StaticFiles(directory=os.path.join(BASE_DIR, "js")), name="js"),
]

app = Starlette(debug=True, routes=routes)

if __name__ == "__main__":
    print("=" * 65)
    print(" 🛡️  DEEPFAKE AWARENESS & DETECTION SYSTEM - ONLINE")
    print("=" * 65)
    print(" Local Web Interface:  http://127.0.0.1:8000")
    print(" Press Ctrl+C to terminate server.")
    print("=" * 65)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
