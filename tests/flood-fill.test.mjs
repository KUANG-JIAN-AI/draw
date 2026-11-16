import { test } from 'node:test';
import assert from 'node:assert/strict';
import { floodFill } from '../static/js/flood-fill.js';

test('fill respects a closed boundary and does not wrap at row edges', () => {
  const image = { width: 5, height: 5, data: new Uint8ClampedArray(100) };
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) {
    if (x === 1 || x === 3 || y === 1 || y === 3) image.data.set([0, 0, 0, 255], (y * 5 + x) * 4);
  }
  floodFill(image, 2, 2, '#e11d48');
  assert.deepEqual([...image.data.slice(48, 52)], [225, 29, 72, 255]);
  assert.equal(image.data[3], 0);
  floodFill(image, 0, 0, '#2563eb');
  assert.deepEqual([...image.data.slice(48, 52)], [225, 29, 72, 255]);
  assert.equal(image.data[99], 255);
});

test('same color and out of bounds are safe; transparent RGB is ignored', () => {
  const image = { width: 2, height: 1, data: new Uint8ClampedArray([255, 0, 0, 0, 0, 0, 0, 0]) };
  assert.equal(floodFill(image, -1, 0, '#111827'), false);
  assert.equal(floodFill(image, 2, 0, '#111827'), false);
  assert.equal(floodFill(image, 0, 0, '#111827'), true);
  assert.deepEqual([...image.data.slice(0, 4)], [...image.data.slice(4)]);
  assert.equal(floodFill(image, 0, 0, '#111827'), false);
});
