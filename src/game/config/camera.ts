import { TABLE } from "./table";

/**
 * Starting camera, then free look.
 *
 * `offset` is the opening three-quarter view of the table. Distance and,
 * on a narrow screen, field of view are solved so the table starts in frame.
 * After that, drag turns the view through the room without moving the camera
 * through a wall.
 *
 * Tune the shot here — scene code should not hard-code a position.
 */
export const CAMERA = {
  /** Preferred vertical field of view, in degrees, at the designed distance. */
  fov: 33,
  /** Widest vertical FOV used to keep the table on screen in tall viewports. */
  maxFov: 58,
  near: 0.15,
  far: 180,
  /** Look-at point: center of the playing surface. */
  target: [TABLE.centerX, TABLE.playingSurfaceY, TABLE.centerZ] as [number, number, number],
  /**
   * Unnormalized offset from the target to the camera.
   * +X / +Z is the front-right three-quarter. Y sets elevation.
   * This is only the starting view. After that, look controls take over.
   */
  offset: [1.7, 1.72, 2.45] as [number, number, number],
  /** NDC inset (0–1) kept clear around the table silhouette. */
  fitMargin: 0.08,
  /** Closest the fit is allowed to place the camera (meters from the target). */
  minDistance: 7.8,
  /**
   * Farthest fit distance. There are no walls, so the camera can back up
   * far enough to frame the 3× table without widening the lens.
   */
  maxDistance: 28,
  /** Drag-to-look. The camera stays put so it cannot pass through a wall. */
  look: {
    /** Radians per pixel. Drag moves the room with the finger. */
    yawSpeed: 0.007,
    pitchSpeed: 0.005,
    /** Look down toward the floor, and up toward the ceiling. */
    pitchMin: -1.05,
    pitchMax: 1.2,
    fovMin: 22,
    fovMax: 72,
    /** Wheel delta scaled into a FOV change. */
    wheel: 0.028,
    inertia: 0.9,
  },
} as const;
