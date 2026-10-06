import { CAMERA } from "@/game/config/camera";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { publishCameraPose } from "./camera-pose";

const _dir = new Vector3();
const _target = new Vector3();

const LOOK = CAMERA.look;

function clampPitch(pitch: number) {
  return MathUtils.clamp(pitch, LOOK.pitchMin, LOOK.pitchMax);
}

function clampFov(fov: number) {
  return MathUtils.clamp(fov, LOOK.fovMin, LOOK.fovMax);
}

function readView(camera: PerspectiveCamera) {
  _dir.set(0, 0, -1).applyQuaternion(camera.quaternion);
  return {
    yaw: Math.atan2(_dir.x, _dir.z),
    pitch: Math.asin(MathUtils.clamp(_dir.y, -1, 1)),
    fov: camera.fov,
  };
}

/**
 * Drag to look around the room. One finger or the mouse turns the view.
 * The scene follows the pointer. Pinch or the wheel zooms.
 * Double-tap returns to the starting view of the table.
 * The camera position stays fixed, inside the room.
 */
export function createLookControls(canvas: HTMLCanvasElement, onChange: () => void) {
  let yaw = 0;
  let pitch = 0;
  let fov: number = CAMERA.fov;
  let homeYaw = 0;
  let homePitch = 0;
  let homeFov: number = CAMERA.fov;
  let moved = false;

  let yawVel = 0;
  let pitchVel = 0;
  let dragging = false;
  let pointerTravel = 0;
  let lastTap = 0;
  let raf = 0;
  let resetFrom = 0;
  let resetYaw = 0;
  let resetPitch = 0;
  let resetFov = 0;
  let resetting = false;

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchStart = 0;
  let fovAtPinch: number = fov;

  const held = { left: false, right: false, up: false, down: false };

  function publish(camera: PerspectiveCamera) {
    publishCameraPose({
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [camera.position.x + _dir.x, camera.position.y + _dir.y, camera.position.z + _dir.z],
      fov: camera.fov,
    });
  }

  function apply(camera: PerspectiveCamera) {
    const cp = Math.cos(pitch);
    _dir.set(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp);
    _target.copy(camera.position).add(_dir);
    camera.up.set(0, 1, 0);
    camera.lookAt(_target);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    publish(camera);
  }

  function syncFromCamera(camera: PerspectiveCamera) {
    const view = readView(camera);
    yaw = view.yaw;
    pitch = view.pitch;
    fov = view.fov;
    if (!moved) {
      homeYaw = yaw;
      homePitch = pitch;
      homeFov = fov;
    }
    publish(camera);
  }

  function kick() {
    if (raf) return;
    raf = requestAnimationFrame(pump);
  }

  function pump() {
    raf = 0;
    let active = false;

    if (resetting) {
      const t = Math.min(1, (performance.now() - resetFrom) / 320);
      const ease = 1 - (1 - t) * (1 - t);
      let dyaw = homeYaw - resetYaw;
      dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
      yaw = resetYaw + dyaw * ease;
      pitch = resetPitch + (homePitch - resetPitch) * ease;
      fov = resetFov + (homeFov - resetFov) * ease;
      if (t >= 1) {
        resetting = false;
        moved = false;
        onChange();
        return;
      }
      active = true;
    } else if (!dragging) {
      if (held.left) yaw -= 0.02;
      if (held.right) yaw += 0.02;
      if (held.up) pitch += 0.016;
      if (held.down) pitch -= 0.016;
      if (held.left || held.right || held.up || held.down) active = true;

      yaw += yawVel;
      pitch += pitchVel;
      yawVel *= LOOK.inertia;
      pitchVel *= LOOK.inertia;
      if (Math.abs(yawVel) > 0.00035 || Math.abs(pitchVel) > 0.00035) active = true;
      else {
        yawVel = 0;
        pitchVel = 0;
      }
    }

    pitch = clampPitch(pitch);
    if (pitch === LOOK.pitchMin || pitch === LOOK.pitchMax) pitchVel = 0;

    if (active || dragging) onChange();
    if (active) kick();
  }

  function pinchDistance() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  function onPointerDown(event: PointerEvent) {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    canvas.setPointerCapture(event.pointerId);
    yawVel = 0;
    pitchVel = 0;
    resetting = false;
    pointerTravel = 0;
    if (pointers.size === 1) {
      dragging = true;
      canvas.classList.add("is-looking");
    } else {
      dragging = false;
      pinchStart = pinchDistance();
      fovAtPinch = fov;
    }
  }

  function onPointerMove(event: PointerEvent) {
    const prev = pointers.get(event.pointerId);
    if (!prev) return;
    const dx = event.clientX - prev.x;
    const dy = event.clientY - prev.y;
    prev.x = event.clientX;
    prev.y = event.clientY;
    pointerTravel += Math.hypot(dx, dy);

    if (pointers.size >= 2) {
      const dist = pinchDistance();
      if (pinchStart > 8) {
        moved = true;
        fov = clampFov(fovAtPinch * (pinchStart / dist));
        onChange();
      }
      return;
    }

    if (!dragging) return;
    if (pointerTravel > 4) moved = true;
    yaw -= dx * LOOK.yawSpeed;
    pitch = clampPitch(pitch + dy * LOOK.pitchSpeed);
    yawVel = -dx * LOOK.yawSpeed;
    pitchVel = dy * LOOK.pitchSpeed;
    onChange();
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      dragging = false;
      canvas.classList.remove("is-looking");
      const now = performance.now();
      if (pointerTravel < 8 && now - lastTap < 320) {
        beginReset();
        lastTap = 0;
      } else if (pointerTravel < 8) {
        lastTap = now;
      } else {
        lastTap = 0;
        kick();
      }
    } else if (pointers.size === 1) {
      dragging = true;
      const [only] = pointers.values();
      only.x = event.clientX;
      only.y = event.clientY;
    }
  }

  function beginReset() {
    resetting = true;
    resetFrom = performance.now();
    resetYaw = yaw;
    resetPitch = pitch;
    resetFov = fov;
    yawVel = 0;
    pitchVel = 0;
    kick();
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    moved = true;
    resetting = false;
    const delta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 60);
    fov = clampFov(fov + delta * LOOK.wheel);
    onChange();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) return;
    const key = event.key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown") return;
    event.preventDefault();
    if (key === "ArrowLeft") held.left = true;
    if (key === "ArrowRight") held.right = true;
    if (key === "ArrowUp") held.up = true;
    if (key === "ArrowDown") held.down = true;
    moved = true;
    resetting = false;
    yawVel = 0;
    pitchVel = 0;
    kick();
  }

  function onKeyUp(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") held.left = false;
    if (event.key === "ArrowRight") held.right = false;
    if (event.key === "ArrowUp") held.up = false;
    if (event.key === "ArrowDown") held.down = false;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    hasMoved: () => moved,
    syncFromCamera,
    apply,
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      canvas.classList.remove("is-looking");
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
