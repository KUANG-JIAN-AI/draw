import argparse
import os
from gevent.lock import RLock

import gevent.monkey
gevent.monkey.patch_all()

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = os.urandom(24).hex()
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent")

DEFAULT_ROOM = "lobby"
DEFAULT_NAME = "匿名"

action_history = {}
room_members = {}
sid_room = {}
_lock = RLock()


@app.route("/")
def index():
    return render_template("index.html")


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
