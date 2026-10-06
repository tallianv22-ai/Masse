import { ASSET_PATHS } from "@/game/assets/paths";
import { COLORS } from "@/game/config/presentation";
import { ROOM, ROOM_LAYOUT } from "@/game/config/room";
import { Box3, BoxGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const _box = new Box3();
const _size = new Vector3();

/**
 * Floor, ceiling, and the four-wall model.
 * The mesh is scaled to ROOM_LAYOUT so the table sits in a large room.
 */
export function createRoom(onReady?: () => void) {
  const group = new Group();
  group.name = "Room";

  const floorMat = new MeshStandardMaterial({ color: COLORS.floor, roughness: 0.92, metalness: 0 });
  const ceilMat = new MeshStandardMaterial({ color: COLORS.ceiling, roughness: 1, metalness: 0 });

  const floor = new Mesh(new BoxGeometry(1, ROOM.floorThickness, 1), floorMat);
  floor.name = "Floor";
  floor.scale.set(ROOM_LAYOUT.width, 1, ROOM_LAYOUT.depth);
  floor.position.y = -ROOM.floorThickness / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new Mesh(new BoxGeometry(1, ROOM.floorThickness, 1), ceilMat);
  ceiling.name = "Ceiling";
  ceiling.scale.set(ROOM_LAYOUT.width, 1, ROOM_LAYOUT.depth);
  ceiling.position.y = ROOM_LAYOUT.height + ROOM.floorThickness / 2;
  group.add(ceiling);

  const loader = new GLTFLoader();
  loader.load(
    encodeURI(ASSET_PATHS.walls),
    (gltf) => {
      const model = gltf.scene;
      model.name = "Walls";
      model.updateMatrixWorld(true);
      _box.setFromObject(model);
      _box.getSize(_size);
      const scale = ROOM_LAYOUT.depth / Math.max(_size.z, 0.001);
      model.scale.setScalar(scale);
      model.traverse((object) => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          if (!(material instanceof MeshStandardMaterial)) continue;
          material.side = DoubleSide;
          material.metalness = 0;
          material.roughness = 0.9;
          if (!material.map) material.color.set("#e7e2d8");
        }
      });
      group.add(model);
      onReady?.();
    },
    undefined,
    (error) => {
      console.error("Failed to load the wall mesh", error);
    },
  );

  return group;
}
