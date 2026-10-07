import { WORLD } from "./world";

/**
 * Table measurements, in meters.
 * Ogtable.glb is about 1 m across. It is scaled uniformly to `outerDiameter`.
 * These figures are 3× the first fitted size (felt was 0.64, outer diameter 3.2).
 * The felt height scales with the model because the file sits on the floor.
 */
export const TABLE = {
  centerX: WORLD.origin.x,
  centerZ: WORLD.origin.z,
  /** World Y of the top of the felt — the plane balls will rest on. */
  playingSurfaceY: 1.92,
  /** Radius of the circular playing surface. */
  playingRadius: 4.5,
  /** Thickness of the playing-surface slab. */
  playingThickness: 0.15,
  /** How far the outer rim extends past the playing radius. */
  rimWidth: 0.3,
  /** How far the rim rises above the felt. Measured on the fitted Ogtable.glb. */
  rimAboveSurface: 0.27,
  /** How far the rim continues below the underside of the felt slab. */
  rimBelowSlab: 0.06,
  /** Low circular foot sitting on the floor. */
  baseRadius: 3.24,
  baseHeight: 0.36,
  /** Column between the foot and the underside of the rim. */
  pedestalRadius: 1.44,
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
