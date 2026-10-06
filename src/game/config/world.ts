/**
 * Coordinate standard for the bumper-pool scene.
 *
 * three.js right-handed space:
 *   +X right, +Y up, +Z toward the front of the room.
 * The gameplay plane is X/Z. Height is Y.
 *
 * World origin (0, 0, 0) is the floor point directly under the table center.
 * It is not on the felt. The playing-surface center is
 * (0, TABLE.playingSurfaceY, 0) — see `table.ts`.
 *
 * The table group is not rotated.
 */
export const WORLD = {
  origin: { x: 0, y: 0, z: 0 },
  floorY: 0,
  upAxis: "Y",
  plane: "XZ",
} as const;
