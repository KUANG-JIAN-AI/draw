import { HAND_CONNECTIONS } from "./constants.js";
import { landmarkToPoint } from "./geometry.js";

export function createGestureOverlay({ gestureCanvas, getBrushSize }) {
  const gestureCtx = gestureCanvas.getContext("2d");

  function drawPointer(point, isPinching, tool) {
    const indicatorSize = Math.max(10, getBrushSize() * (isPinching ? 0.82 : 0.72));
    const color = tool
      ? "rgba(245,158,11,0.92)"
      : isPinching
        ? "rgba(225,29,72,0.9)"
        : "rgba(15,118,110,0.88)";

    gestureCtx.beginPath();
    gestureCtx.arc(point.x, point.y, indicatorSize, 0, Math.PI * 2);
    gestureCtx.fillStyle = color;
    gestureCtx.fill();
    gestureCtx.lineWidth = isPinching ? 4 : 3;
    gestureCtx.strokeStyle = "#ffffff";
    gestureCtx.stroke();
  }

  function draw(landmarks, point, state) {
    const rect = gestureCanvas.getBoundingClientRect();
    gestureCtx.clearRect(0, 0, rect.width, rect.height);

    if (!landmarks) return;

    const isPinching = Boolean(state?.isPinching);
    const tool = state?.tool || null;

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

    drawPointer(point, isPinching, tool);
  }

  function drawZoom(hands, { active, scale, label, hint }) {
    const rect = gestureCanvas.getBoundingClientRect();
    gestureCtx.clearRect(0, 0, rect.width, rect.height);
    gestureCtx.save();
    const color = active ? "#0f766e" : "#b45309";
    const points = hands.map(hand => landmarkToPoint(hand[8], rect));
    // Draw both skeletons so beginners can see which fingers are tracked.
    gestureCtx.strokeStyle = active ? "rgba(15,118,110,.5)" : "rgba(180,83,9,.45)";
    gestureCtx.lineWidth = 2;
    for (const hand of hands) {
      for (const [from, to] of HAND_CONNECTIONS) {
        const a = landmarkToPoint(hand[from], rect);
        const b = landmarkToPoint(hand[to], rect);
        gestureCtx.beginPath();
        gestureCtx.moveTo(a.x, a.y);
        gestureCtx.lineTo(b.x, b.y);
        gestureCtx.stroke();
      }
    }
    const [a, b] = points;
    gestureCtx.strokeStyle = color;
    gestureCtx.lineWidth = 3;
    gestureCtx.setLineDash(active ? [] : [8, 7]);
    gestureCtx.beginPath();
    gestureCtx.moveTo(a.x, a.y);
    gestureCtx.lineTo(b.x, b.y);
    gestureCtx.stroke();
    gestureCtx.setLineDash([]);
    for (const point of points) {
      gestureCtx.beginPath();
      gestureCtx.arc(point.x, point.y, active ? 22 : 17, 0, Math.PI * 2);
      gestureCtx.fillStyle = active ? "rgba(15,118,110,.18)" : "rgba(245,158,11,.18)";
      gestureCtx.fill();
      gestureCtx.stroke();
      gestureCtx.beginPath();
      gestureCtx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      gestureCtx.fillStyle = color;
      gestureCtx.fill();
    }
    // A compact label follows the midpoint, clamped inside the stage.
    const width = Math.min(360, rect.width - 16);
    const x = Math.max(8, Math.min(rect.width - width - 8, (a.x + b.x) / 2 - width / 2));
    const y = Math.max(8, Math.min(rect.height - 92, (a.y + b.y) / 2 - 100));
    gestureCtx.fillStyle = "rgba(255,255,255,.96)";
    gestureCtx.fillRect(x, y, width, 80);
    gestureCtx.strokeStyle = color;
    gestureCtx.lineWidth = 2;
    gestureCtx.strokeRect(x, y, width, 80);
    gestureCtx.textAlign = "center";
    gestureCtx.fillStyle = color;
    gestureCtx.font = "bold 20px system-ui";
    gestureCtx.fillText(`${label}  ${Math.round(scale * 100)}%`, x + width / 2, y + 29, width - 20);
    gestureCtx.font = "13px system-ui";
    gestureCtx.fillText(hint, x + width / 2, y + 58, width - 20);
    gestureCtx.restore();
  }

  return { draw, drawZoom, context: gestureCtx };
}
