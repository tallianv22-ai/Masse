import { CAMERA } from "@/game/config/camera";
import { ROOM_LAYOUT } from "@/game/config/room";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { publishCameraPose } from "./camera-pose";

/**
 * One finger slides across the floor. The room sticks to that finger.
 * Two fingers look around: drag sideways to turn, up or down to tilt,
 * pinch to zoom. A right-drag does the same look on a mouse.
 * Nothing keeps moving after you let go.
 */

const PITCH_MIN = -0.95;
const PITCH_MAX = 1.05;
const FOV_MIN = 22;
const FOV_MAX = 68;

const _dir = new Vector3();
const _aim = new Vector3();
const _right = new Vector3();
const _forward = new Vector3();

type Pinch = { dist: number; x: number; y: number };

function pinchOf(points: Map<number, { x: number; y: number }>): Pinch | null {
  const pts = [...points.values()];
  if (pts.length < 2) return null;
  const a = pts[0];
  const b = pts[1];
  return {
    dist: Math.hypot(a.x - b.x, a.y - b.y),
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function createLookControls(canvas: HTMLCanvasElement, onChange: () => void) {
  let ready = false;
  let moved = false;
  const eye = new Vector3();
  let eyeY = 1.6;
  let yaw = 0;
  let pitch = 0;
  let fov: number = CAMERA.fov;

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: Pinch | null = null;
  let dragId: number | null = null;
  let dragLooks = false;
  let lastX = 0;
  let lastY = 0;

  const held = { left: false, right: false, up: false, down: false };
  let keyFrame = 0;

  function changed() {
    moved = true;
    onChange();
  }

  function readView(camera: PerspectiveCamera) {
    _dir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    yaw = Math.atan2(_dir.x, _dir.z);
    pitch = Math.asin(MathUtils.clamp(_dir.y, -1, 1));
  }

  function setBasis(camera: PerspectiveCamera) {
    eye.copy(camera.position);
    eyeY = camera.position.y;
    readView(camera);
    fov = camera.fov;
    ready = true;
  }

  function clampEye() {
    const margin = 1.15;
    const limitX = ROOM_LAYOUT.innerWidth / 2 - margin;
    const limitZ = ROOM_LAYOUT.innerDepth / 2 - margin;
    eye.x = MathUtils.clamp(eye.x, -limitX, limitX);
    eye.z = MathUtils.clamp(eye.z, -limitZ, limitZ);
    eye.y = MathUtils.clamp(eyeY, 0.85, ROOM_LAYOUT.height - 0.45);
  }

  function headingAxes() {
    const cp = Math.cos(pitch);
    _forward.set(Math.sin(yaw) * cp, 0, Math.cos(yaw) * cp);
    if (_forward.lengthSq() < 1e-8) _forward.set(0, 0, 1);
    _forward.normalize();
    _right.set(_forward.z, 0, -_forward.x);
  }

  function apply(camera: PerspectiveCamera) {
    if (!ready) return;
    clampEye();
    const cp = Math.cos(pitch);
    _dir.set(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp);
    camera.position.copy(eye);
    _aim.copy(eye).add(_dir);
    camera.up.set(0, 1, 0);
    camera.lookAt(_aim);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    publishCameraPose({
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [_aim.x, _aim.y, _aim.z],
      fov: camera.fov,
    });
  }

  function slideByPixels(dx: number, dy: number) {
    if (!ready) return;
    headingAxes();
    const span = Math.min(ROOM_LAYOUT.innerWidth, ROOM_LAYOUT.innerDepth) * 0.62;
    const view = Math.max(canvas.clientHeight, 1);
    const k = span / view;
    eye.addScaledVector(_right, -dx * k);
    eye.addScaledVector(_forward, dy * k);
    eye.y = eyeY;
  }

  function lookByPixels(dx: number, dy: number) {
    if (!ready) return;
    const viewW = Math.max(canvas.clientWidth, 1);
    const viewH = Math.max(canvas.clientHeight, 1);
    yaw -= (dx / viewW) * Math.PI * 1.35;
    pitch = MathUtils.clamp(pitch + (dy / viewH) * (PITCH_MAX - PITCH_MIN), PITCH_MIN, PITCH_MAX);
  }

  function zoomBy(factor: number) {
    if (!ready || !Number.isFinite(factor) || factor <= 0) return;
    fov = MathUtils.clamp(fov / factor, FOV_MIN, FOV_MAX);
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
      dragLooks = false;
      pinch = pinchOf(pointers);
      return;
    }
    dragId = event.pointerId;
    dragLooks = event.button === 2;
    lastX = event.clientX;
    lastY = event.clientY;
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2 && pinch) {
      const next = pinchOf(pointers);
      if (!next || pinch.dist < 8) return;
      const dx = next.x - pinch.x;
      const dy = next.y - pinch.y;
      if (dx !== 0 || dy !== 0) lookByPixels(dx, dy);
      zoomBy(next.dist / pinch.dist);
      pinch = next;
      changed();
      return;
    }

    if (dragId !== event.pointerId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    if (dx === 0 && dy === 0) return;
    if (dragLooks) lookByPixels(dx, dy);
    else slideByPixels(dx, dy);
    changed();
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      pinch = null;
      const [id, point] = [...pointers.entries()][0];
      dragId = id;
      dragLooks = false;
      lastX = point.x;
      lastY = point.y;
    } else {
      pinch = null;
      dragId = null;
      dragLooks = false;
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
    zoomBy(Math.exp(-event.deltaY * 0.0015));
    changed();
  }

  function onContextMenu(event: Event) {
    event.preventDefault();
  }

  function pumpKeys() {
    keyFrame = 0;
    if (!ready) return;
    let active = false;
    if (held.left) {
      yaw -= 0.02;
      active = true;
    }
    if (held.right) {
      yaw += 0.02;
      active = true;
    }
    if (held.up) {
      pitch = Math.min(PITCH_MAX, pitch + 0.016);
      active = true;
    }
    if (held.down) {
      pitch = Math.max(PITCH_MIN, pitch - 0.016);
      active = true;
    }
    if (!active) return;
    changed();
    keyFrame = requestAnimationFrame(pumpKeys);
  }

  function kickKeys() {
    if (!keyFrame) keyFrame = requestAnimationFrame(pumpKeys);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) return;
    if (event.key === "ArrowLeft") held.left = true;
    else if (event.key === "ArrowRight") held.right = true;
    else if (event.key === "ArrowUp") held.up = true;
    else if (event.key === "ArrowDown") held.down = true;
    else return;
    event.preventDefault();
    kickKeys();
  }

  function onKeyUp(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") held.left = false;
    else if (event.key === "ArrowRight") held.right = false;
    else if (event.key === "ArrowUp") held.up = false;
    else if (event.key === "ArrowDown") held.down = false;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    hasMoved: () => moved,
    setBasis,
    apply,
    dispose() {
      if (keyFrame) cancelAnimationFrame(keyFrame);
      canvas.classList.remove("is-looking");
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
