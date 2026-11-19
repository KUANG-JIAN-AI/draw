import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recognizeShape } from '../static/js/shape-recognition.js';

test('recognizes straight line', () => {
  const points = [
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 30, y: 30 },
    { x: 40, y: 40 },
    { x: 50, y: 50 }
  ];
  const shape = recognizeShape(points);
  assert.equal(shape.type, 'line');
  assert.deepEqual(shape.from, { x: 10, y: 10 });
  assert.deepEqual(shape.to, { x: 50, y: 50 });
});

test('recognizes circle', () => {
  const points = [];
  const cx = 100, cy = 100, r = 40;
  for (let i = 0; i <= 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  const shape = recognizeShape(points);
  assert.equal(shape.type, 'circle');
  assert.ok(Math.abs(shape.radius - r) < 5);
});

function trace(vertices) {
  return vertices.slice(1).flatMap(([x, y], i) => {
    const [startX, startY] = vertices[i];
    return Array.from({ length: 6 }, (_, j) => ({
      x: startX + (x - startX) * j / 6,
      y: startY + (y - startY) * j / 6,
    }));
  }).concat({ x: vertices.at(-1)[0], y: vertices.at(-1)[1] });
}

test('recognizes polygons drawn from the middle of an edge', () => {
  const rectangle = recognizeShape(trace([[60, 20], [100, 20], [100, 90], [20, 90], [20, 20], [57, 20]]));
  assert.equal(rectangle.type, 'rectangle');
  assert.equal(rectangle.points.length, 4);
  const triangle = recognizeShape(trace([[60, 20], [100, 20], [60, 100], [20, 20], [57, 20]]));
  assert.equal(triangle.type, 'triangle');
  assert.equal(triangle.points.length, 3);
});

test('keeps a closed scribble and a retraced line as freehand', () => {
  const scribble = trace([[20, 20], [125, 130], [20, 125], [125, 20], [20, 20]]);
  const retraced = trace([[20, 20], [160, 20], [80, 20], [170, 20]]);
  assert.equal(recognizeShape(scribble).type, 'freehand');
  assert.equal(recognizeShape(retraced).type, 'freehand');
});

test('canvas replaces the raw segments and redraws the fitted shape once', async () => {
  const { createCanvasController } = await import('../static/js/canvas.js');
  const calls = [];
  const ctx = {
    clearRect: () => calls.push('clear'),
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    arc: (...args) => calls.push(args.slice(0, 3)),
    stroke() {},
  };
  const segment = {
    type: 'draw_line', strokeId: 'circle', from: { x: .1, y: .1 }, to: { x: .2, y: .2 },
  };
  const other = { ...segment, strokeId: 'other' };
  const actionHistory = [segment, other, segment];
  const canvas = createCanvasController({
    drawingCanvas: { getContext: () => ctx },
    actionHistory,
    getBrushStyle: () => ({ color: '#000000', size: 8, erasing: false }),
  });
  const shape = {
    type: 'shape', shapeType: 'circle', strokeId: 'circle',
    center: { x: .5, y: .5 }, radius: 40,
  };
  canvas.replaceStroke(shape);
  canvas.replaceStroke(shape);
  assert.deepEqual(actionHistory, [shape, other]);
  assert.deepEqual(calls, ['clear', [960, 720, 40]]);
});
