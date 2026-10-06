import { COLORS } from "@/game/config/presentation";
import { ROOM } from "@/game/config/room";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

/**
 * Restrained hall. The table is the subject — no windows, furniture, or props.
 * Swap this builder when the real environment is ready.
 */
export function createRoom() {
  const inner = ROOM.halfExtent;
  const thickness = ROOM.wallThickness;
  const span = inner * 2 + thickness * 2;
  const wallY = ROOM.wallHeight / 2;
  const group = new Group();
  group.name = "Room";

  const floorMat = new MeshStandardMaterial({ color: COLORS.floor, roughness: 0.92, metalness: 0 });
  const wallMat = new MeshStandardMaterial({ color: COLORS.wall, roughness: 0.96, metalness: 0 });
  const ceilMat = new MeshStandardMaterial({ color: COLORS.ceiling, roughness: 1, metalness: 0 });
  const trimMat = new MeshStandardMaterial({ color: COLORS.trim, roughness: 0.9, metalness: 0 });

  const floor = new Mesh(new BoxGeometry(span, ROOM.floorThickness, span), floorMat);
  floor.name = "Floor";
  floor.position.y = -ROOM.floorThickness / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new Mesh(new BoxGeometry(span, ROOM.floorThickness, span), ceilMat);
  ceiling.name = "Ceiling";
  ceiling.position.y = ROOM.wallHeight + ROOM.floorThickness / 2;
  group.add(ceiling);

  const walls: Array<[string, number, number, number, number, number, number]> = [
    ["WallNorth", 0, wallY, -inner - thickness / 2, span, ROOM.wallHeight, thickness],
    ["WallSouth", 0, wallY, inner + thickness / 2, span, ROOM.wallHeight, thickness],
    ["WallWest", -inner - thickness / 2, wallY, 0, thickness, ROOM.wallHeight, span],
    ["WallEast", inner + thickness / 2, wallY, 0, thickness, ROOM.wallHeight, span],
  ];
  for (const [name, x, y, z, w, h, d] of walls) {
    const mesh = new Mesh(new BoxGeometry(w, h, d), wallMat);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  const height = ROOM.baseboardHeight;
  const depth = ROOM.baseboardDepth;
  const y = height / 2;
  const inset = inner - depth / 2;
  const length = inner * 2;
  const boards: Array<[number, number, number, number, number, number]> = [
    [0, y, -inset, length, height, depth],
    [0, y, inset, length, height, depth],
    [-inset, y, 0, depth, height, length],
    [inset, y, 0, depth, height, length],
  ];
  const trim = new Group();
  trim.name = "Baseboards";
  for (const [x, by, z, w, h, d] of boards) {
    const mesh = new Mesh(new BoxGeometry(w, h, d), trimMat);
    mesh.position.set(x, by, z);
    mesh.receiveShadow = true;
    trim.add(mesh);
  }
  group.add(trim);

  return group;
}
