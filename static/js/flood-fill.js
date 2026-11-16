// Iterative four-connected fill on a logical-resolution RGBA image.
export function floodFill(image, x, y, hex, tolerance = 24) {
  const { width, height, data } = image;
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= width || y >= height) return false;
  const start = (y * width + x) * 4;
  const target = Array.from(data.subarray(start, start + 4));
  const replacement = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
  const matches = i => target[3] === 0 ? data[i + 3] === 0 : target.every((v, c) => Math.abs(v - data[i + c]) <= tolerance);
  if (target.every((v, c) => v === replacement[c])) return false;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 1;
  queue[0] = y * width + x; visited[queue[0]] = 1;
  while (head < tail) {
    const pixel = queue[head++], i = pixel * 4;
    if (!matches(i)) continue;
    data.set(replacement, i);
    const column = pixel % width;
    for (const next of [column > 0 ? pixel - 1 : -1, column < width - 1 ? pixel + 1 : -1, pixel - width, pixel + width]) {
      if (next >= 0 && next < visited.length && !visited[next]) {
        visited[next] = 1; queue[tail++] = next;
      }
    }
  }
  return true;
}
