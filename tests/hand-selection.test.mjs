import assert from "node:assert/strict";
import { test } from "node:test";
import { createHandSelection } from "../static/js/hand-selection.js";

const rect = { width: 1000, height: 700 };

function hand(x, pinching = false) {
  const points = Array.from({ length: 21 }, () => ({ x, y: .5 }));
  points[0] = { x, y: .6 };
  points[8] = { x, y: .42 };
  points[4] = { x: x - (pinching ? .015 : .07), y: .42 };
  return points;
}

test("a second detection on the left does not steal the primary pointer", () => {
  const selection = createHandSelection();
  selection.update([hand(.78)], rect, 0, true);
  const duplicate = hand(.87, true);
  const primary = hand(.8);
  for (const now of [30, 60, 200, 400]) {
    const result = selection.update([duplicate, primary], rect, now, true);
    assert.equal(result.primary, primary);
    assert.equal(result.zooming, false);
  }
});

test("a brief double pinch or a duplicate hand cannot start zooming", () => {
  const selection = createHandSelection();
  const primary = hand(.8, true);
  const other = hand(.3, true);
  assert.equal(selection.update([primary, other], rect, 0, true).zooming, false);
  selection.update([primary], rect, 90, true);
  assert.equal(selection.update([primary, other], rect, 200, true).zooming, false);

  const duplicate = hand(.76, true);
  duplicate[8].x = .72;
  duplicate[4].x = .705;
  selection.update([primary, duplicate], rect, 230, true);
  assert.equal(selection.update([primary, duplicate], rect, 450, true).zooming, false);
});

test("a sustained double pinch zooms and a brief tracking loss holds the view", () => {
  const selection = createHandSelection();
  const primary = hand(.8, true);
  const other = hand(.3, true);
  selection.update([primary, other], rect, 0, true);
  const active = selection.update([other, primary], rect, 150, true);
  assert.equal(active.zooming, true);
  assert.equal(active.primary, primary);
  assert.ok(active.span > 490);

  assert.deepEqual(selection.update([primary], rect, 180, true), { primary, zooming: true });
  assert.equal(selection.update([primary, other], rect, 240, true).zooming, true);
  selection.update([primary], rect, 270, true);
  assert.equal(selection.update([primary], rect, 370, true).zooming, false);
});

test("opening the menu cancels pending or active zoom", () => {
  const selection = createHandSelection();
  const pair = [hand(.8, true), hand(.3, true)];
  selection.update(pair, rect, 0, true);
  assert.equal(selection.update(pair, rect, 150, true).zooming, true);
  assert.equal(selection.update(pair, rect, 190, false).zooming, false);
  assert.equal(selection.update(pair, rect, 500, true).zooming, false);
});
