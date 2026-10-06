import { createFileRoute } from "@tanstack/react-router";
import { GameViewport } from "@/game/scene/GameViewport";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="game-shell" id="game-root">
      <h1 className="sr-only">Bumper Pool</h1>
      <GameViewport />
    </main>
  );
}
