import argparse
import base64
import binascii
from datetime import datetime
import json
import os
from pathlib import Path
import re
import math
import time

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
socketio = SocketIO(app, async_mode="gevent")

app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
MAX_ACTIONS = 30000
MAX_IMAGE_BYTES = 10 * 1024 * 1024
_generation_times = {}

DEFAULT_ROOM = "lobby"
DEFAULT_NAME = "匿名"
AGNES_IMAGE_ENDPOINT = "https://apihub.agnes-ai.com/v1/images/generations"
OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/edits"
IMAGE_MODELS = {
    "OpenAI": {"gpt-image-2.5-flare": "GPT Image 2.5 Flare", "gpt-image-2.5-sunburst": "GPT Image 2.5 Sunburst"},
    "Agnes": {"agnes-image-2.1-flash": "2.1 Flash", "agnes-image-2.0-flash": "2.0 Flash"},
}
IMAGE_SIZES = ("1024x1024", "1024x768", "768x1024")
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

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ValueError("Image is too large")
    signatures = {"png": b"\x89PNG\r\n\x1a\n", "jpg": b"\xff\xd8\xff", "webp": b"RIFF"}
    if not image_bytes.startswith(signatures[extension]):
        raise ValueError("Image format does not match content")
    return image_bytes, extension


def _read_image_source(source):
    if isinstance(source, str) and source.startswith("data:image/"):
        return _decode_data_url(source)


    raise ValueError("Expected an image data URL or image URL")


def _save_image_source(source, stem):
    image_bytes, extension = _read_image_source(source)
    SAVED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    file_path = SAVED_IMAGES_DIR / f"{stem}.{extension}"
    file_path.write_bytes(image_bytes)
    return file_path


def image_provider():
    if os.environ.get("OPENAI_API_KEY") or not os.environ.get("AGNES_API_KEY"):
        return "OpenAI"
    return "Agnes"


@app.route("/")
def index():
    return render_template("index.html", image_models=IMAGE_MODELS[image_provider()])


@app.get("/api/generate-image/status")
def generate_image_status():
    provider = image_provider()
    return jsonify({"provider": provider, "configured": bool(os.environ.get(f"{provider.upper()}_API_KEY"))})


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
    provider = image_provider()
    key_name = f"{provider.upper()}_API_KEY"
    api_key = os.environ.get(key_name)
    if not api_key:
        return jsonify({"error": f"请在服务器上设置 {key_name}"}), 503

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "缺少画布数据"}), 400
    image = data.get("image")
    try:
        _read_image_source(image)
    except ValueError:
        return jsonify({"error": "缺少有效的画布图片"}), 400
    prompt = data.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify({"error": "请输入生成提示词"}), 400
    models = IMAGE_MODELS[provider]
    model = data.get("model") or next(iter(models))
    size = data.get("size") or "1024x768"
    if not isinstance(model, str) or model not in models:
        return jsonify({"error": f"不支持的 {provider} 图像模型，请刷新页面"}), 400
    if size not in IMAGE_SIZES:
        return jsonify({"error": "不支持的图片尺寸"}), 400

    now = time.monotonic()
    address = request.remote_addr
    with _lock:
        for key, started in list(_generation_times.items()):
            if now - started > 60:
                del _generation_times[key]
        if address in _generation_times:
            return jsonify({"error": "请稍候再生成图片"}), 429
        _generation_times[address] = now
    payload = {"model": model, "prompt": prompt.strip(), "size": size}
    if provider == "OpenAI":
        endpoint = OPENAI_IMAGE_ENDPOINT
        payload.update(images=[{"image_url": image}], quality="medium", output_format="png", n=1)
    else:
        endpoint = AGNES_IMAGE_ENDPOINT
        payload["extra_body"] = {"image": [image], "response_format": "b64_json"}
    body = json.dumps(payload).encode("utf-8")
    image_request = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(image_request, timeout=180) as response:
            response_body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        app.logger.warning("%s image request returned HTTP %s", provider, error.code)
        hints = {401: "请检查服务器的 API 密钥", 403: "请检查项目的图像模型权限", 429: "请检查 API 额度或稍后重试"}
        return jsonify({"error": f"{provider} HTTP {error.code} · {hints.get(error.code, '图像编辑请求失败')}"}), error.code
    except urllib.error.URLError as error:
        app.logger.warning("Could not connect to %s: %s", provider, error.reason)
        return jsonify({"error": f"无法连接 {provider} API"}), 502
    except TimeoutError:
        return jsonify({"error": f"{provider} API 请求超时"}), 504

    try:
        return jsonify(json.loads(response_body))
    except json.JSONDecodeError:
        return jsonify({"error": f"{provider} API 返回了无法解析的内容"}), 502


