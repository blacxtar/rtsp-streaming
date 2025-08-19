import os
import uuid
import shutil
import subprocess
import signal
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "livesitter_demo")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
FFMPEG_BIN = os.getenv("FFMPEG_BIN", "ffmpeg")
STREAMS_DIR = os.path.abspath(os.getenv("STREAMS_DIR", "./streams"))

os.makedirs(STREAMS_DIR, exist_ok=True)

# --- App ---
app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS.split(','))

# --- DB ---
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
overlays_col = db["overlays"]
streams_col = db["streams"]  # Collection for streams
overlays_col.create_index([("streamId", ASCENDING)])
streams_col.create_index([("id", ASCENDING)], unique=True)

# --- In-memory registry of NEW ffmpeg processes ---
# Used for quick access, but the DB is the source of truth.
STREAMS = {}

def ok(data=None, **extra):
    base = {"ok": True}
    if data is not None:
        base["data"] = data
    base.update(extra)
    return jsonify(base)

def err(msg, code=400):
    return jsonify({"ok": False, "error": msg}), code

# ------------------ Health ------------------
@app.get("/api/health")
def health():
    return ok({"status": "up"})

# ------------------ HLS Static ------------------
@app.get("/streams/<stream_id>/<path:filename>")
def serve_hls(stream_id, filename):
    folder = os.path.join(STREAMS_DIR, stream_id)
    if not os.path.isdir(folder):
        stream_doc = streams_col.find_one({"id": stream_id})
        if not stream_doc:
            return err("stream not found", 404)
        folder = stream_doc["dir"]
    return send_from_directory(folder, filename, as_attachment=False)

# ------------------ Streaming Control ------------------
@app.post("/api/streams/start")
def start_stream():
    payload = request.get_json(silent=True) or {}
    rtsp_url = payload.get("rtspUrl")
    if not rtsp_url:
        return err("missing rtspUrl")

    stream_id = str(uuid.uuid4())
    out_dir = os.path.join(STREAMS_DIR, stream_id)
    os.makedirs(out_dir, exist_ok=True)
    playlist = os.path.join(out_dir, "index.m3u8")

    cmd = [FFMPEG_BIN, "-nostdin", "-rtsp_transport", "tcp", "-i", rtsp_url, "-c:v", "libx264", "-preset", "veryfast", "-tune", "zerolatency", "-c:a", "aac", "-f", "hls", "-hls_time", "2", "-hls_list_size", "6", "-hls_flags", "delete_segments+append_list+program_date_time", playlist]

    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, cwd=out_dir)
    STREAMS[stream_id] = {"proc": proc, "dir": out_dir, "status": "running"}

    # DB: Save the new stream's information to MongoDB
    stream_doc = {
        "id": stream_id,
        "pid": proc.pid,
        "rtspUrl": rtsp_url,
        "dir": out_dir,
        "status": "running",
        "createdAt": datetime.utcnow()
    }
    streams_col.insert_one(stream_doc)

    hls_url = f"/streams/{stream_id}/index.m3u8"
    return ok({"streamId": stream_id, "hlsUrl": hls_url})

def get_stream_pid(stream_id):
    """Helper to find a stream's process ID, robust to restarts."""
    if stream_id in STREAMS and STREAMS[stream_id].get("proc"):
        return STREAMS[stream_id]["proc"].pid
    
    stream_doc = streams_col.find_one({"id": stream_id})
    return stream_doc.get("pid") if stream_doc else None

@app.post("/api/streams/pause/<stream_id>")
def pause_stream(stream_id):
    pid = get_stream_pid(stream_id)
    if not pid:
        return err("not running", 404)
    try:
        os.kill(pid, signal.SIGSTOP)
        streams_col.update_one({"id": stream_id}, {"$set": {"status": "paused"}})
        if stream_id in STREAMS:
            STREAMS[stream_id]["status"] = "paused"
        return ok({"paused": stream_id})
    except Exception as e:
        return err(f"failed to pause: {e}", 500)

@app.post("/api/streams/resume/<stream_id>")
def resume_stream(stream_id):
    pid = get_stream_pid(stream_id)
    if not pid:
        return err("not running", 404)
    try:
        os.kill(pid, signal.SIGCONT)
        streams_col.update_one({"id": stream_id}, {"$set": {"status": "running"}})
        if stream_id in STREAMS:
            STREAMS[stream_id]["status"] = "running"
        return ok({"resumed": stream_id})
    except Exception as e:
        return err(f"failed to resume: {e}", 500)

