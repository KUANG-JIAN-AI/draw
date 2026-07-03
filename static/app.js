import {
  HAND_CONNECTIONS,
  HOLD_TO_SELECT_MS,
  PINCH_THRESHOLD,
  VIEWPORT_MARGIN,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./js/constants.js";
import {
  denormalizePoint,
  distance,
  isInsideWorld,
  isOpenPalm,
  landmarkToPoint,
  normalizePoint,
  normalizedDistance,
  screenToWorld,
} from "./js/geometry.js";
import { createAiImageController } from "./js/ai-image.js";

const t = window.t;
const setLanguage = window.setLanguage;
const getLanguage = window.getLanguage;

  const video = document.querySelector("#cameraView");
  const drawingCanvas = document.querySelector("#drawingCanvas");
  const gestureCanvas = document.querySelector("#gestureCanvas");
  const drawCtx = drawingCanvas.getContext("2d");
  const gestureCtx = gestureCanvas.getContext("2d");
  const swatches = [...document.querySelectorAll(".toolbar .swatch")];
  const customColor = document.querySelector("#customColor");
  const sizeOptions = [...document.querySelectorAll(".size-option")];
  const cameraButton = document.querySelector("#cameraButton");
  const eraserButton = document.querySelector("#eraserButton");
  const undoButton = document.querySelector("#undoButton");
  const clearButton = document.querySelector("#clearButton");
  const saveButton = document.querySelector("#saveButton");
  const generateButton = document.querySelector("#generateButton");
  const aiGenerateButton = document.querySelector("#aiGenerateButton");
  const aiDownloadButton = document.querySelector("#aiDownloadButton");
  const aiStyleSelect = document.querySelector("#aiStyleSelect");
  const aiSizeSelect = document.querySelector("#aiSizeSelect");
  const aiModelSelect = document.querySelector("#aiModelSelect");
  const aiPromptInput = document.querySelector("#aiPromptInput");
  const aiResultImage = document.querySelector("#aiResultImage");
  const aiStatus = document.querySelector("#aiStatus");
  const statusDot = document.querySelector("#statusDot");
  const statusText = document.querySelector("#statusText");
  const roomInput = document.getElementById("roomInput");
  const nameInput = document.getElementById("nameInput");
  const joinRoomButton = document.getElementById("joinRoomButton");
  const membersList = document.getElementById("membersList");
  const langZhBtn = document.getElementById("langZhBtn");
  const langJaBtn = document.getElementById("langJaBtn");

  let color = "#111827";
  let size = 8;
  let erasing = false;
  let camera = null;
  let hands = null;
  let lastPoint = null;
  let lastPanPoint = null;
  let pinchWasDown = false;
  let hoveredGestureTool = null;
  let hoverStartedAt = 0;
  let hoverActivated = false;
  let aiGenerating = false;

  const viewport = {
    x: 36,
    y: 36,
    scale: 1,
  };

  const socket = window.io();
  const actionHistory = [];
  let currentRoom = null;

  function clampViewport() {
    const rect = gestureCanvas.getBoundingClientRect();
    const scaledWidth = WORLD_WIDTH * viewport.scale;
    const scaledHeight = WORLD_HEIGHT * viewport.scale;
    const minX = Math.min(VIEWPORT_MARGIN, rect.width - scaledWidth - VIEWPORT_MARGIN);
    const minY = Math.min(VIEWPORT_MARGIN, rect.height - scaledHeight - VIEWPORT_MARGIN);

    viewport.x = Math.min(VIEWPORT_MARGIN, Math.max(minX, viewport.x));
    viewport.y = Math.min(VIEWPORT_MARGIN, Math.max(minY, viewport.y));
  }

  function applyViewport() {
    clampViewport();
    drawingCanvas.style.width = `${WORLD_WIDTH}px`;
    drawingCanvas.style.height = `${WORLD_HEIGHT}px`;
    drawingCanvas.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
  }

  // --- Drawing ---

  function drawLine(from, to, style = {}) {
    const prevOp = drawCtx.globalCompositeOperation;
    try {
      const lineColor = style.erasing ? "destination-out" : style.color || color;
      const lineSize = style.erasing ? (style.size || size) * 1.8 : (style.size || size);
      drawCtx.globalCompositeOperation = style.erasing ? "destination-out" : "source-over";
      drawCtx.strokeStyle = lineColor;
      drawCtx.lineWidth = lineSize;
      drawCtx.beginPath();
      drawCtx.moveTo(from.x, from.y);
      drawCtx.lineTo(to.x, to.y);
      drawCtx.stroke();
    } finally {
      drawCtx.globalCompositeOperation = prevOp;
    }
  }

  function applyAction(action) {
    if (action.type === "draw_line") {
      drawLine(denormalizePoint(action.from), denormalizePoint(action.to), action);
    }
  }

  function redrawHistory() {
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    actionHistory.forEach(applyAction);
  }

  // --- Socket events ---

  socket.on("action_history", (history) => {
    actionHistory.length = 0;
    actionHistory.push(...history);
    redrawHistory();
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
    applyAction(data);
  });

  socket.on("clear_canvas", () => {
    actionHistory.length = 0;
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  });

  socket.on("undo", (history) => {
    actionHistory.length = 0;
    actionHistory.push(...history);
    redrawHistory();
  });

  // --- Canvas resize ---

  function resizeCanvases() {
    const rect = gestureCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    drawingCanvas.width = Math.max(1, Math.floor(WORLD_WIDTH * ratio));
    drawingCanvas.height = Math.max(1, Math.floor(WORLD_HEIGHT * ratio));
    drawingCanvas.style.width = `${WORLD_WIDTH}px`;
    drawingCanvas.style.height = `${WORLD_HEIGHT}px`;
    drawCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

    gestureCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
    gestureCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
    gestureCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";

    applyViewport();
    redrawHistory();
  }

  // --- Canvas actions ---

  function getFlattenedDrawingDataUrl(targetWidth = WORLD_WIDTH, targetHeight = WORLD_HEIGHT) {
    const output = document.createElement("canvas");
    const outputCtx = output.getContext("2d");

    output.width = targetWidth;
    output.height = targetHeight;
    outputCtx.fillStyle = "#ffffff";
    outputCtx.fillRect(0, 0, output.width, output.height);
    outputCtx.drawImage(drawingCanvas, 0, 0, output.width, output.height);

    return output.toDataURL("image/png");
  }

  function clearDrawing() {
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    actionHistory.length = 0;
    socket.emit("clear_canvas", { room: currentRoom });
  }

  function saveDrawing() {
    const link = document.createElement("a");
    link.download = `gesture-drawing-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = getFlattenedDrawingDataUrl();
    link.click();
  }

  function undoDrawing() {
    if (actionHistory.length) {
      actionHistory.pop();
      redrawHistory();
      socket.emit("undo", { room: currentRoom });
    }
  }

  // --- UI helpers ---

  function setStatus(messageOrKey, state = "") {
    statusText.textContent = t(messageOrKey);
    statusDot.className = "status-dot" + (state ? " " + state : "");
  }

  function setAiStatus(messageOrKey, state = "") {
    if (!aiStatus) return;
    aiStatus.textContent = t(messageOrKey);
    aiStatus.className = "ai-status" + (state ? " " + state : "");
  }

  function setHoveredGestureTool(tool) {
    if (hoveredGestureTool === tool) return;

    if (hoveredGestureTool) {
      hoveredGestureTool.classList.remove("gesture-hover");
      hoveredGestureTool.style.setProperty("--hold", "0%");
    }

    hoveredGestureTool = tool;
    hoverStartedAt = performance.now();
    hoverActivated = false;

    if (hoveredGestureTool) {
      hoveredGestureTool.classList.add("gesture-hover");
    }
  }

  function updateHoldProgress() {
    if (!hoveredGestureTool) return false;

    const elapsed = performance.now() - hoverStartedAt;
    const progress = Math.min(1, elapsed / HOLD_TO_SELECT_MS);
    hoveredGestureTool.style.setProperty("--hold", `${Math.round(progress * 100)}%`);

    if (progress >= 1 && !hoverActivated) {
      hoverActivated = true;
      activateGestureTool(hoveredGestureTool);
      hoveredGestureTool.classList.remove("selected-flash");
      void hoveredGestureTool.offsetWidth;
      hoveredGestureTool.classList.add("selected-flash");
      setTimeout(() => hoveredGestureTool?.classList.remove("selected-flash"), 360);
      return true;
    }

    return false;
  }

  function findGestureToolAt(point) {
    const rect = gestureCanvas.getBoundingClientRect();
    const screenX = rect.left + point.x;
    const screenY = rect.top + point.y;
    const element = document.elementFromPoint(screenX, screenY);
    return element?.closest?.(".gesture-tool") || null;
  }

  // --- Tool state management ---

  function updateActiveColor(nextColor) {
    color = nextColor;
    erasing = false;
    eraserButton.setAttribute("aria-pressed", "false");

    document.querySelectorAll(".gesture-tool[data-gesture-action='eraser']").forEach((button) => {
      button.classList.remove("active");
    });
    swatches.forEach((button) => {
      button.classList.toggle("active", button.dataset.color === nextColor);
    });
    document.querySelectorAll(".gesture-tool[data-gesture-action='color']").forEach((button) => {
      button.classList.toggle("active", button.dataset.color === nextColor);
    });
    customColor.parentElement.classList.remove("active");
    customColor.value = nextColor;
  }

  function updateBrushSize(nextSize) {
    size = Number(nextSize);
    sizeOptions.forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.size) === size);
    });
    document.querySelectorAll(".gesture-tool[data-gesture-action='size']").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.size) === size);
    });
  }

  function toggleEraser() {
    erasing = !erasing;
    eraserButton.setAttribute("aria-pressed", String(erasing));
    document.querySelectorAll(".gesture-tool[data-gesture-action='eraser']").forEach((button) => {
      button.classList.toggle("active", erasing);
    });

    if (erasing) {
      swatches.forEach((button) => button.classList.remove("active"));
      document.querySelectorAll(".gesture-tool[data-gesture-action='color']").forEach((button) => {
        button.classList.remove("active");
      });
      customColor.parentElement.classList.remove("active");
    } else {
      updateActiveColor(color);
    }
  }

  function activateGestureTool(tool) {
    const action = tool.dataset.gestureAction;

    if (action === "color") {
      updateActiveColor(tool.dataset.color);
      setStatus("color_selected", "ready");
    }
    if (action === "size") {
      updateBrushSize(tool.dataset.size);
      setStatus(Number(tool.dataset.size) > 10 ? "line_thick" : "line_thin", "ready");
    }
    if (action === "eraser") {
      toggleEraser();
      setStatus(erasing ? "eraser_mode" : "brush_mode", "ready");
    }
    if (action === "undo") {
      undoDrawing();
      setStatus("undo_done", "ready");
    }
    if (action === "clear") {
      clearDrawing();
      setStatus("canvas_cleared", "ready");
    }
    if (action === "save") {
      saveDrawing();
      setStatus("image_saved", "ready");
    }
  }

  // --- Gesture overlay ---

  function drawGestureOverlay(landmarks, point, isPinching, tool) {
    const rect = gestureCanvas.getBoundingClientRect();
    gestureCtx.clearRect(0, 0, rect.width, rect.height);

    if (!landmarks) return;

    gestureCtx.lineWidth = 2;
    gestureCtx.strokeStyle = "rgba(17,24,39,0.32)";
    gestureCtx.fillStyle = "rgba(17,24,39,0.42)";

    for (const [from, to] of HAND_CONNECTIONS) {
      const a = landmarkToPoint(landmarks[from], rect);
      const b = landmarkToPoint(landmarks[to], rect);
      gestureCtx.beginPath();
      gestureCtx.moveTo(a.x, a.y);
      gestureCtx.lineTo(b.x, b.y);
      gestureCtx.stroke();
    }

    for (const landmark of landmarks) {
      const dot = landmarkToPoint(landmark, rect);
      gestureCtx.beginPath();
      gestureCtx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
      gestureCtx.fill();
    }

    gestureCtx.beginPath();
    gestureCtx.arc(point.x, point.y, Math.max(10, size * 0.72), 0, Math.PI * 2);
    gestureCtx.fillStyle = tool
      ? "rgba(245,158,11,0.92)"
      : isPinching
        ? "rgba(225,29,72,0.88)"
        : "rgba(15,118,110,0.88)";
    gestureCtx.fill();
    gestureCtx.lineWidth = 3;
    gestureCtx.strokeStyle = "#ffffff";
    gestureCtx.stroke();
  }

  // --- Hand tracking ---

  function handleHandsResult(results) {
    const landmarks = results.multiHandLandmarks?.[0];
    const rect = gestureCanvas.getBoundingClientRect();

    if (!landmarks) {
      pinchWasDown = false;
      lastPoint = null;
      lastPanPoint = null;
      setHoveredGestureTool(null);
      drawGestureOverlay(null, null, false, null);
      setStatus("put_hand", "ready");
      return;
    }

    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const indexPoint = landmarkToPoint(indexTip, rect);
    const worldPoint = screenToWorld(indexPoint, viewport);
    const pinchDistance = normalizedDistance(indexTip, thumbTip);
    const isPinching = pinchDistance < PINCH_THRESHOLD;
    const isPanning = !isPinching && isOpenPalm(landmarks);
    const tool = findGestureToolAt(indexPoint);

    setHoveredGestureTool(tool);
    drawGestureOverlay(landmarks, indexPoint, isPinching || isPanning, tool);

    if (tool) {
      lastPoint = null;
      lastPanPoint = null;
      pinchWasDown = false;
      if (!updateHoldProgress()) {
        setStatus(`${t("select_hover")}：${tool.textContent || tool.getAttribute("aria-label")}`, "ready");
      }
      return;
    }

    if (isPanning) {
      if (lastPanPoint) {
        viewport.x += indexPoint.x - lastPanPoint.x;
        viewport.y += indexPoint.y - lastPanPoint.y;
        applyViewport();
      }
      lastPanPoint = indexPoint;
      lastPoint = null;
      pinchWasDown = false;
      setStatus("panning_canvas", "ready");
      return;
    }

    lastPanPoint = null;

    if (aiGenerating) {
      lastPoint = null;
      pinchWasDown = isPinching;
      setStatus("ai_generating", "ready");
      return;
    }

    if (isPinching && isInsideWorld(worldPoint)) {
      if (!pinchWasDown) {
        lastPoint = worldPoint;
      } else if (lastPoint && distance(lastPoint, worldPoint) < 80 / viewport.scale) {
        const action = {
          type: "draw_line",
          from: normalizePoint(lastPoint),
          to: normalizePoint(worldPoint),
          color,
          size,
          erasing,
        };
        action.room = currentRoom;
        drawLine(lastPoint, worldPoint, action);
        actionHistory.push(action);
        socket.emit("draw_line", action);
      }
      lastPoint = worldPoint;
      setStatus(erasing ? "erasing" : "drawing", "drawing");
    } else {
      lastPoint = null;
      setStatus("move_to_toolbar", "ready");
    }

    pinchWasDown = isPinching;
  }

  // --- Camera ---

  async function startCamera() {
    if (!window.Hands || !window.Camera) {
      setStatus("loading_gesture_lib", "error");
      return;
    }

    cameraButton.disabled = true;
    setStatus("requesting_camera", "ready");

    try {
      hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.72,
        minTrackingConfidence: 0.68,
      });
      hands.onResults(handleHandsResult);

      camera = new window.Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 1280,
        height: 720,
      });

      await camera.start();
      cameraButton.textContent = t("camera_button");
      setStatus("camera_ready", "ready");
    } catch (error) {
      console.error(error);
      cameraButton.disabled = false;
      cameraButton.textContent = t("camera_button");
      setStatus("camera_error", "error");
    }
  }

  const aiImageController = createAiImageController({
    elements: {
      generateButton,
      panelGenerateButton: aiGenerateButton,
      downloadButton: aiDownloadButton,
      styleSelect: aiStyleSelect,
      sizeSelect: aiSizeSelect,
      modelSelect: aiModelSelect,
      promptInput: aiPromptInput,
      resultImage: aiResultImage,
    },
    hasDrawing: () => actionHistory.length > 0,
    getDrawingDataUrl: getFlattenedDrawingDataUrl,
    setStatus,
    setAiStatus,
    setGenerating: (isGenerating) => {
      aiGenerating = isGenerating;
      if (isGenerating) {
        lastPoint = null;
        pinchWasDown = false;
      }
    },
  });

  // --- Event listeners ---

  swatches.forEach((button) => {
    button.addEventListener("click", () => updateActiveColor(button.dataset.color));
  });

  document.querySelectorAll(".gesture-tool[data-gesture-action='color']").forEach((button) => {
    button.addEventListener("click", () => updateActiveColor(button.dataset.color));
  });

  customColor.addEventListener("input", () => {
    color = customColor.value;
    erasing = false;
    eraserButton.setAttribute("aria-pressed", "false");
    swatches.forEach((button) => button.classList.remove("active"));
    document.querySelectorAll(".gesture-tool[data-gesture-action='color']").forEach((button) => {
      button.classList.remove("active");
    });
    customColor.parentElement.classList.add("active");
  });

  sizeOptions.forEach((button) => {
    button.addEventListener("click", () => updateBrushSize(button.dataset.size));
  });

  document.querySelectorAll(".gesture-tool[data-gesture-action='size']").forEach((button) => {
    button.addEventListener("click", () => updateBrushSize(button.dataset.size));
  });

  cameraButton.addEventListener("click", startCamera);
  eraserButton.addEventListener("click", toggleEraser);
  undoButton.addEventListener("click", undoDrawing);
  clearButton.addEventListener("click", clearDrawing);
  saveButton.addEventListener("click", saveDrawing);
  aiImageController.bindEvents();

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

  document.querySelector(".gesture-tool[data-gesture-action='eraser']").addEventListener("click", toggleEraser);
  document.querySelector(".gesture-tool[data-gesture-action='undo']").addEventListener("click", undoDrawing);
  document.querySelector(".gesture-tool[data-gesture-action='clear']").addEventListener("click", clearDrawing);
  document.querySelector(".gesture-tool[data-gesture-action='save']").addEventListener("click", saveDrawing);

  // --- Language buttons ---

  langZhBtn?.addEventListener("click", () => {
    setLanguage("zh");
    langZhBtn.style.background = "var(--accent)";
    langZhBtn.style.color = "#ffffff";
    langJaBtn.style.background = "transparent";
    langJaBtn.style.color = "inherit";
  });

  langJaBtn?.addEventListener("click", () => {
    setLanguage("ja");
    langJaBtn.style.background = "var(--accent)";
    langJaBtn.style.color = "#ffffff";
    langZhBtn.style.background = "transparent";
    langZhBtn.style.color = "inherit";
  });

  if (getLanguage() === "zh") {
    langZhBtn.style.background = "var(--accent)";
    langZhBtn.style.color = "#ffffff";
  } else {
    langJaBtn.style.background = "var(--accent)";
    langJaBtn.style.color = "#ffffff";
  }

  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();
