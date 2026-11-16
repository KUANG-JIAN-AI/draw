import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFistLatch, isFist, createPinchTracker, createHandGestureTracker } from '../static/js/gesture-menu.js';

function handPose(pose = 'open', scale = 1, angle = 0) {
  const hand = Array.from({ length: 21 }, () => ({ x: .5, y: .7, z: 0 }));
  hand[0] = { x: .5, y: .8, z: 0 };
  for (const [base, pip, tip, x] of [[5, 6, 8, .44], [9, 10, 12, .5], [13, 14, 16, .55], [17, 18, 20, .59]]) {
    hand[base] = { x, y: .6, z: 0 };
    hand[pip] = { x, y: .45, z: 0 };
    hand[tip] = { x, y: pose === 'fist' ? .65 : .28, z: 0 };
  }
  hand[4] = { x: .31, y: .57, z: 0 };
  if (pose === 'pinch') {
    hand[8] = { x: .43, y: .43, z: 0 };
    hand[4] = { x: .44, y: .44, z: 0 };
  }
  return hand.map(({ x, y, z }) => ({
    x: .5 + scale * ((x - .5) * Math.cos(angle) - (y - .8) * Math.sin(angle)),
    y: .8 + scale * ((x - .5) * Math.sin(angle) + (y - .8) * Math.cos(angle)), z: z * scale,
  }));
}

test('requires release before fist; one toggle per continuous hold', () => {
  const latch = createFistLatch();
  const frame = (now, fist, pinching = false) => latch.update({ now, fist, pinching });
  assert.equal(frame(0, true).triggered, false);
  assert.equal(frame(1000, true).triggered, false);
  frame(1100, false); frame(1300, false);
  assert.equal(frame(1400, true).progress, 0);
  assert.equal(frame(1650, true).progress, .5);
  assert.equal(frame(1900, true).triggered, true);
  assert.equal(frame(2900, true).triggered, false);
  frame(3000, false); frame(3200, false); frame(3300, true);
  assert.equal(frame(3800, true).triggered, true);
});

test('sustained drawing pinch, tracking loss, and interrupted fist cannot trigger', () => {
  const latch = createFistLatch();
  const frame = (now, fist, pinching = false) => latch.update({ now, fist, pinching });
  frame(0, false); frame(200, false); frame(300, false, true); frame(600, false, true);
  frame(700, true, true);
  assert.equal(frame(1300, true, true).triggered, false);
  frame(1400, false); frame(1600, false); frame(1700, true);
  latch.reset();
  assert.equal(frame(2300, true).triggered, false);
  frame(2400, false); frame(2600, false); frame(2700, true);
  frame(2900, false); frame(3000, true);
  assert.equal(frame(3300, true).triggered, false);
});

test('brief pinch while curling does not cancel an armed menu gesture', () => {
  const tracker = createHandGestureTracker(), latch = createFistLatch();
  const frame = (now, pose) => latch.update({ ...tracker.update(handPose(pose)), now });
  frame(0, 'open'); frame(200, 'open'); frame(250, 'pinch'); frame(300, 'pinch');
  frame(350, 'fist');
  assert.equal(frame(850, 'fist').triggered, true);
  assert.equal(frame(1400, 'fist').triggered, false);
});

test('four curled fingers distinguish fist from pinch at different sizes and rotations', () => {
  for (const scale of [.4, .6, 1, 1.5]) for (const angle of [0, .8, -1.2, Math.PI]) {
    assert.equal(isFist(handPose('fist', scale, angle)), true);
    assert.equal(isFist(handPose('pinch', scale, angle)), false);
    assert.equal(isFist(handPose('open', scale, angle)), false);
  }
});

test('pinch wins over three extended fingers and stays stable near threshold', () => {
  const tracker = createHandGestureTracker();
  assert.deepEqual(tracker.update(handPose('pinch')), { fist: false, closing: false, pinching: true, openPalm: false });
  const hand = handPose('pinch');
  // Palm length .2: acquisition < .076, release >= .11.
  for (const gap of [.075, .081, .073, .095, .08]) {
    hand[4] = { ...hand[8], x: hand[8].x + gap };
    assert.equal(tracker.update(hand).pinching, true);
  }
  hand[4].x = hand[8].x + .12;
  assert.equal(tracker.update(hand).pinching, false);
  assert.equal(tracker.update(handPose('open')).openPalm, true);
});

test('pinch thresholds scale with palm size and reset when tracking is lost', () => {
  for (const scale of [.4, 1, 1.5]) {
    const tracker = createPinchTracker();
    const hand = handPose('pinch', scale);
    assert.equal(tracker.update(hand), true);
    tracker.reset();
    hand[4] = { ...hand[8], x: hand[8].x + .09 * scale };
    assert.equal(tracker.update(hand), false);
  }
});


test('panning then a slow hand closure can open menu without drawing first', () => {
  const tracker = createHandGestureTracker(), latch = createFistLatch();
  const frame = (now, hand) => {
    const state = tracker.update(hand);
    return { state, result: latch.update({ ...state, now }) };
  };
  // Moving an open palm keeps the menu armed regardless of canvas movement.
  for (let now = 0; now <= 1000; now += 50) {
    const hand = handPose('open').map(p => ({ ...p, x: p.x + now / 10000 }));
    assert.equal(frame(now, hand).state.openPalm, true);
  }
  // The index and middle fingers curl first, thumb touching the index.
  // This used to become a sustained pinch and cancel the menu after 250 ms.
  const partial = handPose('open');
  partial[8].y = partial[12].y = .65;
  partial[4] = { ...partial[8], x: partial[8].x + .01 };
  for (let now = 1050; now <= 1800; now += 50) {
    const { state, result } = frame(now, partial);
    assert.equal(state.closing, true);
    assert.equal(result.triggered, false);
  }
  frame(1850, handPose('fist'));
  assert.equal(frame(2350, handPose('fist')).result.triggered, true);
  assert.equal(frame(3000, handPose('fist')).result.triggered, false);
});

test('occluded little finger does not block a fist but extended index prevents it', () => {
  const hand = handPose('fist');
  hand[20].y = .28;
  assert.equal(isFist(hand), true);
  hand[8].y = .28;
  assert.equal(isFist(hand), false);
});
