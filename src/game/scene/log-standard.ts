import { getCameraPose } from "@/game/camera/camera-pose";
import { ASSET_PATHS } from "@/game/assets/paths";
import { CAMERA } from "@/game/config/camera";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { WORLD } from "@/game/config/world";

let logged = false;

/** One console snapshot of the coordinate standard. Not part of the picture. */
export function logSceneStandardOnce() {
  if (logged || typeof window === "undefined") return;
  logged = true;

  const pose = getCameraPose();
  const snapshot = {
    origin: [WORLD.origin.x, WORLD.origin.y, WORLD.origin.z],
    up: WORLD.upAxis,
    plane: WORLD.plane,
    floorY: WORLD.floorY,
    tableCenter: [TABLE_LAYOUT.center.x, TABLE_LAYOUT.center.y, TABLE_LAYOUT.center.z],
    playingSurfaceY: TABLE.playingSurfaceY,
    playingRadius: TABLE.playingRadius,
    playingDiameter: TABLE_LAYOUT.playingDiameter,
    outerRadius: TABLE_LAYOUT.outerRadius,
    cameraPosition: pose.position,
    cameraTarget: pose.target,
    cameraFov: pose.fov,
    cameraOffset: CAMERA.offset,
    modelSlot: ASSET_PATHS.bumperPoolTable,
  };

  console.info("[bumper-pool] phase 1 coordinate standard", snapshot);
  console.info("[bumper-pool] debug overlay: press ` or add ?debug=1");

  window.__bumperPool = {
    ...snapshot,
    getCameraPose,
  };
}

declare global {
  interface Window {
    __bumperPool?: Record<string, unknown>;
  }
}
