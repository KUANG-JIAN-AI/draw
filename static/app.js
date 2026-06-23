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
const statusDot = document.querySelector("#statusDot");
const statusText = document.querySelector("#statusText");

let color = "#111827";
let size = 8;
let erasing = false;
let camera = null;
let hands = null;
let lastPoint = null;
let pinchWasDown = false;
let undoStack = [];
let hoveredGestureTool = null;
let hoverStartedAt = 0;
let hoverActivated = false;

const HOLD_TO_SELECT_MS = 800;
const PINCH_THRESHOLD = 0.075;

const handConnections = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

function setStatus(message, state = "") {
  statusText.textContent = message;
  statusDot.className = `status-dot ${state}`.trim();
}

function resizeCanvases() {
  const rect = drawingCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const previous = drawingCanvas.width > 0 ? drawingCanvas.toDataURL("image/png") : null;

  for (const canvas of [drawingCanvas, gestureCanvas]) {
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  drawCtx.lineCap = "round";
  drawCtx.lineJoin = "round";

  if (previous) {
    const image = new Image();
    image.onload = () => drawCtx.drawImage(image, 0, 0, rect.width, rect.height);
    image.src = previous;
  }
}

function saveState() {
  undoStack.push(drawingCanvas.toDataURL("image/png"));
  if (undoStack.length > 24) {
    undoStack.shift();
  }
}

function restoreState(dataUrl) {
  const rect = drawingCanvas.getBoundingClientRect();
  const image = new Image();
  image.onload = () => {
    drawCtx.clearRect(0, 0, rect.width, rect.height);
    drawCtx.drawImage(image, 0, 0, rect.width, rect.height);
  };
  image.src = dataUrl;
}

function drawLine(from, to) {
  drawCtx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  drawCtx.strokeStyle = color;
  drawCtx.lineWidth = erasing ? size * 1.8 : size;
  drawCtx.beginPath();
  drawCtx.moveTo(from.x, from.y);
  drawCtx.lineTo(to.x, to.y);
  drawCtx.stroke();
  drawCtx.globalCompositeOperation = "source-over";
}

function clearDrawing() {
  const rect = drawingCanvas.getBoundingClientRect();
  saveState();
  drawCtx.clearRect(0, 0, rect.width, rect.height);
}

function saveDrawing() {
  const rect = drawingCanvas.getBoundingClientRect();
  const output = document.createElement("canvas");
  const outputCtx = output.getContext("2d");
  const ratio = window.devicePixelRatio || 1;

  output.width = Math.floor(rect.width * ratio);
  output.height = Math.floor(rect.height * ratio);
  outputCtx.fillStyle = "#ffffff";
  outputCtx.fillRect(0, 0, output.width, output.height);
  outputCtx.drawImage(drawingCanvas, 0, 0);

  const link = document.createElement("a");
  link.download = `gesture-drawing-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = output.toDataURL("image/png");
  link.click();
}

function undoDrawing() {
  const previous = undoStack.pop();
  if (previous) {
    restoreState(previous);
  }
}

function landmarkToPoint(landmark) {
  const rect = drawingCanvas.getBoundingClientRect();
  return {
    x: (1 - landmark.x) * rect.width,
    y: landmark.y * rect.height,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizedDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
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
  const rect = drawingCanvas.getBoundingClientRect();
  const screenX = rect.left + point.x;
  const screenY = rect.top + point.y;
  const element = document.elementFromPoint(screenX, screenY);
  return element?.closest?.(".gesture-tool") || null;
}

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
    setStatus("已选择颜色", "ready");
  }
  if (action === "size") {
    updateBrushSize(tool.dataset.size);
    setStatus(Number(tool.dataset.size) > 10 ? "已切换为粗线" : "已切换为细线", "ready");
  }
  if (action === "eraser") {
    toggleEraser();
    setStatus(erasing ? "已切换到橡皮" : "已切换到画笔", "ready");
  }
  if (action === "undo") {
    undoDrawing();
    setStatus("已撤销一步", "ready");
  }
  if (action === "clear") {
    clearDrawing();
    setStatus("画布已清空", "ready");
  }
  if (action === "save") {
    saveDrawing();
    setStatus("已保存图片", "ready");
  }
}

function drawGestureOverlay(landmarks, point, isPinching, tool) {
  const rect = gestureCanvas.getBoundingClientRect();
  gestureCtx.clearRect(0, 0, rect.width, rect.height);

  if (!landmarks) return;

  gestureCtx.lineWidth = 2;
  gestureCtx.strokeStyle = "rgba(17,24,39,0.32)";
  gestureCtx.fillStyle = "rgba(17,24,39,0.42)";

  for (const [from, to] of handConnections) {
    const a = landmarkToPoint(landmarks[from]);
    const b = landmarkToPoint(landmarks[to]);
    gestureCtx.beginPath();
    gestureCtx.moveTo(a.x, a.y);
    gestureCtx.lineTo(b.x, b.y);
    gestureCtx.stroke();
  }

  for (const landmark of landmarks) {
    const dot = landmarkToPoint(landmark);
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

function handleHandsResult(results) {
  const landmarks = results.multiHandLandmarks?.[0];

  if (!landmarks) {
    pinchWasDown = false;
    lastPoint = null;
    setHoveredGestureTool(null);
    drawGestureOverlay(null);
    setStatus("把手放进画面：食指停在工具上一会儿可选择，捏合空白处画画", "ready");
    return;
  }

  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const indexPoint = landmarkToPoint(indexTip);
  const pinchDistance = normalizedDistance(indexTip, thumbTip);
  const isPinching = pinchDistance < PINCH_THRESHOLD;
  const tool = findGestureToolAt(indexPoint);

  setHoveredGestureTool(tool);
  drawGestureOverlay(landmarks, indexPoint, isPinching, tool);

  if (tool) {
    lastPoint = null;
    pinchWasDown = false;
    if (!updateHoldProgress()) {
      setStatus(`停住选择：${tool.textContent || tool.getAttribute("aria-label")}`, "ready");
    }
    return;
  }

  if (isPinching) {
    if (!pinchWasDown) {
      saveState();
      lastPoint = indexPoint;
    } else if (lastPoint && distance(lastPoint, indexPoint) < 80) {
      drawLine(lastPoint, indexPoint);
    }
    lastPoint = indexPoint;
    setStatus(erasing ? "正在擦除" : "正在绘画", "drawing");
  } else {
    lastPoint = null;
    setStatus("移到中间工具条停住可选择；捏合空白处画画", "ready");
  }

  pinchWasDown = isPinching;
}

async function startCamera() {
  if (!window.Hands || !window.Camera) {
    setStatus("手势识别库还没有加载完成，请稍后再试", "error");
    return;
  }

  cameraButton.disabled = true;
  cameraButton.textContent = "启动中...";
  setStatus("正在请求摄像头权限", "ready");

  try {
    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.72,
      minTrackingConfidence: 0.68,
    });
    hands.onResults(handleHandsResult);

    camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 1280,
      height: 720,
    });

    await camera.start();
    cameraButton.textContent = "摄像头已开启";
    setStatus("食指停在工具上一会儿可选择，捏合空白处画画", "ready");
  } catch (error) {
    console.error(error);
    cameraButton.disabled = false;
    cameraButton.textContent = "开启摄像头";
    setStatus("无法开启摄像头，请检查浏览器权限或使用 localhost 打开", "error");
  }
}

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

document.querySelector(".gesture-tool[data-gesture-action='eraser']").addEventListener("click", toggleEraser);
document.querySelector(".gesture-tool[data-gesture-action='undo']").addEventListener("click", undoDrawing);
document.querySelector(".gesture-tool[data-gesture-action='clear']").addEventListener("click", clearDrawing);
document.querySelector(".gesture-tool[data-gesture-action='save']").addEventListener("click", saveDrawing);

window.addEventListener("resize", resizeCanvases);
resizeCanvases();
