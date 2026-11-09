import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCanvasController } from '../static/js/canvas.js';
import { screenToWorld } from '../static/js/geometry.js';

function setup() {
  const canvas = createCanvasController({
    drawingCanvas: { style: {}, getContext: () => ({}) },
    gestureCanvas: { getBoundingClientRect: () => ({ width: 1000, height: 800 }) },
    actionHistory: [], getBrushStyle: () => ({}),
  });
  return canvas;
}
test('zoom preserves world coordinate under cursor', () => {
  const canvas = setup();
  const point = { x: 430, y: 350 };
  const before = screenToWorld(point, canvas.viewport);
  canvas.zoomTo(2, point);
  assert.deepEqual(screenToWorld(point, canvas.viewport), before);
});
test('zoom bounds and invalid values', () => {
  const canvas = setup();
  canvas.zoomTo(100);
  assert.equal(canvas.viewport.scale, 4);
  canvas.zoomTo(-1);
  assert.equal(canvas.viewport.scale, .05);
  canvas.zoomTo(NaN);
  assert.equal(canvas.viewport.scale, .05);
});
test('fit shows entire sheet centered within viewport', () => {
  const canvas = setup();
  canvas.fitToView();
  const { x, y, scale } = canvas.viewport;
  assert.ok(x >= 24 && y >= 24);
  assert.ok(x + 1920 * scale <= 976);
  assert.ok(y + 1440 * scale <= 776);
  assert.equal(x, (1000 - 1920 * scale) / 2);
  assert.equal(y, (800 - 1440 * scale) / 2);
});
