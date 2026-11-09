export function createRoomController({ socket, actionHistory, canvas, membersList, roomInput, nameInput, joinRoomButton, setStatus, t }) {
  let currentRoom = null;
  let desiredRoom = null;
  let name = "";
  const replaceHistory = ({ room, history }) => {
    if (room !== desiredRoom) return;
    currentRoom = room;
    actionHistory.splice(0, actionHistory.length, ...history);
    canvas.redrawHistory();
  };
  function join() {
    if (!desiredRoom) return;
    socket.emit("join_room", { room: desiredRoom, name }, (result) => {
      if (result?.ok && result.room === desiredRoom) {
        currentRoom = result.room;
        setStatus(`${t("room_joined")} ${currentRoom}`, "ready");
      } else setStatus(t("room_error"), "error");
    });
  }
  function bindEvents() {
    socket.on("action_history", replaceHistory);
    socket.on("history_limit", (data) => {
      replaceHistory(data);
      setStatus(t("history_limit"), "error");
    });
    socket.on("draw_line", ({ room, action }) => {
      if (room !== currentRoom) return;
      actionHistory.push(action);
      canvas.applyAction(action);
    });
    socket.on("room_members", ({ room, members }) => {
      if (room === desiredRoom) membersList.textContent = `${t("hud_members")}：${members.join("，")}`;
    });
    socket.on("disconnect", () => {
      currentRoom = null;
      setStatus(t("room_disconnected"), "error");
    });
    socket.on("connect", join);
    joinRoomButton.addEventListener("click", () => {
      desiredRoom = roomInput.value.trim() || "lobby";
      name = nameInput.value.trim() || t("anonymous");
      currentRoom = null;
      if (socket.connected) join();
      else setStatus(t("room_disconnected"), "error");
    });
  }
  return { bindEvents, getCurrentRoom: () => currentRoom, isJoining: () => !!desiredRoom && !currentRoom };
}
