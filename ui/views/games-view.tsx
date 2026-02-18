import { h } from "preact";
import { useState } from "preact/hooks";
import { useTheme } from "@/ui/theme-provider.tsx";

declare global {
  interface Window {
    __TW_BRIDGE__?: {
      linkedUser: string | null;
      linkUrl: string;
      riftPackUnlocked: boolean;
    };
  }
}

type GamesViewProps = {
  onNewGame: () => void;
  onReturn: () => void;
  hasExistingSession: boolean;
  connectionFailed?: boolean;
};

export const GamesView = ({
  onNewGame,
  onReturn,
  hasExistingSession,
  connectionFailed = false,
}: GamesViewProps) => {
  const theme = useTheme();
  const bridge = typeof window !== "undefined" ? window.__TW_BRIDGE__ : null;
  const [linkHover, setLinkHover] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "rgba(255,255,255,0.95)",
        padding: "24px",
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
          borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          padding: "24px 20px",
          textAlign: "center",
          transition: "all .2s ease",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: "700",
            letterSpacing: "0.14em",
            marginBottom: "8px",
            color: "#88cca0",
            textShadow: "0 0 10px rgba(94,240,196,0.3)",
          }}
        >
          {theme.title}
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            marginBottom: "24px",
            color: "rgba(140,160,165,0.70)",
            letterSpacing: "0.03em",
          }}
        >
          {theme.tagline}
        </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: "220px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          style={{
            padding: "12px 16px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.875rem",
            background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
            borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: "var(--radius-sm, 2px)",
            color: "rgba(255,255,255,0.95)",
            cursor: "pointer",
            transition: "all .2s ease",
          }}
          onClick={onNewGame}
        >
          New Game
        </button>
        <button
          type="button"
          style={{
            padding: "12px 16px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.875rem",
            background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
            borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: "var(--radius-sm, 2px)",
            color: hasExistingSession ? "rgba(255,255,255,0.95)" : "rgba(140,160,165,0.4)",
            cursor: hasExistingSession ? "pointer" : "default",
            opacity: hasExistingSession ? 1 : 0.5,
            transition: "all .2s ease",
          }}
          onClick={onReturn}
          disabled={!hasExistingSession}
          title={hasExistingSession ? "Reconnect to your current game" : "No game in progress"}
        >
          Return to game
        </button>
      </div>
      {bridge && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: bridge.riftPackUnlocked
              ? "rgba(74, 222, 128, 0.05)"
              : "rgba(94, 240, 196, 0.02)",
            borderLeft: `2px solid ${bridge.riftPackUnlocked ? "rgba(74, 222, 128, 0.4)" : "rgba(94, 240, 196, 0.15)"}`,
            borderRight: `2px solid ${bridge.riftPackUnlocked ? "rgba(74, 222, 128, 0.4)" : "rgba(94, 240, 196, 0.15)"}`,
            borderTop: "none",
            borderBottom: "none",
            borderRadius: "var(--radius-sm, 2px)",
            textAlign: "center",
          }}
        >
          {bridge.riftPackUnlocked ? (
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#4ade80",
                  marginBottom: "4px",
                }}
              >
                Rift Pack Unlocked
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(140,160,165,0.5)",
                }}
              >
                Linked as {bridge.linkedUser}
              </p>
            </div>
          ) : (
            <div>
              <p
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.06em",
                  color: "rgba(140,160,165,0.6)",
                  marginBottom: "10px",
                }}
              >
                8 units + 4 items — free with a TimeWoven account
              </p>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  background: linkHover ? "rgba(94, 240, 196, 0.08)" : "transparent",
                  border: "1px solid rgba(94, 240, 196, 0.3)",
                  borderRadius: "var(--radius-sm, 2px)",
                  color: "#88cca0",
                  cursor: "pointer",
                  transition: "all .2s ease",
                  fontFamily: "inherit",
                }}
                onMouseEnter={() => setLinkHover(true)}
                onMouseLeave={() => setLinkHover(false)}
                onClick={() => {
                  if (bridge.linkUrl) window.open(bridge.linkUrl, "_blank");
                }}
              >
                Unlock Rift Pack
              </button>
            </div>
          )}
        </div>
      )}
      {connectionFailed && (
        <p
          style={{
            fontSize: "12px",
            marginTop: "12px",
            color: "#f87171",
            textAlign: "center",
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          Connection failed. Check that the game server is running.
        </p>
      )}
      {!hasExistingSession && !connectionFailed && (
        <p
          style={{
            fontSize: "11px",
            marginTop: "16px",
            color: "rgba(140,160,165,0.70)",
            textAlign: "center",
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          Start a new game to begin.
        </p>
      )}
      </div>
    </div>
  );
};
