type Point = { x: number; y: number };

/** Space between the edges of a parent bubble and its new child. */
const GAP = 90;
/** Spreads children of the root evenly around it without ever landing on the same spot. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Angle between neighbouring children on a branch. */
const FAN_STEP = 0.5;

/**
 * Returns the top-left position for a new child bubble.
 * Children of the root spread around it; children further out fan away from
 * their grandparent so branches keep growing outward.
 */
export function getChildPosition({
  parentCenter,
  parentSize,
  grandparentCenter,
  siblingCount,
  childSize,
}: {
  parentCenter: Point;
  parentSize: number;
  grandparentCenter: Point | null;
  siblingCount: number;
  childSize: number;
}): Point {
  let angle: number;

  if (grandparentCenter) {
    const outward = Math.atan2(
      parentCenter.y - grandparentCenter.y,
      parentCenter.x - grandparentCenter.x,
    );
    // 0, +1, -1, +2, -2, ... steps either side of straight outward.
    const step = Math.ceil(siblingCount / 2) * (siblingCount % 2 ? 1 : -1);
    angle = outward + step * FAN_STEP;
  } else {
    angle = -Math.PI / 2 + siblingCount * GOLDEN_ANGLE;
  }

  const distance = parentSize / 2 + GAP + childSize / 2;

  return {
    x: parentCenter.x + Math.cos(angle) * distance - childSize / 2,
    y: parentCenter.y + Math.sin(angle) * distance - childSize / 2,
  };
}
