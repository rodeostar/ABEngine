import { h } from "preact";
import { App } from "@/ui/app.tsx";
import { buildThemeFromData } from "@/ui/theme-provider.tsx";
import * as views from "@/ui/views/index.ts";

declare global {
  interface Window {
    __GAME_THEME__?: Record<string, unknown>;
  }
}

interface DevModeProps {
  ws: WebSocket;
}

const theme = buildThemeFromData(
  typeof window !== "undefined" ? window.__GAME_THEME__ ?? null : null
);

export const DevelopmentMode = ({ ws }: DevModeProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      paddingTop: "32px",
    }}
  >
    <App sessionId={"player1"} ws={ws} debug views={views} theme={theme} />
  </div>
);
