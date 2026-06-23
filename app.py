import argparse

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_folder="static", template_folder="templates")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

action_history = []

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("connect")
def handle_connect():
    emit("action_history", action_history)

@socketio.on("draw_line")
def handle_draw_line(data):
    action_history.append(data)
    emit("draw_line", data, broadcast=True, include_self=False)

@socketio.on("clear_canvas")
def handle_clear_canvas():
    action_history.clear()
    emit("clear_canvas", broadcast=True, include_self=False)

@socketio.on("undo")
def handle_undo():
    if action_history:
        action_history.pop()
    emit("undo", action_history, broadcast=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the gesture drawing Flask app.")
    parser.add_argument("--host", default="0.0.0.0", help="Host address to bind")
    parser.add_argument("--port", type=int, default=5000, help="Port number to listen on")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()

    socketio.run(app, host=args.host, port=args.port, debug=args.debug)
