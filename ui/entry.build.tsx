import { h } from "preact";
import { setup } from "@/ui/setup.tsx";
import { App } from "@/ui/app.tsx";
import { buildThemeFromData } from "@/ui/theme-provider.tsx";
import * as views from "@/ui/views/index.ts";

declare global {
  interface Window {
    __GAME_THEME__?: Record<string, unknown>;
  }
}

const theme = buildThemeFromData(
  typeof window !== "undefined" ? window.__GAME_THEME__ ?? null : null
);

setup(
  ({ sessionId, ws }) => (
    <App sessionId={sessionId} ws={ws} debug={false} views={views} theme={theme} />
  ),
  theme
);
