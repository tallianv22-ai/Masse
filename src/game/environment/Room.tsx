import { COLORS } from "@/game/config/presentation";
import { ROOM, ROOM_LAYOUT } from "@/game/config/room";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

/** A large floor. No walls and no ceiling. */
export function createRoom() {
  const group = new Group();
  group.name = "Room";

  const floor = new Mesh(
    new BoxGeometry(1, ROOM.floorThickness, 1),
    new MeshStandardMaterial({ color: COLORS.floor, roughness: 0.92, metalness: 0 }),
  );
  floor.name = "Floor";
  floor.scale.set(ROOM_LAYOUT.width, 1, ROOM_LAYOUT.depth);
  floor.position.y = -ROOM.floorThickness / 2;
  floor.receiveShadow = true;
  group.add(floor);

  return group;
}