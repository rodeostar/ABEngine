import { h, Fragment, ComponentChild } from "preact";
import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { ThemeProvider, getDefaultTheme } from "@/ui/theme-provider.tsx";
import type { ThemeShape } from "@/app/loader.ts";
import { GamesView } from "@/ui/views/games-view.tsx";

export type RenderCallback = ({
  sessionId,
  ws,
}: {
  sessionId: string;
  ws: WebSocket;
}) => ComponentChild;

const COOKIE_NAME = "sessionId";

const setCookie = (name: string, value: string, days = 7, path = "/") => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires="${expires}"; path="${path}";`;
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1] ?? "") : r;
  }, "");
};

type RootProps = {
  content: RenderCallback;
  theme: ThemeShape;
};

function Root({ content, theme }: RootProps) {
  const [phase, setPhase] = useState<"games" | "connecting" | "ready">("games");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);

  useEffect(() => {
    if (phase !== "connecting" || !ws) return;
    setConnectionFailed(false);
    const onOpen = () => setPhase("ready");
    const fail = () => {
      setConnectionFailed(true);
      setPhase("games");
    };
    ws.addEventListener("open", onOpen);
    ws.addEventListener("error", fail);
    ws.addEventListener("close", fail);
    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        fail();
      }
    }, 8000);
    return () => {
      clearTimeout(timeout);
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("error", fail);
      ws.removeEventListener("close", fail);
    };
  }, [phase, ws]);

  const wsUrl =
    typeof location !== "undefined"
      ? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`
      : "ws://localhost:4042";

  const startNewGame = () => {
    const id = crypto.randomUUID();
    setCookie(COOKIE_NAME, id);
    setSessionId(id);
    setWs(new WebSocket(wsUrl));
    setPhase("connecting");
  };

  const returnToGame = () => {
    const id = getCookie(COOKIE_NAME) || crypto.randomUUID();
    setCookie(COOKIE_NAME, id);
    setSessionId(id);
    setWs(new WebSocket(wsUrl));
    setPhase("connecting");
  };

  const hasExistingSession = !!getCookie(COOKIE_NAME);

  if (phase === "games") {
    return (
      <ThemeProvider theme={theme}>
        <GamesView
          onNewGame={startNewGame}
          onReturn={returnToGame}
          hasExistingSession={hasExistingSession}
          connectionFailed={connectionFailed}
        />
      </ThemeProvider>
    );
  }

  if (phase === "connecting") {
    return (
      <ThemeProvider theme={theme}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "rgba(140,160,165,0.70)",
            fontSize: "14px",
            fontFamily: theme.fontFamily,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
              borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
              borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
              borderTop: "none",
              borderBottom: "none",
              borderRadius: "var(--radius-sm, 2px)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all .2s ease",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
            }}
          >
            Connecting...
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (phase === "ready" && ws && sessionId) {
    return <Fragment>{content({ sessionId, ws })}</Fragment>;
  }

  return null;
}

export function setup(content: RenderCallback, theme: ThemeShape) {
  const main = document.getElementById("root");
  const themeResolved = theme ?? getDefaultTheme();
  if (main) {
    render(<Root content={content} theme={themeResolved} />, main);
  }
}
