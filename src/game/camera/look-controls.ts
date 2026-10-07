import { CAMERA } from "@/game/config/camera";
import { ROOM_LAYOUT } from "@/game/config/room";
import { MathUtils, PerspectiveCamera, Spherical, Vector3 } from "three";
import { publishCameraPose } from "./camera-pose";

/**
 * One finger slides the view across the floor.
 * Two fingers tilt, zoom, and rotate together.
 * The motion is 1:1 with the fingers — no flick.
 */

const PHI_MIN = 0.3;
const PHI_MAX = 1.22;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.35;

const baseTarget = new Vector3();
const target = new Vector3();
const nextPos = new Vector3();
const look = new Vector3();
const camRight = new Vector3();
const camUp = new Vector3();
const pan = new Vector3();
const worldUp = new Vector3(0, 1, 0);
const sph = new Spherical();

type Pinch = { dist: number; x: number; y: number; angle: number };

function pinchOf(points: Map<number, { x: number; y: number }>): Pinch | null {
  const pts = [...points.values()];
  if (pts.length < 2) return null;
  const a = pts[0];
  const b = pts[1];
  return {
    dist: Math.hypot(a.x - b.x, a.y - b.y),
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  };
}

function wrapAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function frameSpherical(dist: number, baseTheta: number, basePhi: number, yaw: number, pitch: number, zoom: number) {
  sph.theta = baseTheta + yaw;
  sph.phi = Math.min(PHI_MAX, Math.max(PHI_MIN, basePhi + pitch));
  sph.radius = dist * zoom;
}

function keepInsideRoom(p: Vector3) {
  const maxR = ROOM_LAYOUT.innerDepth / 2 - 1.15;
  const horiz = Math.hypot(p.x, p.z);
  if (horiz > maxR) {
    const k = maxR / horiz;
    p.x *= k;
    p.z *= k;
  }
  p.y = MathUtils.clamp(p.y, 0.4, ROOM_LAYOUT.height - 0.35);
}

export function createLookControls(canvas: HTMLCanvasElement, onChange: () => void) {
  let ready = false;
  let moved = false;
  let dist = 1;
  let fov: number = CAMERA.fov;
  let baseTheta = 0;
  let basePhi = 0.8;
  let zoom = 1;
  let yaw = 0;
  let pitch = 0;

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: Pinch | null = null;
  let dragId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  function changed() {
    moved = true;
    onChange();
  }

  function setBasis(camera: PerspectiveCamera) {
    baseTarget.set(CAMERA.target[0], CAMERA.target[1], CAMERA.target[2]);
    sph.setFromVector3(camera.position.clone().sub(baseTarget));
    dist = Math.max(sph.radius, 0.05);
    baseTheta = sph.theta;
    basePhi = sph.phi;
    fov = camera.fov;
    yaw = 0;
    pitch = 0;
    zoom = 1;
    pan.set(0, 0, 0);
    ready = true;
  }

  function apply(camera: PerspectiveCamera) {
    if (!ready) return;
    frameSpherical(dist, baseTheta, basePhi, yaw, pitch, zoom);
    target.copy(baseTarget).add(pan);
    nextPos.setFromSpherical(sph).add(target);
    keepInsideRoom(nextPos);
    camera.position.copy(nextPos);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    publishCameraPose({
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [target.x, target.y, target.z],
      fov: camera.fov,
    });
  }

  function viewAxes() {
    frameSpherical(dist, baseTheta, basePhi, yaw, pitch, zoom);
    nextPos.setFromSpherical(sph);
    look.copy(nextPos).negate().normalize();
    camRight.crossVectors(look, worldUp);
    if (camRight.lengthSq() < 1e-8) camRight.set(1, 0, 0);
    camRight.normalize();
    camUp.crossVectors(camRight, look).normalize();
  }

  function slideByPixels(dx: number, dy: number, viewHeightPx: number) {
    if (!ready) return;
    viewAxes();
    const worldH = 2 * sph.radius * Math.tan((fov * Math.PI) / 360);
    const k = worldH / Math.max(viewHeightPx, 1);
    const right = camRight.clone();
    right.y = 0;
    if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
    right.normalize();
    const forward = look.clone();
    forward.y = 0;
    if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
    forward.normalize();
    pan.addScaledVector(right, -dx * k);
    pan.addScaledVector(forward, dy * k);
    pan.y = 0;
    const limitX = ROOM_LAYOUT.innerWidth / 2 - 2.4;
    const limitZ = ROOM_LAYOUT.innerDepth / 2 - 2.4;
    pan.x = MathUtils.clamp(pan.x, -limitX, limitX);
    pan.z = MathUtils.clamp(pan.z, -limitZ, limitZ);
  }

  function tiltByPixels(dy: number, viewHeightPx: number) {
    if (!ready) return;
    pitch = MathUtils.clamp(pitch + (dy / Math.max(viewHeightPx, 1)) * 1.15, PHI_MIN - basePhi, PHI_MAX - basePhi);
  }

  function turnByAngle(dAngle: number) {
    if (!ready || !Number.isFinite(dAngle)) return;
    yaw -= dAngle;
  }

  function zoomBy(factor: number) {
    if (!ready || !Number.isFinite(factor) || factor <= 0) return;
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom / factor));
  }

  function onPointerDown(event: PointerEvent) {
    if (!ready) return;
    if ((event.target as HTMLElement).closest("button")) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.classList.add("is-looking");
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    if (pointers.size >= 2) {
      dragId = null;
      pinch = pinchOf(pointers);
      return;
    }
    dragId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const viewH = canvas.clientHeight || 1;

    if (pointers.size >= 2 && pinch) {
      const next = pinchOf(pointers);
      if (next && pinch.dist > 8) {
        zoomBy(next.dist / pinch.dist);
        tiltByPixels(next.y - pinch.y, viewH);
        turnByAngle(wrapAngle(next.angle - pinch.angle));
        pinch = next;
        changed();
      }
      return;
    }

    if (dragId !== event.pointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (dx === 0 && dy === 0) return;
    slideByPixels(dx, dy, viewH);
    changed();
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      pinch = null;
      const [id, point] = [...pointers.entries()][0];
      dragId = id;
      lastX = point.x;
      lastY = point.y;
    } else {
      pinch = null;
      dragId = null;
      canvas.classList.remove("is-looking");
    }
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    zoomBy(Math.exp(-event.deltaY * 0.0016));
    changed();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) return;
    const viewH = canvas.clientHeight || 1;
    if (event.key === "ArrowLeft") turnByAngle(-Math.PI * 40 / viewH);
    else if (event.key === "ArrowRight") turnByAngle(Math.PI * 40 / viewH);
    else if (event.key === "ArrowUp") pitch = MathUtils.clamp(pitch - 0.06, PHI_MIN - basePhi, PHI_MAX - basePhi);
    else if (event.key === "ArrowDown") pitch = MathUtils.clamp(pitch + 0.06, PHI_MIN - basePhi, PHI_MAX - basePhi);
    else return;
    event.preventDefault();
    changed();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);

  return {
    hasMoved: () => moved,
    setBasis,
    apply,
    dispose() {
      canvas.classList.remove("is-looking");
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    },
  };
}

