import { frameGameCamera } from "@/game/camera/frame-camera";
import { createLookControls } from "@/game/camera/look-controls";
import { CAMERA } from "@/game/config/camera";
import { LIGHTS } from "@/game/config/presentation";
import { useDebugEnabled } from "@/game/ui/debug";
import { DebugOverlay } from "@/game/ui/DebugOverlay";
import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { createGameScene } from "./GameScene";
import { logSceneStandardOnce } from "./log-standard";

/**
 * Full-viewport WebGL view.
 * The drawing buffer tracks the canvas CSS size, so the round table
 * is not stretched when the window changes.
 */
export function GameViewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debug = useDebugEnabled();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = LIGHTS.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    let draw = () => {};
    const scene = createGameScene(debug, () => draw());
    const camera = new PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    const look = createLookControls(canvas, () => draw());

    draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (!look.hasMoved()) {
        frameGameCamera(camera, camera.aspect);
        look.setBasis(camera);
      }
      look.apply(camera);
      renderer.render(scene, camera);
    };

    draw();
    logSceneStandardOnce();

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      look.dispose();
      scene.traverse((object) => {
        const mesh = object as Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
      renderer.dispose();
    };
  }, [debug]);

  return (
    <>
      <canvas ref={canvasRef} className="game-canvas" />
      <DebugOverlay />
    </>
  );
}
