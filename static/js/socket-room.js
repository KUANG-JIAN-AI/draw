export function createRoomController({
  socket,
  actionHistory,
  canvas,
  membersList,
  roomInput,
  nameInput,
  joinRoomButton,
  setStatus,
  t,
}) {
  let currentRoom = null;

  function bindSocketEvents() {
    socket.on("action_history", (history) => {
      actionHistory.length = 0;
      actionHistory.push(...history);
      canvas.redrawHistory();
    });

    socket.on("room_members", (members) => {
      if (!membersList) return;
      const membersLabel = t("hud_members");
      const emptyText = t("hud_empty");
      membersList.textContent = membersLabel + "：" + (members.length ? members.join("，") : emptyText);
    });

    window.addEventListener("language-changed", () => {
      if (membersList && membersList.textContent.includes("：")) {
        const parts = membersList.textContent.split("：");
        const memberNames = parts[1];
        const membersLabel = t("hud_members");
        membersList.textContent = membersLabel + "：" + memberNames;
      }
    });

    socket.on("draw_line", (data) => {
      actionHistory.push(data);
      canvas.applyAction(data);
    });

    socket.on("clear_canvas", () => {
      actionHistory.length = 0;
      canvas.clear();
    });

    socket.on("undo", (history) => {
      actionHistory.length = 0;
      actionHistory.push(...history);
      canvas.redrawHistory();
    });
  }

  function bindRoomEvents() {
    joinRoomButton?.addEventListener("click", () => {
      const room = (roomInput?.value || "").trim() || "lobby";
      const name = (nameInput?.value || "").trim() || `匿名${Math.floor(Math.random() * 9000) + 1000}`;
      currentRoom = room;
      socket.emit("join_room", { room, name });
      setStatus(t("room_joined") + ` ${room}`, "ready");
    });

    window.addEventListener("beforeunload", () => {
      if (currentRoom) socket.emit("leave_room", { room: currentRoom });
    });
  }

  function bindEvents() {
    bindSocketEvents();
    bindRoomEvents();
  }

  function getCurrentRoom() {
    return currentRoom;
  }

  return { bindEvents, getCurrentRoom };
}
