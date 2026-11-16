import { normalizedDistance, isOpenPalm } from './geometry.js';

function jointCosine(a, joint, b) {
  const u = [a.x - joint.x, a.y - joint.y, (a.z || 0) - (joint.z || 0)];
  const v = [b.x - joint.x, b.y - joint.y, (b.z || 0) - (joint.z || 0)];
  const length = Math.hypot(...u) * Math.hypot(...v);
  return length > 1e-8 ? u.reduce((sum, value, i) => sum + value * v[i], 0) / length : -1;
}

function curledFingers(hand) {
  const palm = normalizedDistance(hand[0], hand[9]);
  if (palm < 0.025) return [false, false, false, false];
  return [[5, 6, 8], [9, 10, 12], [13, 14, 16], [17, 18, 20]].map(([base, pip, tip]) =>
    jointCosine(hand[base], hand[pip], hand[tip]) > -0.25 &&
    normalizedDistance(hand[tip], hand[0]) < normalizedDistance(hand[pip], hand[0]) - palm * 0.08);
}

export function isFist(hand) {
  const curled = curledFingers(hand);
  // Require the index and at least two other fingers. A partly occluded little
  // finger should not prevent an otherwise clear fist from being recognized.
  return curled[0] && curled.filter(Boolean).length >= 3;
}

// A wider release threshold keeps small landmark fluctuations from lifting the pen.
export function createPinchTracker() {
  let active = false;
  return {
    reset() { active = false; },
    update(hand) {
      const palm = normalizedDistance(hand[0], hand[9]);
      if (palm < 0.025) { active = false; return false; }
      const ratio = normalizedDistance(hand[4], hand[8]) / palm;
      active = ratio < (active ? 0.55 : 0.38);
      return active;
    },
  };
}

export function createHandGestureTracker() {
  const pinch = createPinchTracker();
  return {
    reset() { pinch.reset(); },
    update(hand) {
      const curled = curledFingers(hand);
      const fist = curled[0] && curled.filter(Boolean).length >= 3;
      const closing = !fist && curled[0] && curled.filter(Boolean).length >= 2;
      const pinching = !fist && pinch.update(hand);
      if (fist) pinch.reset();
      return { fist, closing, pinching, openPalm: !pinching && !fist && !closing && isOpenPalm(hand) };
    },
  };
}

export function createFistLatch(holdMs = 500, releaseMs = 180) {
  let started = null, released = null, armed = false, pinchStarted = null;
  return {
    reset() { started = released = pinchStarted = null; armed = false; },
    update({ fist, pinching, closing = false, now }) {
      // A partially closed hand may look like a pinch for arbitrarily long.
      // Preserve readiness while curling; only an actual drawing pose disarms.
      if (closing) {
        started = null;
        pinchStarted = null;
        released = null;
        return { progress: 0, triggered: false };
      }
      if (!fist) {
        started = null;
        if (!pinching) {
          pinchStarted = null;
          released ??= now;
          if (now - released >= releaseMs) armed = true;
        } else {
          released = null;
          pinchStarted ??= now;
          if (now - pinchStarted >= 250) armed = false;
        }
        return { progress: 0, triggered: false };
      }
      released = pinchStarted = null;
      if (!armed) return { progress: 0, triggered: false };
      started ??= now;
      const progress = Math.min(1, (now - started) / holdMs);
      if (progress === 1) {
        armed = false; started = null;
        return { progress, triggered: true };
      }
      return { progress, triggered: false };
    },
  };
}
