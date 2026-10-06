import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { GameViewport } from "@/game/scene/GameViewport";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // Keep the scene in the entry module graph. The router lazy-loads route
  // components, and a cold load would otherwise fetch three.js after first paint.
  if (typeof GameViewport !== "function") {
    throw new Error("Game scene failed to load");
  }
  return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent });
}