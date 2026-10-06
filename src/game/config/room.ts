/**
 * The four-wall mesh is a small hollow shell (~1 m × 0.75 m × 0.3 m)
 * sitting on y = 0. It is scaled uniformly so the shorter interior
 * side is `innerShortSide`. That leaves a large floor around the
 * 3.2 m table and keeps the camera inside the room.
 */
export const WALL_MODEL = {
  width: 0.998,
  depth: 0.752,
  height: 0.2988,
  /** Clear gap between the inner faces on Z, the shorter side. */
  innerDepth: 0.66,
} as const;

export const ROOM = {
  /** Target length of the shorter interior side, in meters. */
  innerShortSide: 15,
  floorThickness: 0.12,
} as const;

const scale = ROOM.innerShortSide / WALL_MODEL.innerDepth;

export const ROOM_LAYOUT = {
  scale,
  width: WALL_MODEL.width * scale,
  depth: WALL_MODEL.depth * scale,
  height: WALL_MODEL.height * scale,
  innerDepth: ROOM.innerShortSide,
  innerWidth: (WALL_MODEL.width - (WALL_MODEL.depth - WALL_MODEL.innerDepth)) * scale,
} as const;
