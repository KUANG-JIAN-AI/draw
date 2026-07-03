import argparse
import base64
import binascii
from datetime import datetime
import json
import os
from pathlib import Path
import re

import gevent.monkey
gevent.monkey.patch_all()

import urllib.error
import urllib.request
from gevent.lock import RLock

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.urandom(24).hex()
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent")

DEFAULT_ROOM = "lobby"
DEFAULT_NAME = "匿名"
AGNES_IMAGE_ENDPOINT = "https://apihub.agnes-ai.com/v1/images/generations"
AGNES_IMAGE_MODELS = {"agnes-image-2.1-flash", "agnes-image-2.0-flash"}
AGNES_IMAGE_SIZES = {"1024x1024", "1024x768", "768x1024"}
SAVED_IMAGES_DIR = Path(__file__).resolve().parent / "saved-images"
DATA_URL_PATTERN = re.compile(r"^data:image/(?P<ext>png|jpeg|jpg|webp);base64,(?P<data>.+)$", re.DOTALL)
IMAGE_EXTENSIONS_BY_CONTENT_TYPE = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
}

action_history = {}
room_members = {}
sid_room = {}
_lock = RLock()


def _decode_data_url(data_url):
    match = DATA_URL_PATTERN.match(data_url or "")
    if not match:
        raise ValueError("Expected a PNG, JPEG, or WebP data URL")

    extension = "jpg" if match.group("ext") == "jpeg" else match.group("ext")
    try:
        image_bytes = base64.b64decode(match.group("data"), validate=True)
    except binascii.Error as error:
        raise ValueError("Invalid base64 image data") from error

    return image_bytes, extension


def _read_image_source(source):
    if isinstance(source, str) and source.startswith("data:image/"):
        return _decode_data_url(source)

    if isinstance(source, str) and source.startswith(("http://", "https://")):
        image_request = urllib.request.Request(source, headers={"User-Agent": "gesture-draw/1.0"})
        with urllib.request.urlopen(image_request, timeout=60) as response:
            content_type = response.headers.get_content_type()
            extension = IMAGE_EXTENSIONS_BY_CONTENT_TYPE.get(content_type)
            if not extension:
                raise ValueError(f"Unsupported image content type: {content_type}")
            return response.read(), extension

    raise ValueError("Expected an image data URL or image URL")


def _save_image_source(source, stem):
    image_bytes, extension = _read_image_source(source)
    SAVED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    file_path = SAVED_IMAGES_DIR / f"{stem}.{extension}"
    file_path.write_bytes(image_bytes)
    return file_path


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/generate-image/status")
def generate_image_status():
    return jsonify({"configured": bool(os.environ.get("AGNES_API_KEY"))})


@app.post("/api/save-generated-images")
def save_generated_images():
    data = request.get_json(silent=True) or {}
    drawing_image = data.get("drawingImage")
    generated_image = data.get("generatedImage")

    if not drawing_image or not generated_image:
        return jsonify({"error": "Missing drawingImage or generatedImage"}), 400

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    try:
        drawing_path = _save_image_source(drawing_image, f"{timestamp}-drawing")
        generated_path = _save_image_source(generated_image, f"{timestamp}-generated")
    except (ValueError, urllib.error.URLError, TimeoutError) as error:
        app.logger.warning("Could not save generated images: %s", error)
        return jsonify({"error": "Could not save generated images", "details": str(error)}), 400

    return jsonify({
        "drawingPath": str(drawing_path.relative_to(Path(__file__).resolve().parent)),
        "generatedPath": str(generated_path.relative_to(Path(__file__).resolve().parent)),
    })


