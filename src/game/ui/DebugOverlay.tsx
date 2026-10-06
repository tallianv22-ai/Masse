import { getCameraPose, subscribeCameraPose } from "@/game/camera/camera-pose";
import { TABLE, TABLE_LAYOUT } from "@/game/config/table";
import { WORLD } from "@/game/config/world";
import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { toggleDebugEnabled, useDebugEnabled } from "./debug";

function fmt(value: number) {
  return value.toFixed(3);
}

/**
 * Numeric check of origin, table size, and the resolved camera.
 * Toggle with backtick, or force it with `?debug=1`.
 */
export function DebugOverlay() {
  const enabled = useDebugEnabled();
  const pose = useSyncExternalStore(subscribeCameraPose, getCameraPose, getCameraPose);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code !== "Backquote") return;
      event.preventDefault();
      toggleDebugEnabled();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!enabled) return null;

  const center = TABLE_LAYOUT.center;
  const text = [
    "phase 1 debug",
    `origin         ${fmt(WORLD.origin.x)}  ${fmt(WORLD.origin.y)}  ${fmt(WORLD.origin.z)}`,
    `table center   ${fmt(center.x)}  ${fmt(center.y)}  ${fmt(center.z)}`,
    `surface Y      ${fmt(TABLE.playingSurfaceY)}`,
    `radius         ${fmt(TABLE.playingRadius)}`,
    `diameter       ${fmt(TABLE_LAYOUT.playingDiameter)}`,
    `outer radius   ${fmt(TABLE_LAYOUT.outerRadius)}`,
    `camera pos     ${fmt(pose.position[0])}  ${fmt(pose.position[1])}  ${fmt(pose.position[2])}`,
    `camera target  ${fmt(pose.target[0])}  ${fmt(pose.target[1])}  ${fmt(pose.target[2])}`,
    `camera fov     ${fmt(pose.fov)}`,
    "` hides",
  ].join("\n");

  return (
    <pre className="debug-readout" aria-hidden="true">
      {text}
    </pre>
  );
}
