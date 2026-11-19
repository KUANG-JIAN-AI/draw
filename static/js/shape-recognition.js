// Points and returned geometry use canvas coordinates. Scale converts pixel thresholds.
export function recognizeShape(points, scale = 1) {
  const freehand = { type: "freehand", points };
  if (!points || points.length < 5) return freehand;

  const start = points[0];
  const end = points.at(-1);
  const gap = distance(start, end);
  const length = computePathLength(points);
  if (gap * scale > 30 && length <= gap * 1.15 &&
      points.every(point => distToSegment(point, start, end) < gap * 0.08)) {
    return { type: "line", from: start, to: end };
  }
  if (length * scale < 50 || gap > length * 0.1) return freehand;

  const perimeter = length + gap;
  const area = polygonArea(points);
  const circularity = 4 * Math.PI * area / perimeter ** 2;
  if (circularity > 0.85) {
    let minX = start.x, maxX = start.x, minY = start.y, maxY = start.y;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    const radius = (maxX - minX + maxY - minY) / 4;
    if (points.every(point => Math.abs(distance(point, center) - radius) <= radius * 0.18)) {
      return { type: "circle", center, radius };
    }
  }

  const tolerance = Math.min(12 / scale, perimeter * 0.025);
  // Close the path once, then remove the artificial corner at the starting point.
  const corners = simplifyPath([...points, start], tolerance).slice(0, -1);
  if (corners.length >= 3 && distToSegment(corners[0], corners.at(-1), corners[1]) <= tolerance) {
    corners.shift();
  }
  if (corners.length !== 3 && corners.length !== 4) return freehand;

  const cornerPerimeter = computePathLength([...corners, corners[0]]);
  if (perimeter > cornerPerimeter * 1.15 || area < polygonArea(corners) * 0.8) return freehand;

  if (corners.length === 3) {
    return area >= cornerPerimeter ** 2 * 0.02 ? { type: "triangle", points: corners } : freehand;
  }

  const rectangle = fitRectangle(corners);
  return rectangle ? { type: "rectangle", points: rectangle } : freehand;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fitRectangle(corners) {
  const [a, b, c, d] = corners;
  const axis = { x: b.x - a.x + c.x - d.x, y: b.y - a.y + c.y - d.y };
  const axisLength = Math.hypot(axis.x, axis.y);
  if (axisLength === 0) return null;
  const ux = axis.x / axisLength;
  const uy = axis.y / axisLength;
  const projected = corners.map(({ x, y }) => ({ x: x * ux + y * uy, y: y * ux - x * uy }));
  const [p, q, r, s] = projected;
  const left = (p.x + s.x) / 2;
  const right = (q.x + r.x) / 2;
  const top = (p.y + q.y) / 2;
  const bottom = (r.y + s.y) / 2;
  const fitted = [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }];
  const tolerance = Math.min(Math.abs(right - left), Math.abs(bottom - top)) * 0.18;
  if (tolerance === 0 || fitted.some((point, i) => distance(point, projected[i]) > tolerance)) return null;
  return fitted.map(({ x, y }) => ({ x: x * ux - y * uy, y: x * uy + y * ux }));
}

function computePathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function distToSegment(p, a, b) {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
}

function polygonArea(points) {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
  }
  return Math.abs(area / 2);
}

function simplifyPath(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, index + 1), tolerance);
    const right = simplifyPath(points.slice(index), tolerance);
    return left.slice(0, left.length - 1).concat(right);
  }
  return [start, end];
}
