import { PINCH_RELEASE_RATIO, PINCH_START_RATIO } from "./constants.js";
import { distance, landmarkToPoint, normalizedDistance } from "./geometry.js";

export function createHandSelection() {
  let primaryPalm = null;
  let candidateSince = null;
  let missingSince = null;
  let zooming = false;

  function reset() {
    primaryPalm = candidateSince = missingSince = null;
    zooming = false;
  }

  function update(hands, rect, now, allowZoom) {
    let primary = hands[0];
    if (primaryPalm && hands.length >= 2 &&
        distance(hands[1][9], primaryPalm) < distance(primary[9], primaryPalm)) {
      primary = hands[1];
    }
    primaryPalm = primary?.[9] ?? null;

    if (allowZoom && hands.length >= 2) {
      const [first, second] = hands;
      const palmSizes = [first, second].map(hand => normalizedDistance(hand[0], hand[9]));
      const threshold = zooming ? PINCH_RELEASE_RATIO : PINCH_START_RATIO;
      const pinched = [first, second].every((hand, i) => palmSizes[i] >= 0.025 &&
        normalizedDistance(hand[4], hand[8]) < palmSizes[i] * threshold);
      const a = landmarkToPoint(first[8], rect);
      const b = landmarkToPoint(second[8], rect);
      const span = distance(a, b);
      const separate = distance(first[9], second[9]) > Math.max(...palmSizes) * 0.65;
      if (pinched && separate && span >= 60) {
        candidateSince ??= now;
        missingSince = null;
        if (now - candidateSince >= 150 || zooming) {
          zooming = true;
          return { primary, zooming, span, midpoint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
        }
        return { primary, zooming: false };
      }
    }

    candidateSince = null;
    if (allowZoom && zooming) {
      missingSince ??= now;
      if (now - missingSince < 100) return { primary, zooming };
    }
    missingSince = null;
    zooming = false;
    return { primary, zooming };
  }

  return { update, reset };
}
