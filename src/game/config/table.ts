import { WORLD } from "./world";

/**
 * Placeholder table measurements, in meters.
 * Future balls, cushions, and the imported GLB should use these
 * instead of hard-coded sizes. If the final model differs, change
 * the numbers here — do not scatter replacements through the scene.
 *
 * The playing surface is a horizontal disc. Its center is
 * (centerX, playingSurfaceY, centerZ) = (0, playingSurfaceY, 0).
 */
export const TABLE = {
  centerX: WORLD.origin.x,
  centerZ: WORLD.origin.z,
  /** World Y of the top of the felt — the plane balls will rest on. */
  playingSurfaceY: 0.78,
  /** Radius of the circular playing surface. */
  playingRadius: 1.5,
  /** Thickness of the playing-surface slab. */
  playingThickness: 0.05,
  /** How far the outer rim extends past the playing radius. */
  rimWidth: 0.1,
  /** How far the rim rises above the felt. */
  rimAboveSurface: 0.04,
  /** How far the rim continues below the underside of the felt slab. */
  rimBelowSlab: 0.02,
  /** Low circular foot sitting on the floor. */
  baseRadius: 1.08,
  baseHeight: 0.12,
  /** Column between the foot and the underside of the rim. */
  pedestalRadius: 0.48,
} as const;

function buildTableLayout() {
  const slabBottomY = TABLE.playingSurfaceY - TABLE.playingThickness;
  const rimTopY = TABLE.playingSurfaceY + TABLE.rimAboveSurface;
  const rimBottomY = slabBottomY - TABLE.rimBelowSlab;
  const outerRadius = TABLE.playingRadius + TABLE.rimWidth;
  const pedestalHeight = rimBottomY - TABLE.baseHeight;

  return {
    playingDiameter: TABLE.playingRadius * 2,
    outerRadius,
    outerDiameter: outerRadius * 2,
    /** Center Y of the felt cylinder (its top is playingSurfaceY). */
    slabCenterY: slabBottomY + TABLE.playingThickness / 2,
    slabBottomY,
    rimTopY,
    rimBottomY,
    rimHeight: rimTopY - rimBottomY,
    baseCenterY: TABLE.baseHeight / 2,
    pedestalHeight,
    pedestalCenterY: TABLE.baseHeight + pedestalHeight / 2,
    center: {
      x: TABLE.centerX,
      y: TABLE.playingSurfaceY,
      z: TABLE.centerZ,
    },
  };
}

/** Derived from `TABLE`. Import this anywhere a computed measurement is needed. */
export const TABLE_LAYOUT = buildTableLayout();
