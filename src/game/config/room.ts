/**
 * Simple hall around the table. Replace `environment/Room` later
 * without touching the table slot or the camera config.
 * Lengths are meters. The floor top is WORLD.floorY (0).
 */
export const ROOM = {
  /** Inner half-size of the square room on X and Z. */
  halfExtent: 10,
  wallHeight: 6.4,
  wallThickness: 0.18,
  floorThickness: 0.12,
  baseboardHeight: 0.16,
  baseboardDepth: 0.045,
} as const;
