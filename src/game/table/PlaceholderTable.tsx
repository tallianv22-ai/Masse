import { ASSET_PATHS } from "@/game/assets/paths";
import { COLORS } from "@/game/config/presentation";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import {
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  RingGeometry,
} from "three";

const RADIAL_SEGMENTS = 72;

/**
 * Temporary circular table. The group name is `PlaceholderTable` so it
 * can be removed when the GLB at `ASSET_PATHS.bumperPoolTable` replaces it.
 * Geometry is only cylinders and rings — no gameplay colliders.
 *
 * The group sits on the world origin (the floor under the table).
 * The felt top is exactly TABLE.playingSurfaceY and is horizontal.
 */
export function createPlaceholderTable() {
  const layout = TABLE_LAYOUT;
  const feltRadius = TABLE.playingRadius + 0.002;
  const rimInner = TABLE.playingRadius;
  const rimOuter = layout.outerRadius;
  const rimMidY = layout.rimBottomY + layout.rimHeight / 2;
  const baseHeight = TABLE.baseHeight + 0.02;
  const baseCenterY = TABLE.baseHeight / 2 - 0.01;
  const pedestalHeight = layout.pedestalHeight + 0.02;
  const pedestalCenterY = layout.pedestalCenterY - 0.01;

  const group = new Group();
  group.name = "PlaceholderTable";
  group.position.set(TABLE.centerX, 0, TABLE.centerZ);
  group.userData = {
    placeholder: true,
    replaceWith: ASSET_PATHS.bumperPoolTable,
    playingSurfaceY: TABLE.playingSurfaceY,
    playingRadius: TABLE.playingRadius,
    playingDiameter: layout.playingDiameter,
  };

  const baseMat = new MeshStandardMaterial({ color: COLORS.base, roughness: 0.82, metalness: 0 });
  const pedestalMat = new MeshStandardMaterial({ color: COLORS.pedestal, roughness: 0.78, metalness: 0 });
  const rimMat = new MeshStandardMaterial({ color: COLORS.rim, roughness: 0.56, metalness: 0, side: DoubleSide });
  const rimInnerMat = new MeshStandardMaterial({
    color: COLORS.rimInner,
    roughness: 0.7,
    metalness: 0,
    side: DoubleSide,
  });
  const rimTopMat = new MeshStandardMaterial({ color: COLORS.rim, roughness: 0.5, metalness: 0, side: DoubleSide });
  const feltMat = new MeshStandardMaterial({ color: COLORS.felt, roughness: 0.8, metalness: 0 });

  const base = new Mesh(new CylinderGeometry(TABLE.baseRadius, TABLE.baseRadius, baseHeight, RADIAL_SEGMENTS), baseMat);
  base.name = "TableBase";
  base.position.y = baseCenterY;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const pedestal = new Mesh(
    new CylinderGeometry(TABLE.pedestalRadius, TABLE.pedestalRadius, pedestalHeight, RADIAL_SEGMENTS),
    pedestalMat,
  );
  pedestal.name = "TablePedestal";
  pedestal.position.y = pedestalCenterY;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  const outerRim = new Mesh(
    new CylinderGeometry(rimOuter, rimOuter, layout.rimHeight, RADIAL_SEGMENTS, 1, true),
    rimMat,
  );
  outerRim.name = "OuterRim";
  outerRim.position.y = rimMidY;
  outerRim.castShadow = true;
  outerRim.receiveShadow = true;
  group.add(outerRim);

  const innerRim = new Mesh(
    new CylinderGeometry(rimInner, rimInner, layout.rimHeight, RADIAL_SEGMENTS, 1, true),
    rimInnerMat,
  );
  innerRim.name = "InnerRim";
  innerRim.position.y = rimMidY;
  innerRim.castShadow = true;
  innerRim.receiveShadow = true;
  group.add(innerRim);

  const rimTop = new Mesh(new RingGeometry(rimInner, rimOuter, RADIAL_SEGMENTS), rimTopMat);
  rimTop.name = "RimTop";
  rimTop.rotation.x = -Math.PI / 2;
  rimTop.position.y = layout.rimTopY;
  rimTop.receiveShadow = true;
  group.add(rimTop);

  const rimBottom = new Mesh(
    new RingGeometry(rimInner, rimOuter, RADIAL_SEGMENTS),
    new MeshStandardMaterial({ color: COLORS.rim, roughness: 0.72, metalness: 0, side: DoubleSide }),
  );
  rimBottom.name = "RimBottom";
  rimBottom.rotation.x = -Math.PI / 2;
  rimBottom.position.y = layout.rimBottomY;
  group.add(rimBottom);

  const felt = new Mesh(
    new CylinderGeometry(feltRadius, feltRadius, TABLE.playingThickness, RADIAL_SEGMENTS),
    feltMat,
  );
  felt.name = "PlayingSurface";
  felt.position.y = layout.slabCenterY;
  felt.castShadow = true;
  felt.receiveShadow = true;
  group.add(felt);

  return group;
}
