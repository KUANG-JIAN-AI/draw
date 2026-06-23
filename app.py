import argparse

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__, static_folder="static", template_folder="templates")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent")

# Per-room action history and member tracking
action_history = {}       # room -> [actions]
room_members = {}         # room -> [{sid, name}]
sid_room = {}             # sid -> room


@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("connect")
def handle_connect():
    # no-op: client should join a room explicitly
    pass


@socketio.on("join_room")
def handle_join_room(data):
    room = data.get("room") or "lobby"
    name = data.get("name") or "匿名"
    sid = request.sid
    join_room(room)
    sid_room[sid] = room

    members = room_members.setdefault(room, [])
    # avoid duplicate entries for same sid
    if not any(m["sid"] == sid for m in members):
        members.append({"sid": sid, "name": name})

    # ensure history exists
    action_history.setdefault(room, [])

    # send current history to the joining client only
    emit("action_history", action_history[room], room=sid)
    # broadcast updated member list to the room
    emit("room_members", [m["name"] for m in members], room=room)


@socketio.on("leave_room")
def handle_leave_room(data):
    room = data.get("room")
    sid = request.sid
    leave_room(room)
    sid_room.pop(sid, None)
    members = room_members.get(room, [])
    room_members[room] = [m for m in members if m["sid"] != sid]
    emit("room_members", [m["name"] for m in room_members.get(room, [])], room=room)


@socketio.on("draw_line")
def handle_draw_line(data):
    room = data.get("room") or "lobby"
    action_history.setdefault(room, []).append(data)
    emit("draw_line", data, room=room, include_self=False)


@socketio.on("clear_canvas")
def handle_clear_canvas(data):
    room = data.get("room") or "lobby"
    action_history[room] = []
    emit("clear_canvas", room=room, include_self=False)


@socketio.on("undo")
def handle_undo(data):
    room = data.get("room") or "lobby"
    if action_history.get(room):
        action_history[room].pop()
    emit("undo", action_history.get(room, []), room=room)


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    room = sid_room.pop(sid, None)
    if room:
        members = room_members.get(room, [])
        room_members[room] = [m for m in members if m["sid"] != sid]
        emit("room_members", [m["name"] for m in room_members.get(room, [])], room=room)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the gesture drawing Flask app.")
    parser.add_argument("--host", default="0.0.0.0", help="Host address to bind")
    parser.add_argument("--port", type=int, default=5000, help="Port number to listen on")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()

    socketio.run(app, host=args.host, port=args.port, debug=args.debug)
