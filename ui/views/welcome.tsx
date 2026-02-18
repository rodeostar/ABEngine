import { h } from "preact";
import { useGame } from "@/ui/provider.tsx";
import { useTheme } from "@/ui/theme-provider.tsx";

export const Welcome = () => {
  const { startGame } = useGame();
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "rgba(255,255,255,0.95)",
        fontFamily: theme.fontFamily,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
          borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          padding: "28px 24px",
          textAlign: "center",
          transition: "all .2s ease",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: "700",
            letterSpacing: "0.14em",
            marginBottom: "10px",
            color: "#88cca0",
            textShadow: "0 0 10px rgba(94,240,196,0.3)",
          }}
        >
          {theme.title}
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            marginBottom: "26px",
            textAlign: "center",
            color: "rgba(140,160,165,0.70)",
            lineHeight: "1.5",
            letterSpacing: "0.03em",
          }}
        >
          {theme.tagline}
        </p>

        <button
          style={{
            padding: "12px 18px",
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
          onClick={() => startGame()}
        >
          {theme.flavor.startButton ?? "Start Game"}
        </button>

        <p
          style={{
            fontSize: "0.8rem",
            marginTop: "22px",
            textAlign: "center",
            color: "rgba(140,160,165,0.70)",
            lineHeight: "1.6",
            letterSpacing: "0.04em",
          }}
        >
          {theme.flavor.instructions ?? "Buy units from the shop. Arrange your board. End your turn to battle. Survive 10 rounds to win. Each unit costs 3 gold."}
        </p>
      </div>
    </div>
  );
};
