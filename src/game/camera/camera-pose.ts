export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

let pose: CameraPose = {
  position: [0, 0, 0],
  target: [0, 0, 0],
  fov: 0,
};

const listeners = new Set<() => void>();

export function publishCameraPose(next: CameraPose) {
  pose = next;
  for (const listener of listeners) listener();
}

export function getCameraPose() {
  return pose;
}

export function subscribeCameraPose(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
