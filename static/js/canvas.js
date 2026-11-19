import { floodFill } from "./flood-fill.js";
import { VIEWPORT_MARGIN, WORLD_HEIGHT, WORLD_WIDTH } from "./constants.js";
import { denormalizePoint } from "./geometry.js";

export function createCanvasController({
  drawingCanvas,
  gestureCanvas,
  actionHistory,
  getBrushStyle,
  onViewportChange = () => {},
}) {
  const drawCtx = drawingCanvas.getContext("2d");
  const viewport = {
    x: 36,
    y: 36,
    scale: 1,
  };

  function clampViewport() {
    const rect = gestureCanvas.getBoundingClientRect();
    const scaledWidth = WORLD_WIDTH * viewport.scale;
    const scaledHeight = WORLD_HEIGHT * viewport.scale;
    // Center a sheet that fits; retain a reachable edge when zoomed in.
    function clampAxis(value, available, size) {
      if (size <= available - 48) return (available - size) / 2;
      const margin = Math.min(VIEWPORT_MARGIN, available / 4);
      return Math.min(margin, Math.max(available - size - margin, value));
    }
    viewport.x = clampAxis(viewport.x, rect.width, scaledWidth);
    viewport.y = clampAxis(viewport.y, rect.height, scaledHeight);
  }

  function applyViewport() {
    clampViewport();
    drawingCanvas.style.width = `${WORLD_WIDTH}px`;
    drawingCanvas.style.height = `${WORLD_HEIGHT}px`;
    drawingCanvas.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`;
    onViewportChange(viewport.scale);
  }

  function zoomTo(scale, anchor) {
    if (!Number.isFinite(scale)) return;
    const rect = gestureCanvas.getBoundingClientRect();
    const point = anchor || { x: rect.width / 2, y: rect.height / 2 };
    const next = Math.max(0.05, Math.min(4, scale));
    const factor = next / viewport.scale;
    viewport.x = point.x - (point.x - viewport.x) * factor;
    viewport.y = point.y - (point.y - viewport.y) * factor;
    viewport.scale = next;
    applyViewport();
  }

  function fitToView() {
    const rect = gestureCanvas.getBoundingClientRect();
    zoomTo(Math.min((rect.width - 48) / WORLD_WIDTH, (rect.height - 48) / WORLD_HEIGHT, 1));
    viewport.x = (rect.width - WORLD_WIDTH * viewport.scale) / 2;
    viewport.y = (rect.height - WORLD_HEIGHT * viewport.scale) / 2;
    applyViewport();
  }

  function drawLine(from, to, style = {}) {
    const brush = getBrushStyle();
    const prevOp = drawCtx.globalCompositeOperation;
    try {
      const erasing = style.erasing ?? brush.erasing;
      const lineColor = erasing ? "destination-out" : style.color || brush.color;
      const lineSize = erasing ? (style.size || brush.size) * 1.8 : (style.size || brush.size);
      drawCtx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
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

  function fillRegion(point, color) {
    const buffer = document.createElement("canvas");
    buffer.width = WORLD_WIDTH; buffer.height = WORLD_HEIGHT;
    const ctx = buffer.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(drawingCanvas, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    const image = ctx.getImageData(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    if (!floodFill(image, point.x, point.y, color)) return;
    ctx.putImageData(image, 0, 0);
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    drawCtx.drawImage(buffer, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  function drawShape(action) {
    const brush = getBrushStyle();
    const prevOp = drawCtx.globalCompositeOperation;
    try {
      const erasing = action.erasing ?? brush.erasing;
      const color = erasing ? "destination-out" : action.color || brush.color;
      const lineSize = erasing ? (action.size || brush.size) * 1.8 : (action.size || brush.size);
      drawCtx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
      drawCtx.strokeStyle = color;
      drawCtx.lineWidth = lineSize;
      drawCtx.beginPath();

      if (action.shapeType === "line") {
        const from = denormalizePoint(action.from);
        const to = denormalizePoint(action.to);
        drawCtx.moveTo(from.x, from.y);
        drawCtx.lineTo(to.x, to.y);
      } else if (action.shapeType === "circle") {
        const center = denormalizePoint(action.center);
        drawCtx.arc(center.x, center.y, action.radius, 0, Math.PI * 2);
      } else if (action.shapeType === "rectangle" || action.shapeType === "triangle") {
        const pts = action.points.map(denormalizePoint);
        if (pts.length > 0) {
          drawCtx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            drawCtx.lineTo(pts[i].x, pts[i].y);
          }
          drawCtx.closePath();
        }
      }
      drawCtx.stroke();
    } finally {
      drawCtx.globalCompositeOperation = prevOp;
    }
  }

  function applyAction(action) {
    if (action.type === "fill") fillRegion(denormalizePoint(action.from), action.color);
    if (action.type === "clear") clear();
    if (action.type === "draw_line") {
      drawLine(denormalizePoint(action.from), denormalizePoint(action.to), action);
    }
    if (action.type === "shape") {
      drawShape(action);
    }
  }

  function replaceStroke(action) {
    const matches = (segment) => segment.type === "draw_line" &&
      segment.strokeId === action.strokeId &&
      (segment.author === undefined || segment.author === action.author);
    const first = actionHistory.findIndex(matches);
    if (first === -1) return;
    for (let i = actionHistory.length - 1; i > first; i--) {
      if (matches(actionHistory[i])) actionHistory.splice(i, 1);
    }
    actionHistory[first] = action;
    redrawHistory();
  }

  function redrawHistory() {
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    actionHistory.forEach(applyAction);
  }

  function resize(gestureCtx) {
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

  function clear() {
    drawCtx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  function getFlattenedDataUrl(targetWidth = WORLD_WIDTH, targetHeight = WORLD_HEIGHT) {
    const output = document.createElement("canvas");
    const outputCtx = output.getContext("2d");

    output.width = targetWidth;
    output.height = targetHeight;
    outputCtx.fillStyle = "#ffffff";
    outputCtx.fillRect(0, 0, output.width, output.height);
    const scale = Math.min(output.width / WORLD_WIDTH, output.height / WORLD_HEIGHT);
    const width = WORLD_WIDTH * scale;
    const height = WORLD_HEIGHT * scale;
    outputCtx.drawImage(drawingCanvas, (output.width - width) / 2, (output.height - height) / 2, width, height);

    return output.toDataURL("image/png");
  }

  return {
    viewport,
    zoomTo,
    fitToView,
    applyViewport,
    drawLine,
    applyAction,
    redrawHistory,
    replaceStroke,
    resize,
    clear,
    getFlattenedDataUrl,
  };
}
