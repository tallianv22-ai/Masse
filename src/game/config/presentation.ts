/**
 * Neutral Phase 1 lighting and materials.
 * Tuned to read the felt and the table silhouette — not a final grade.
 * three r155+ lights are physically scaled, so intensities are around π
 * times a classic "legacy" brightness.
 */
export const COLORS = {
  background: "#14161a",
  floor: "#2e2b28",
  wall: "#1b1d21",
  ceiling: "#121418",
  trim: "#2c3036",
  felt: "#1c7a48",
  rim: "#3d3129",
  rimInner: "#2b241f",
  pedestal: "#231e1b",
  base: "#171412",
} as const;

export const LIGHTS = {
  ambientIntensity: 0.72,
  ambientColor: "#d7dce4",
  hemiIntensity: 0.9,
  hemiSky: "#e7ecf3",
  hemiGround: "#3e3a36",
  keyIntensity: 4.4,
  keyColor: "#f4f2ee",
  keyPosition: [5.4, 8.4, 4.2] as [number, number, number],
  fillIntensity: 0.9,
  fillColor: "#d2dae6",
  fillPosition: [-6.2, 3.6, -3.4] as [number, number, number],
  exposure: 1.02,
  shadowMapSize: 2048,
  shadowBias: -0.00035,
  shadowNormalBias: 0.04,
  shadowExtent: 7,
  shadowNear: 0.5,
  shadowFar: 28,
} as const;