@app.post("/api/streams/stop/<stream_id>")
def stop_stream(stream_id):
    pid = get_stream_pid(stream_id)
    if not pid:
        return err("not running", 404)

    stream_doc = streams_col.find_one({"id": stream_id})
    out_dir = stream_doc.get("dir") if stream_doc else None

    try:
        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        pass  # Process already dead
    except Exception:
        try:
            os.kill(pid, signal.SIGKILL)
        except Exception as kill_e:
            print(f"Failed to kill process {pid}: {kill_e}")
    
    STREAMS.pop(stream_id, None)
    streams_col.delete_one({"id": stream_id})

    if out_dir and os.path.isdir(out_dir):
        try:
            shutil.rmtree(out_dir, ignore_errors=True)
        except Exception as e:
            print(f"Error cleaning up directory {out_dir}: {e}")

    return ok({"stopped": stream_id})

@app.get("/api/streams")
def list_streams():
    active_streams = streams_col.find()
    items = []
    for stream in active_streams:
        items.append({
            "streamId": stream["id"],
            "status": stream["status"],
            "hlsUrl": f"/streams/{stream['id']}/index.m3u8"
        })
    return ok(items)

@app.get("/api/streams/status/<stream_id>")
def stream_status(stream_id):
    stream_doc = streams_col.find_one({"id": stream_id})
    if not stream_doc:
        return ok({"streamId": stream_id, "ready": False})
        
    folder = stream_doc["dir"]
    ready = os.path.exists(os.path.join(folder, "index.m3u8"))
    return ok({"streamId": stream_id, "ready": ready})

# ------------------ Overlay CRUD ------------------
# Schema:
# {
#   id: string, streamId: string,
#   type: "text" | "image" | "alert-card",
#   x: number, y: number, width: number, height: number, zIndex: number,
#   createdAt, updatedAt,
#   text?: string, style?: string, imageUrl?: string, data?: object
# }

def clean(doc):
    if not doc:
        return None
    doc.pop("_id", None)
    return doc

@app.get("/api/overlays")
def list_overlays():
    stream_id = request.args.get("streamId")
    q = {"streamId": stream_id} if stream_id else {}
    items = [clean(x) for x in overlays_col.find(q).sort("zIndex", ASCENDING)]
    return ok(items)

@app.post("/api/overlays")
def create_overlay():
    data = request.get_json(silent=True) or {}
    
    common_required = ["streamId", "type", "x", "y", "width", "height", "zIndex"]
    missing = [k for k in common_required if k not in data]
    if missing:
        return err(f"missing common fields: {', '.join(missing)}")

    overlay_type = data.get("type")
    if overlay_type == "text":
        if "text" not in data or "style" not in data:
            return err("missing 'text' or 'style' for text overlay")
    elif overlay_type == "image":
        if "imageUrl" not in data:
            return err("missing 'imageUrl' for image overlay")
    elif overlay_type == "alert-card":
        if "data" not in data:
            return err("missing 'data' for alert-card overlay")
    else:
        return err(f"invalid overlay type: {overlay_type}")

    data["id"] = data.get("id") or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    data["createdAt"] = now
    data["updatedAt"] = now
    
    overlays_col.insert_one(data)
    return ok(clean(data)), 201

@app.put("/api/overlays/<overlay_id>")
def update_overlay(overlay_id):
    updates = request.get_json(silent=True) or {}
    updates.pop("id", None) # Do not allow changing the ID
    updates.pop("streamId", None) # Do not allow changing the streamId
    updates["updatedAt"] = datetime.utcnow().isoformat()
    res = overlays_col.update_one({"id": overlay_id}, {"$set": updates})
    if res.matched_count == 0:
        return err("overlay not found", 404)
    doc = overlays_col.find_one({"id": overlay_id})
    return ok(clean(doc))

@app.delete("/api/overlays/<overlay_id>")
def delete_overlay(overlay_id):
    res = overlays_col.delete_one({"id": overlay_id})
    if res.deleted_count == 0:
        return err("overlay not found", 404)
    return ok({"deleted": True})

# ------------------ Main ------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)