import { TABLE } from "./table";

/**
 * Fixed gameplay camera. There is no player control in Phase 1.
 *
 * `offset` is the view direction from the look target back to the camera
 * (three-quarter, elevated). It is normalized at runtime. Distance and,
 * only when a narrow viewport would push the camera out of the room,
 * field of view are solved so the whole table stays inside the frame
 * without stretching the projection (aspect always matches the viewport).
 *
 * Tune the shot here — scene code should not hard-code a position.
 */
export const CAMERA = {
  /** Preferred vertical field of view, in degrees, at the designed distance. */
  fov: 33,
  /** Widest vertical FOV used to keep the table on screen in tall viewports. */
  maxFov: 58,
  near: 0.08,
  far: 64,
  /** Look-at point: center of the playing surface. */
  target: [TABLE.centerX, TABLE.playingSurfaceY, TABLE.centerZ] as [number, number, number],
  /**
   * Unnormalized offset from the target to the camera.
   * +X / +Z is the front-right three-quarter. Y sets elevation.
   */
  offset: [1.7, 1.72, 2.45] as [number, number, number],
  /** NDC inset (0–1) kept clear around the table silhouette. */
  fitMargin: 0.08,
  /** Closest the fit is allowed to place the camera (meters from the target). */
  minDistance: 2.6,
  /**
   * Farthest fit distance. Stays inside the room from `ROOM`.
   * Narrow screens widen FOV instead of backing through a wall.
   */
  maxDistance: 8.6,
} as const;
