import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import {
  AxesHelper,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";

/** World axes, surface center, and playing-radius ring. Hidden unless debug is on. */
export function createDebugMarkers() {
  const group = new Group();
  group.name = "DebugMarkers";
  const center = TABLE_LAYOUT.center;

  const axes = new AxesHelper(0.9);
  const materials = Array.isArray(axes.material) ? axes.material : [axes.material];
  for (const material of materials) {
    material.depthTest = false;
    material.transparent = true;
  }
  axes.renderOrder = 20;
  group.add(axes);

  const dot = new Mesh(
    new SphereGeometry(0.04, 16, 12),
    new MeshBasicMaterial({ color: "#e6c35c", depthTest: false }),
  );
  dot.position.set(center.x, center.y, center.z);
  dot.renderOrder = 20;
  group.add(dot);

  const ring = new Mesh(
    new RingGeometry(TABLE.playingRadius - 0.014, TABLE.playingRadius, 80),
    new MeshBasicMaterial({
      color: "#e6c35c",
      depthTest: false,
      side: DoubleSide,
      transparent: true,
      opacity: 0.9,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(center.x, center.y + 0.006, center.z);
  ring.renderOrder = 20;
  group.add(ring);

  return group;
}
