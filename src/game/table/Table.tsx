import { ASSET_PATHS } from "@/game/assets/paths";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { createOgTable } from "./OgTable";

/**
 * The only scene slot for the bumper-pool table.
 * Ogtable.glb replaces the placeholder. Do not mount a second table.
 */
export function createTable(onReady?: () => void) {
  return createOgTable(onReady);
}

export const TABLE_SLOT = {
  modelUrl: ASSET_PATHS.bumperPoolTable,
  center: TABLE_LAYOUT.center,
  playingSurfaceY: TABLE.playingSurfaceY,
  playingRadius: TABLE.playingRadius,
} as const;