@app.post("/api/generate-image")
def generate_image():
    api_key = os.environ.get("AGNES_API_KEY")
    if not api_key:
        return jsonify({"error": "请先设置环境变量 AGNES_API_KEY"}), 400

    data = request.get_json(silent=True) or {}
    image = data.get("image")
    prompt = (data.get("prompt") or "").strip()
    model = data.get("model") or "agnes-image-2.1-flash"
    size = data.get("size") or "1024x768"

    if not image or not isinstance(image, str) or not image.startswith("data:image/"):
        return jsonify({"error": "缺少有效的画布图片"}), 400
    if not prompt:
        return jsonify({"error": "请输入生成提示词"}), 400
    if model not in AGNES_IMAGE_MODELS:
        return jsonify({"error": "不支持的 Agnes 图像模型"}), 400
    if size not in AGNES_IMAGE_SIZES:
        return jsonify({"error": "不支持的图片尺寸"}), 400

    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "extra_body": {
            "image": [image],
            "response_format": "b64_json",
        },
    }
    body = json.dumps(payload).encode("utf-8")
    agnes_request = urllib.request.Request(
        AGNES_IMAGE_ENDPOINT,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(agnes_request, timeout=180) as response:
            response_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        error_body = error.read().decode("utf-8", errors="replace")
        app.logger.warning("Agnes API request failed (%s): %s", error.code, error_body[:1000])
        return jsonify({"error": "Agnes API 请求失败", "details": error_body}), error.code
    except urllib.error.URLError as error:
        app.logger.warning("Could not connect to Agnes API: %s", error.reason)
        return jsonify({"error": "无法连接 Agnes API", "details": str(error.reason)}), 502
    except TimeoutError:
        app.logger.warning("Agnes API request timed out")
        return jsonify({"error": "Agnes API 请求超时"}), 504

    try:
        return jsonify(json.loads(response_body))
    except json.JSONDecodeError:
        return jsonify({"error": "Agnes API 返回了无法解析的内容"}), 502


@socketio.on("connect")
def handle_connect():
    pass


@socketio.on("join_room")
def handle_join_room(data):
    if not isinstance(data, dict):
        return
    room = data.get("room") or DEFAULT_ROOM
    name = data.get("name") or DEFAULT_NAME
    sid = request.sid
    join_room(room)
    with _lock:
        sid_room[sid] = room
        members = room_members.setdefault(room, [])
        if not any(m["sid"] == sid for m in members):
            members.append({"sid": sid, "name": name})
        action_history.setdefault(room, [])
    emit("action_history", action_history.get(room, []), room=sid)
    emit("room_members", [m["name"] for m in room_members.get(room, [])], room=room)


@socketio.on("leave_room")
def handle_leave_room(data):
    if not isinstance(data, dict):
        return
    room = data.get("room")
    sid = request.sid
    leave_room(room)
    with _lock:
        sid_room.pop(sid, None)
        members = room_members.get(room, [])
        room_members[room] = [m for m in members if m["sid"] != sid]
    emit("room_members", [m["name"] for m in room_members.get(room, [])], room=room)


@socketio.on("draw_line")
def handle_draw_line(data):
    if not isinstance(data, dict):
        return
    room = data.get("room") or DEFAULT_ROOM
    entry = {k: v for k, v in data.items() if k != "room"}
    with _lock:
        action_history.setdefault(room, []).append(entry)
    emit("draw_line", entry, room=room, include_self=False)


@socketio.on("clear_canvas")
def handle_clear_canvas(data):
    if not isinstance(data, dict):
        return
    room = data.get("room") or DEFAULT_ROOM
    with _lock:
        action_history[room] = []
    emit("clear_canvas", room=room, include_self=False)


@socketio.on("undo")
def handle_undo(data):
    if not isinstance(data, dict):
        return
    room = data.get("room") or DEFAULT_ROOM
    with _lock:
        if action_history.get(room):
            action_history[room].pop()
        history = list(action_history.get(room, []))
    emit("undo", history, room=room)


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    with _lock:
        room = sid_room.pop(sid, None)
        if room:
            members = room_members.get(room, [])
            room_members[room] = [m for m in members if m["sid"] != sid]
    if room:
        emit("room_members", [m["name"] for m in room_members.get(room, [])], room=room)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the gesture drawing Flask app.")
    parser.add_argument("--host", default="0.0.0.0", help="Host address to bind")
    parser.add_argument("--port", type=int, default=5000, help="Port number to listen on")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()
    socketio.run(app, host=args.host, port=args.port, debug=args.debug)
