import { ASSET_PATHS } from "@/game/assets/paths";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { Box3, Group, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const _box = new Box3();
const _size = new Vector3();

/**
 * Loads Ogtable.glb into a group on the world origin.
 * The file is a unit-scale disc (about 1 m across, sitting on y = 0).
 * It is scaled uniformly so its widest axis matches the configured
 * outer diameter. The base stays on the floor and the top stays horizontal.
 */
export function createOgTable(onReady?: () => void) {
  const group = new Group();
  group.name = "OgTable";

  const loader = new GLTFLoader();
  loader.load(
    ASSET_PATHS.bumperPoolTable,
    (gltf) => {
      const model = gltf.scene;
      model.name = "Ogtable";
      model.updateMatrixWorld(true);
      _box.setFromObject(model);
      _box.getSize(_size);
      const diameter = Math.max(_size.x, _size.z, 0.001);
      const scale = TABLE_LAYOUT.outerDiameter / diameter;
      model.scale.setScalar(scale);
      model.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      });
      group.add(model);
      group.userData = {
        modelUrl: ASSET_PATHS.bumperPoolTable,
        sourceDiameter: diameter,
        sourceHeight: _size.y,
        scale,
        fittedHeight: _size.y * scale,
        playingSurfaceY: TABLE.playingSurfaceY,
        outerRadius: TABLE_LAYOUT.outerRadius,
      };
      onReady?.();
    },
    undefined,
    (error) => {
      console.error("Failed to load Ogtable.glb", error);
    },
  );

  return group;
}