def _remove_member(sid):
    room = sid_room.pop(sid, None)
    if room:
        leave_room(room)
        room_members[room] = [m for m in room_members.get(room, []) if m["sid"] != sid]
        emit("room_members", {"room": room, "members": [m["name"] for m in room_members[room]]}, room=room)
        if not room_members[room]:
            room_members.pop(room, None)
            action_history.pop(room, None)


@socketio.on("join_room")
def handle_join_room(data):
    if not isinstance(data, dict):
        return {"ok": False}
    room = data.get("room") or DEFAULT_ROOM
    name = data.get("name") or DEFAULT_NAME
    if not isinstance(room, str) or not isinstance(name, str) or len(room) > 80 or len(name) > 40:
        return {"ok": False}
    with _lock:
        if sid_room.get(request.sid) != room:
            _remove_member(request.sid)
        join_room(room)
        sid_room[request.sid] = room
        members = room_members.setdefault(room, [])
        members[:] = [m for m in members if m["sid"] != request.sid]
        members.append({"sid": request.sid, "name": name})
        history = action_history.setdefault(room, [])
        emit("action_history", {"room": room, "history": [{k: v for k, v in a.items() if k != "previous"} for a in history]}, room=request.sid)
        emit("room_members", {"room": room, "members": [m["name"] for m in members]}, room=room)
    return {"ok": True, "room": room}


@socketio.on("leave_room")
def handle_leave_room(data=None):
    with _lock:
        _remove_member(request.sid)


def _event_room(data):
    room = sid_room.get(request.sid)
    return room if isinstance(data, dict) and data.get("room") == room else None


@socketio.on("draw_line")
def handle_draw_line(data):
    room = _event_room(data)
    if not room:
        return
    for key in ("from", "to"):
        point = data.get(key)
        if not isinstance(point, dict) or any(type(point.get(axis)) not in (int, float) or not math.isfinite(point[axis]) or not 0 <= point[axis] <= 1 for axis in ("x", "y")):
            return
    if type(data.get("size")) not in (int, float) or data["size"] not in (8, 24):
        return
    if not isinstance(data.get("color"), str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", data["color"]):
        return
    stroke = data.get("strokeId")
    if not isinstance(stroke, str) or len(stroke) > 80:
        return
    entry = {k: data[k] for k in ("from", "to", "size", "color", "strokeId")}
    entry.update(type="draw_line", erasing=data.get("erasing") is True, author=request.sid)
    with _lock:
        history = action_history[room]
        if len(history) >= MAX_ACTIONS:
            emit("history_limit", {"room": room, "history": [{k: v for k, v in a.items() if k != "previous"} for a in history]})
            return
        history.append(entry)
        emit("draw_line", {"room": room, "action": entry}, room=room, include_self=False)


@socketio.on("clear_canvas")
def handle_clear_canvas(data):
    room = _event_room(data)
    if room:
        with _lock:
            previous = [a for a in action_history[room] if a["type"] != "clear"]
            action_history[room] = [{"type": "clear", "author": request.sid, "previous": previous}]
            emit("action_history", {"room": room, "history": [{k: v for k, v in a.items() if k != "previous"} for a in action_history[room]]}, room=room)


@socketio.on("undo")
def handle_undo(data):
    room = _event_room(data)
    if room:
        with _lock:
            history = action_history[room]
            own = next((a for a in reversed(history) if a.get("author") == request.sid), None)
            if own:
                if own["type"] == "clear":
                    history[:] = own.get("previous", []) + [a for a in history if a is not own]
                else:
                    history[:] = [a for a in history if not (a.get("author") == request.sid and a.get("strokeId") == own["strokeId"])]
            emit("action_history", {"room": room, "history": [{k: v for k, v in a.items() if k != "previous"} for a in history]}, room=room)


@socketio.on("disconnect")
def handle_disconnect():
    with _lock:
        _remove_member(request.sid)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the gesture drawing Flask app.")
    parser.add_argument("--host", default="0.0.0.0", help="Host address to bind")
    parser.add_argument("--port", type=int, default=5000, help="Port number to listen on")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()
    socketio.run(app, host=args.host, port=args.port, debug=args.debug)
