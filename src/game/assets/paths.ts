/**
 * Static files are served from `public/`.
 * Drop the final table model at:
 *   public/assets/models/bumper-pool-table.glb
 * which is this URL. Phase 1 does not load it.
 */
export const ASSET_PATHS = {
  modelsDir: "/assets/models/",
  texturesDir: "/assets/textures/",
  bumperPoolTable: "/assets/models/bumper-pool-table.glb",
} as const;
