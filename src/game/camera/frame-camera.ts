import { CAMERA } from "@/game/config/camera";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { PerspectiveCamera, Vector3 } from "three";
import { publishCameraPose } from "./camera-pose";

const _offset = new Vector3();
const _target = new Vector3();
const _camSpace = new Vector3();
const _ndc = new Vector3();

/** Silhouette samples: outer rim (top and bottom) and the foot on the floor. */
const FRAMING_POINTS = buildFramingPoints();

function buildFramingPoints() {
  const points: Vector3[] = [];
  const rings = [
    { y: TABLE_LAYOUT.rimTopY, radius: TABLE_LAYOUT.outerRadius },
    { y: TABLE_LAYOUT.rimBottomY, radius: TABLE_LAYOUT.outerRadius },
    { y: 0, radius: TABLE.baseRadius },
  ];
  const samples = 24;
  for (const ring of rings) {
    for (let i = 0; i < samples; i++) {
      const angle = (i / samples) * Math.PI * 2;
      points.push(
        new Vector3(Math.cos(angle) * ring.radius, ring.y, Math.sin(angle) * ring.radius),
      );
    }
  }
  return points;
}

function applyPose(camera: PerspectiveCamera, distance: number, fov: number) {
  camera.fov = fov;
  camera.near = CAMERA.near;
  camera.far = CAMERA.far;
  camera.position.copy(_target).addScaledVector(_offset, distance);
  camera.up.set(0, 1, 0);
  camera.lookAt(_target);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

function fits(camera: PerspectiveCamera) {
  const margin = CAMERA.fitMargin;
  const min = -1 + margin;
  const max = 1 - margin;
  for (const point of FRAMING_POINTS) {
    _camSpace.copy(point).applyMatrix4(camera.matrixWorldInverse);
    // The camera looks down its local -Z, so points in front have negative Z.
    if (_camSpace.z >= -camera.near) return false;
    _ndc.copy(point).project(camera);
    if (_ndc.x < min || _ndc.x > max || _ndc.y < min || _ndc.y > max) return false;
  }
  return true;
}

function solveDistance(camera: PerspectiveCamera, fov: number) {
  let lo: number = CAMERA.minDistance;
  let hi: number = CAMERA.maxDistance;
  let best: number = CAMERA.maxDistance;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) * 0.5;
    applyPose(camera, mid, fov);
    if (fits(camera)) {
      best = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

/**
 * Places the fixed three-quarter camera so the placeholder table stays
 * fully in frame at the viewport's real aspect ratio.
 */
export function frameGameCamera(camera: PerspectiveCamera, aspect: number) {
  _target.set(CAMERA.target[0], CAMERA.target[1], CAMERA.target[2]);
  _offset.set(CAMERA.offset[0], CAMERA.offset[1], CAMERA.offset[2]);
  if (_offset.lengthSq() === 0) _offset.set(0, 1, 1);
  _offset.normalize();

  camera.aspect = Math.max(aspect, 0.01);

  let fov: number = CAMERA.fov;
  let distance = solveDistance(camera, fov);
  applyPose(camera, distance, fov);

  if (!fits(camera)) {
    let lo: number = CAMERA.fov;
    let hi: number = CAMERA.maxFov;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) * 0.5;
      applyPose(camera, CAMERA.maxDistance, mid);
      if (fits(camera)) hi = mid;
      else lo = mid;
    }
    fov = hi;
    distance = CAMERA.maxDistance;
    applyPose(camera, distance, fov);
  }

  publishCameraPose({
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [CAMERA.target[0], CAMERA.target[1], CAMERA.target[2]],
    fov: camera.fov,
  });
}
