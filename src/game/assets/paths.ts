/**
 * Static files are served from `public/`.
 * The table model lives at public/Models/Tables/Ogtable.glb
 * (URL keeps that casing — the dev server is case-sensitive).
 */
export const ASSET_PATHS = {
  modelsDir: "/Models/",
  texturesDir: "/assets/textures/",
  bumperPoolTable: "/Models/Tables/Ogtable.glb",
} as const;
