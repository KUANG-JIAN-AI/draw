import { createFistLatch, createHandGestureTracker } from "./js/gesture-menu.js";
import { HOLD_TO_SELECT_MS, PINCH_THRESHOLD } from "./js/constants.js";
import {
  distance,
  isInsideWorld,
  landmarkToPoint,
  normalizePoint,
  normalizedDistance,
  screenToWorld,
} from "./js/geometry.js";
import { recognizeShape } from "./js/shape-recognition.js";
import { createAiImageController } from "./js/ai-image.js";
import { createCanvasController } from "./js/canvas.js";
import { createGestureOverlay } from "./js/gesture-overlay.js";
import { createRoomController } from "./js/socket-room.js";

const t = window.t;
const setLanguage = window.setLanguage;
const getLanguage = window.getLanguage;

  const video = document.querySelector("#cameraView");
  const drawingCanvas = document.querySelector("#drawingCanvas");
  const gestureCanvas = document.querySelector("#gestureCanvas");
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
  // Off-screen option state powers the toolbar's cycle buttons.
  function createOptions(options) {
    const select = document.createElement("select");
    for (const [value, labelKey] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.dataset.labelKey = labelKey;
      option.textContent = t(labelKey);
      select.append(option);
    }
    return select;
  }
  const aiStyleSelect = createOptions([
    ["children", "style_children"], ["watercolor", "style_watercolor"],
    ["cartoon3d", "style_cartoon3d"], ["sticker", "style_sticker"], ["realistic", "style_realistic"],
  ]);
  const aiSizeSelect = createOptions([["1024x768", "1024x768"], ["1024x1024", "1024x1024"], ["768x1024", "768x1024"]]);
  const aiModelSelect = document.querySelector("#aiModelSelect");
  const aiPromptInput = null;
  const aiResultImage = document.querySelector("#aiResultImage");
  const aiResultWrap = document.querySelector(".ai-result-wrap");
  const aiResultLoading = document.querySelector("#aiResultLoading");
  const aiStatus = document.querySelector("#aiStatus");
  const gestureAiStyleButton = document.querySelector("#gestureAiStyleButton");
  const gestureAiSizeButton = document.querySelector("#gestureAiSizeButton");
  const gestureAiModelButton = document.querySelector("#gestureAiModelButton");
  const gestureAiGenerateButton = document.querySelector("#gestureAiGenerateButton");
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
  let filling = false;
  let precision = false;
  let filteredPoint = null;
  let rawStrokePoint = null;
  let precisionPoint = null;
  let lastSampleTime = 0;
  let camera = null;
  let hands = null;
  let lastPoint = null;
  let lastPanPoint = null;
  let pinchWasDown = false;
  let hoveredGestureTool = null;
  let hoverStartedAt = 0;
  let hoverActivated = false;
  let aiGenerating = false;
  let stroke = null;
  let twoHandZoom = null;
  let menuOpen = false;
  let pendingMenuAction = null;
  let requirePinchRelease = false;
  const fistLatch = createFistLatch();
  const handGestureTracker = createHandGestureTracker();
  const gestureMenu = document.querySelector("#gestureMenu");
  const fistProgress = document.querySelector("#fistProgress");

  function fitGestureMenu() {
    if (!menuOpen) return;
    const available = gestureCanvas.getBoundingClientRect().height - 48;
    const scale = Math.min(1, Math.max(0.1, available / gestureMenu.scrollHeight));
    gestureMenu.style.setProperty("--menu-scale", scale);
  }

  function setMenuOpen(open) {
    menuOpen = open;
    document.querySelector(".stage").classList.toggle("gesture-menu-open", open);
    gestureMenu.hidden = !open;
    document.querySelector("#gestureMenuToggle").setAttribute("aria-expanded", String(open));
    pendingMenuAction = null;
    document.querySelector("#menuConfirmation").hidden = true;
    gestureMenu.classList.remove("confirming");
    fitGestureMenu();
    requirePinchRelease = true;
    fistProgress.hidden = true;
    resetGestureSelection();
    setStatus(open ? "menu_hint" : "menu_resume", "ready");
  }

  function selectMenuTool(tool) {
    if (!tool || tool.disabled) return;
    const action = tool.dataset.gestureAction;
    if (action === "close") { setMenuOpen(false); return; }
    if (action === "cancel") {
      pendingMenuAction = null;
      document.querySelector("#menuConfirmation").hidden = true;
      gestureMenu.classList.remove("confirming");
      fitGestureMenu();
      setHoveredGestureTool(null);
      return;
    }
    if (action === "ai-generate" || action === "clear") {
      pendingMenuAction = tool;
      document.querySelector("#menuConfirmText").textContent = action === "clear" ? t("menu_clear_confirm") : `${t("menu_generate_confirm")} ${selectedOptionLabel(aiStyleSelect)} · ${selectedOptionLabel(aiSizeSelect)} · ${selectedOptionLabel(aiModelSelect)}`;
      document.querySelector("#menuConfirmation").hidden = false;
      gestureMenu.classList.add("confirming");
      fitGestureMenu();
      setHoveredGestureTool(null);
      return;
    }
    if (action === "confirm") {
      const pending = pendingMenuAction;
      if (!pending) return;
      setMenuOpen(false);
      activateGestureTool(pending);
      return;
    }
    activateGestureTool(tool);
    // AI settings can be cycled before confirming generation.
    if (!action.startsWith("ai-")) setMenuOpen(false);
    else fitGestureMenu();
  }
  let noticeUntil = 0;

  const socket = window.io({
    transports: ["websocket"],
    upgrade: false,
  });
  const actionHistory = [];
  let roomController = null;
  const canvas = createCanvasController({
    drawingCanvas,
    gestureCanvas,
    actionHistory,
    getBrushStyle: () => ({ color, size, erasing }),
    onViewportChange: (scale) => {
      document.querySelector("#zoomReset").textContent = `${Math.round(scale * 100)}%`;
      document.querySelector("#zoomOut").disabled = scale <= 0.05;
      document.querySelector("#zoomIn").disabled = scale >= 4;
    },
  });
  const gestureOverlay = createGestureOverlay({
    gestureCanvas,
    getBrushSize: () => size,
  });
  const { viewport } = canvas;

  // --- Canvas actions ---

  function clearDrawing() {
    if (roomController.isJoining()) return;
    const room = roomController.getCurrentRoom();
    if (room) socket.emit("clear_canvas", { room });
    else {
      actionHistory.push({ type: "clear" });
      canvas.redrawHistory();
    }
    resetDrawingGestureState();
  }

  function saveDrawing() {
    const link = document.createElement("a");
    link.download = `gesture-drawing-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.getFlattenedDataUrl();
    link.click();
  }

  function undoDrawing() {
    if (roomController.isJoining()) return;
    const room = roomController.getCurrentRoom();
    if (room) socket.emit("undo", { room });
    else {
      const last = actionHistory.at(-1);
      if (last?.type === "clear") actionHistory.pop();
      else if (last) {
        for (let i = actionHistory.length - 1; i >= 0; i--) {
          if (actionHistory[i].strokeId === last.strokeId) actionHistory.splice(i, 1);
        }
      }
      canvas.redrawHistory();
    }
    resetDrawingGestureState();
  }

  // --- UI helpers ---

  function setStatus(messageOrKey, state = "", transient = false) {
    if (transient && performance.now() < noticeUntil) return;
    if (!transient) noticeUntil = performance.now() + 4000;
    statusText.textContent = t(messageOrKey);
    statusDot.className = "status-dot" + (state ? " " + state : "");
  }

  function setAiStatus(messageOrKey, state = "") {
    if (!aiStatus) return;
    aiStatus.textContent = t(messageOrKey);
    aiStatus.className = "ai-status" + (state ? " " + state : "");
  }

  roomController = createRoomController({
    socket,
    actionHistory,
    canvas,
    membersList,
    roomInput,
    nameInput,
    joinRoomButton,
    setStatus,
    t,
  });
  roomController.bindEvents();

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

  function resetGestureSelection() {
    setHoveredGestureTool(null);
    hoverActivated = false;
    resetDrawingGestureState();
  }

  function finishStroke() {
    const completed = stroke;
    stroke = null;
    if (!completed?.eligible || !completed.firstAction || completed.room !== roomController.getCurrentRoom() ||
        roomController.isJoining()) return;

    const shape = recognizeShape(completed.points, viewport.scale);
    if (shape.type === "freehand") return;

    const { strokeId, color, size, room } = completed.firstAction;
    const action = { type: "shape", shapeType: shape.type, strokeId, color, size, room, erasing: false };
    if (shape.type === "line") {
      action.from = normalizePoint(shape.from);
      action.to = normalizePoint(shape.to);
    } else if (shape.type === "circle") {
      action.center = normalizePoint(shape.center);
      action.radius = shape.radius;
    } else {
      if (!shape.points.every(isInsideWorld)) return;
      action.points = shape.points.map(normalizePoint);
    }

    if (room) {
      socket.emit("finish_shape", action);
    } else {
      canvas.replaceStroke(action);
    }
  }

  function resetDrawingGestureState() {
    stroke = null;
    pinchWasDown = false;
    lastPoint = null;
    filteredPoint = rawStrokePoint = precisionPoint = null;
    lastSampleTime = 0;
    lastPanPoint = null;
  }

  function updateHoldProgress() {
    if (!hoveredGestureTool) return false;

    const elapsed = performance.now() - hoverStartedAt;
    const progress = Math.min(1, elapsed / HOLD_TO_SELECT_MS);
    hoveredGestureTool.style.setProperty("--hold", `${Math.round(progress * 100)}%`);

    if (progress >= 1 && !hoverActivated) {
      hoverActivated = true;
      const selected = hoveredGestureTool;
      selectMenuTool(selected);
      return true;
    }

    return false;
  }

  function findGestureToolAt(point) {
    const rect = gestureCanvas.getBoundingClientRect();
    const screenX = rect.left + point.x;
    const screenY = rect.top + point.y;
    const element = document.elementFromPoint(screenX, screenY);
    const tool = element?.closest?.(".gesture-tool");
    return menuOpen && tool && gestureMenu.contains(tool) && !tool.disabled ? tool : null;
  }

  function hasStableDrawingLandmarks(landmarks) {
    const edgeMargin = 0.04;
    const keyPoints = [0, 4, 5, 8, 9, 12, 17, 20];
    return keyPoints.every((index) => {
      const landmark = landmarks[index];
      return (
        landmark.x > edgeMargin &&
        landmark.x < 1 - edgeMargin &&
        landmark.y > edgeMargin &&
        landmark.y < 1 - edgeMargin
      );
    });
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

  function setFill(value) {
    filling = value;
    if (value) {
      erasing = false;
      eraserButton.setAttribute("aria-pressed", "false");
      document.querySelectorAll("[data-gesture-action='eraser']").forEach(b => b.classList.remove("active"));
    }
    document.querySelector("#fillButton").setAttribute("aria-pressed", String(value));
    document.querySelectorAll("[data-gesture-action='fill']").forEach(b => b.classList.toggle("active", value));
    resetDrawingGestureState();
    if (value) setStatus("fill_hint", "ready");
  }

  function togglePrecision() {
    precision = !precision;
    document.querySelector("#precisionButton").setAttribute("aria-pressed", String(precision));
    document.querySelectorAll("[data-gesture-action='precision']").forEach(b => b.classList.toggle("active", precision));
    resetDrawingGestureState();
    setStatus(precision ? "precision_hint" : "normal_mode", "ready");
  }

  function fillAt(point) {
    const action = { type: "fill", from: normalizePoint(point), color, strokeId: crypto.randomUUID(), room: roomController.getCurrentRoom() };
    actionHistory.push(action);
    canvas.applyAction(action);
    if (action.room) socket.emit("fill", action);
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
    setFill(false);
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

  function selectedOptionLabel(select) {
    return select?.selectedOptions?.[0]?.textContent?.trim() || select?.value || "";
  }

  function cycleSelect(select) {
    if (!select?.options?.length) return "";
    select.selectedIndex = (select.selectedIndex + 1) % select.options.length;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return selectedOptionLabel(select);
  }

  function updateGestureAiControls() {
    [aiStyleSelect, aiSizeSelect].forEach(select => {
      for (const option of select.options) option.textContent = t(option.dataset.labelKey);
    });
    if (gestureAiStyleButton) gestureAiStyleButton.textContent = `${t("ai_style_label")}: ${selectedOptionLabel(aiStyleSelect)}`;
    if (gestureAiSizeButton) gestureAiSizeButton.textContent = `${t("ai_size_label")}: ${selectedOptionLabel(aiSizeSelect)}`;
    if (gestureAiModelButton) gestureAiModelButton.textContent = `${t("ai_model_label")}: ${selectedOptionLabel(aiModelSelect)}`;
    if (gestureAiGenerateButton) gestureAiGenerateButton.disabled = aiGenerating;
  }

  function activateGestureTool(tool) {
    const action = tool.dataset.gestureAction;
    if (action === "fill") { setFill(!filling); return; }
    if (action === "precision") { togglePrecision(); return; }

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
      resetDrawingGestureState();
      setStatus("undo_done", "ready");
    }
    if (action === "clear") {
      clearDrawing();
      setStatus("canvas_cleared", "ready");
    }
    if (action === "save") {
      saveDrawing();
      resetDrawingGestureState();
      setStatus("image_saved", "ready");
    }
    if (action === "ai-style") {
      const label = cycleSelect(aiStyleSelect);
      updateGestureAiControls();
      setStatus(`AI 风格: ${label}`, "ready");
    }
    if (action === "ai-size") {
      const label = cycleSelect(aiSizeSelect);
      updateGestureAiControls();
      setStatus(`AI 尺寸: ${label}`, "ready");
    }
    if (action === "ai-model") {
      const label = cycleSelect(aiModelSelect);
      updateGestureAiControls();
      setStatus(`AI 模型: ${label}`, "ready");
    }
    if (action === "ai-generate") {
      if (aiGenerating) {
        setStatus("ai_generating", "ready");
        return;
      }
      aiImageController.generate();
    }
  }

  // --- Gesture overlay ---

  // --- Hand tracking ---

  function handleHandsResult(results) {
    const setTrackingStatus = (text, state) => setStatus(text, state, true);
    const detectedHands = results.multiHandLandmarks || [];
    if (detectedHands.length !== 1) {
      fistLatch.reset();
      handGestureTracker.reset();
      fistProgress.hidden = true;
      if (menuOpen) {
        resetGestureSelection();
        gestureOverlay.draw(null, null, null);
        return;
      }
    }
    if (detectedHands.length >= 2) {
      const rect = gestureCanvas.getBoundingClientRect();
      const [first, second] = detectedHands;
      const pinched = [first, second].every(hand => normalizedDistance(hand[8], hand[4]) < PINCH_THRESHOLD);
      const a = landmarkToPoint(first[8], rect);
      const b = landmarkToPoint(second[8], rect);
      const span = distance(a, b);
      const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      resetDrawingGestureState();
      setHoveredGestureTool(null);
      const drawZoomFeedback = (active) => gestureOverlay.drawZoom(detectedHands, {
        active, scale: viewport.scale,
        label: t(active ? "zoom_feedback_active" : "zoom_feedback_ready"),
        hint: t(active ? "zoom_feedback_move" : "zoom_feedback_pinch"),
      });
      if (!pinched || span < 60) {
        twoHandZoom = null;
        drawZoomFeedback(false);
        setTrackingStatus("zoom_two_hands_hint", "ready");
        return;
      }
      if (!twoHandZoom) {
        twoHandZoom = { span, scale: viewport.scale, anchor: midpoint };
      } else {
        // Smooth tracking jitter while keeping the starting midpoint fixed.
        const target = Math.max(0.05, Math.min(4, twoHandZoom.scale * span / twoHandZoom.span));
        canvas.zoomTo(viewport.scale + (target - viewport.scale) * 0.25, twoHandZoom.anchor);
      }
      drawZoomFeedback(true);
      setTrackingStatus("zoom_two_hands_active", "ready");
      return;
    }
    // Releasing either hand ends zoom and starts the next stroke afresh.
    if (twoHandZoom) resetDrawingGestureState();
    twoHandZoom = null;
    const landmarks = detectedHands[0];
    const rect = gestureCanvas.getBoundingClientRect();

    if (!landmarks) {
      resetDrawingGestureState();
      setHoveredGestureTool(null);
      gestureOverlay.draw(null, null, null);
      setTrackingStatus("put_hand", "ready");
      return;
    }

    const indexTip = landmarks[8];
    const indexPoint = landmarkToPoint(indexTip, rect);
    let worldPoint = screenToWorld(indexPoint, viewport);
    const { fist, closing, pinching: isPinching, openPalm } = handGestureTracker.update(landmarks);
    const fistState = fistLatch.update({ fist, closing, pinching: isPinching, now: performance.now() });
    if (fistState.triggered) setMenuOpen(!menuOpen);
    fistProgress.hidden = fistState.progress === 0 || fistState.triggered;
    fistProgress.textContent = `${t(menuOpen ? "menu_closing" : "menu_opening")} ${Math.round(fistState.progress * 100)}%`;
    if (menuOpen) {
      resetDrawingGestureState();
      const menuTool = !fist && !closing && !isPinching ? findGestureToolAt(indexPoint) : null;
      setHoveredGestureTool(menuTool);
      gestureOverlay.draw(landmarks, indexPoint, { tool: menuTool, isFist: fist });
      if (menuTool) updateHoldProgress();
      return;
    }
    if (fist || closing || requirePinchRelease) {
      resetDrawingGestureState();
      if (!fist && !closing && !isPinching) requirePinchRelease = false;
      gestureOverlay.draw(landmarks, indexPoint, { isFist: fist });
      if (fist && !fistState.triggered) setTrackingStatus(fistState.progress > 0 ? "menu_fist_hold" : "menu_fist_release", "ready");
      return;
    }
    if (!isPinching) finishStroke();

    const canDraw = isPinching && !openPalm && hasStableDrawingLandmarks(landmarks);
    const isPanning = openPalm;
    const tool = isPinching && !openPalm ? null : findGestureToolAt(indexPoint);

    // Only filter an active stroke. Hovering and menus keep absolute positioning.
    if (canDraw && !tool && !filling) {
      const now = performance.now();
      const raw = { ...worldPoint };
      if (!pinchWasDown || !rawStrokePoint) {
        precisionPoint = { ...raw };
        filteredPoint = { ...raw };
      } else {
        const gain = precision ? 0.5 : 1;
        precisionPoint.x += (raw.x - rawStrokePoint.x) * gain;
        precisionPoint.y += (raw.y - rawStrokePoint.y) * gain;
        const setting = Number(document.querySelector("#smoothingLevel").value);
        const alpha = setting === 0 ? 1 : 1 - Math.pow(1 - setting, Math.min(50, now - lastSampleTime) / 33.33);
        filteredPoint.x += (precisionPoint.x - filteredPoint.x) * alpha;
        filteredPoint.y += (precisionPoint.y - filteredPoint.y) * alpha;
      }
      rawStrokePoint = raw;
      lastSampleTime = now;
      worldPoint = { ...filteredPoint };
    } else {
      filteredPoint = rawStrokePoint = precisionPoint = null;
    }
    const pointerPoint = canDraw && !filling ? { x: worldPoint.x * viewport.scale + viewport.x, y: worldPoint.y * viewport.scale + viewport.y } : indexPoint;
    setHoveredGestureTool(tool);
    gestureOverlay.draw(landmarks, pointerPoint, {
      isPinching: isPinching && !openPalm,
      isPanning,
      tool,
    });

    if (tool) {
      lastPoint = null;
      lastPanPoint = null;
      pinchWasDown = false;
      if (!updateHoldProgress()) {
        setTrackingStatus(`${t("select_hover")}：${tool.textContent || tool.getAttribute("aria-label")}`, "ready");
      }
      return;
    }

    if (isPanning) {
      if (lastPanPoint) {
        viewport.x += indexPoint.x - lastPanPoint.x;
        viewport.y += indexPoint.y - lastPanPoint.y;
        canvas.applyViewport();
      }
      lastPanPoint = indexPoint;
      lastPoint = null;
      pinchWasDown = false;
      setTrackingStatus("panning_canvas", "ready");
      return;
    }

    lastPanPoint = null;

    if (aiGenerating) {
      stroke = null;
      lastPoint = null;
      pinchWasDown = isPinching;
      setTrackingStatus("ai_generating", "ready");
      return;
    }

    if (canDraw && !roomController.isJoining() && isInsideWorld(worldPoint)) {
      if (filling) {
        if (!pinchWasDown) fillAt(worldPoint);
        pinchWasDown = true;
        lastPoint = null;
        return;
      }
      const room = roomController.getCurrentRoom();
      if (!stroke || stroke.room !== room) {
        stroke = {
          id: crypto.randomUUID(),
          room,
          points: [worldPoint],
          firstAction: null,
          eligible: !erasing,
        };
      } else if (lastPoint && distance(lastPoint, worldPoint) < 80 / viewport.scale) {
        const action = {
          type: "draw_line",
          strokeId: stroke.id,
          from: normalizePoint(lastPoint),
          to: normalizePoint(worldPoint),
          color,
          size,
          erasing,
          room,
        };
        stroke.firstAction ??= action;
        if (erasing || color !== stroke.firstAction.color || size !== stroke.firstAction.size) {
          stroke.eligible = false;
        }
        if (stroke.eligible) stroke.points.push(worldPoint);
        canvas.drawLine(lastPoint, worldPoint, action);
        actionHistory.push(action);
        if (action.room) socket.emit("draw_line", action);
      } else {
        stroke.eligible = false;
      }
      lastPoint = worldPoint;
      setTrackingStatus(erasing ? "erasing" : "drawing", "drawing");
    } else {
      if (stroke) stroke.eligible = false;
      lastPoint = null;
      setTrackingStatus("move_to_toolbar", "ready");
    }

    pinchWasDown = canDraw;
  }

  // --- Camera ---

  async function startCamera() {
    if (camera) {
      await camera.stop();
      video.srcObject?.getTracks().forEach(track => track.stop());
      await hands?.close();
      camera = null;
      hands = null;
      twoHandZoom = null;
      setMenuOpen(false);
      fistLatch.reset();
      handGestureTracker.reset();
      resetGestureSelection();
      gestureOverlay.draw(null, null, null);
      document.body.classList.remove("camera-active");
      cameraButton.textContent = t("camera_button");
      setStatus(t("camera_stopped"));
      return;
    }
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
        maxNumHands: 2,
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
      cameraButton.disabled = false;
      cameraButton.textContent = t("camera_stop");
      document.body.classList.add("camera-active");
      setStatus("camera_ready", "ready");
    } catch (error) {
      video.srcObject?.getTracks().forEach(track => track.stop());
      await hands?.close();
      camera = null;
      hands = null;
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
      originalImage: document.querySelector("#aiOriginalImage"),
    },
    hasDrawing: () => {
      const clearedAt = actionHistory.findLastIndex(action => action.type === "clear");
      return actionHistory.slice(clearedAt + 1).some(action => ["draw_line", "fill"].includes(action.type));
    },
    getDrawingDataUrl: canvas.getFlattenedDataUrl,
    setStatus,
    setAiStatus,
    setGenerating: (isGenerating) => {
      aiGenerating = isGenerating;
      if (isGenerating) {
        document.querySelector(".ai-panel").hidden = false;
        document.querySelector("#aiToggle").setAttribute("aria-expanded", "true");
      }
      aiResultWrap?.classList.toggle("is-loading", isGenerating);
      aiResultLoading?.setAttribute("aria-hidden", String(!isGenerating));
      if (isGenerating) {
        lastPoint = null;
        pinchWasDown = false;
      }
      updateGestureAiControls();
    },
  });

  // --- Event listeners ---

  swatches.forEach((button) => {
    button.addEventListener("click", () => updateActiveColor(button.dataset.color));
  });



  customColor.addEventListener("input", () => {
    updateActiveColor(customColor.value);
    customColor.parentElement.classList.add("active");
  });

  sizeOptions.forEach((button) => {
    button.addEventListener("click", () => updateBrushSize(button.dataset.size));
  });



  [aiStyleSelect, aiSizeSelect, aiModelSelect].forEach((select) => {
    select?.addEventListener("change", updateGestureAiControls);
  });



  document.querySelector("#precisionButton").addEventListener("click", togglePrecision);
  document.querySelector("#fillButton").addEventListener("click", () => setFill(!filling));
  document.querySelector("#smoothingLevel").addEventListener("change", resetDrawingGestureState);
  document.querySelector("#gestureMenuToggle").addEventListener("click", () => setMenuOpen(!menuOpen));
  gestureMenu.querySelectorAll(".gesture-tool").forEach(b => b.addEventListener("click", () => selectMenuTool(b)));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && menuOpen) setMenuOpen(false); });
  cameraButton.addEventListener("click", startCamera);
  eraserButton.addEventListener("click", toggleEraser);
  undoButton.addEventListener("click", undoDrawing);
  clearButton.addEventListener("click", () => clearDrawing());
  saveButton.addEventListener("click", saveDrawing);
  aiImageController.bindEvents();


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

  window.addEventListener("resize", () => { canvas.resize(gestureOverlay.context); fitGestureMenu(); });
  window.addEventListener("language-changed", () => { updateGestureAiControls(); fitGestureMenu(); });
  document.querySelector("#aiToggle").addEventListener("click", () => {
    const panel = document.querySelector(".ai-panel");
    panel.hidden = !panel.hidden;
    document.querySelector("#aiToggle").setAttribute("aria-expanded", String(!panel.hidden));
  });
  window.addEventListener("language-changed", () => {
    cameraButton.textContent = t(camera ? "camera_stop" : "camera_button");
  });
  updateGestureAiControls();
  canvas.resize(gestureOverlay.context);
  canvas.fitToView();

  function changeZoom(scale, anchor) {
    resetDrawingGestureState();
    canvas.zoomTo(scale, anchor);
  }
  document.querySelector("#zoomIn").addEventListener("click", () => changeZoom(viewport.scale * 1.2));
  document.querySelector("#zoomOut").addEventListener("click", () => changeZoom(viewport.scale / 1.2));
  document.querySelector("#zoomReset").addEventListener("click", () => changeZoom(1));
  document.querySelector("#zoomFit").addEventListener("click", () => {
    resetDrawingGestureState();
    canvas.fitToView();
  });
  document.querySelector(".stage").addEventListener("wheel", (event) => {
    // Preserve native scrolling inside panels and toolbars.
    if (event.target.closest(".ai-panel, .gesture-toolbar, .hud, .zoom-controls, .camera-preview")) return;
    event.preventDefault();
    const rect = gestureCanvas.getBoundingClientRect();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
    changeZoom(viewport.scale * Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.002), {
      x: event.clientX - rect.left, y: event.clientY - rect.top,
    });
  }, { passive: false });
