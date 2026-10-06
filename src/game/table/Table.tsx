import { ASSET_PATHS } from "@/game/assets/paths";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { createPlaceholderTable } from "./PlaceholderTable";

/**
 * The only scene slot for the bumper-pool table.
 *
 * Phase 1 builds `PlaceholderTable`. To drop in the real model later:
 * 1. Place the file at public/assets/models/bumper-pool-table.glb
 *    (URL: ASSET_PATHS.bumperPoolTable). Do not point a loader at a
 *    missing file before that.
 * 2. Replace `createPlaceholderTable()` in this function with the GLB.
 * 3. Keep the playing-surface center on TABLE_LAYOUT.center and the
 *    surface horizontal. If the model’s radius or height differ, update
 *    `src/game/config/table.ts` — that file is the measurement source
 *    for every future gameplay object.
 *
 * Do not mount a second table anywhere else in the scene.
 */
export function createTable() {
  return createPlaceholderTable();
}

export const TABLE_SLOT = {
  modelUrl: ASSET_PATHS.bumperPoolTable,
  center: TABLE_LAYOUT.center,
  playingSurfaceY: TABLE.playingSurfaceY,
  playingRadius: TABLE.playingRadius,
} as const;
