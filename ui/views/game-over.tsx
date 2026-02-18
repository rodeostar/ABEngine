import { h } from "preact";
import { useGame, PlayerPhases } from "@/ui/provider.tsx";
import { useTheme } from "@/ui/theme-provider.tsx";

export const GameOver = () => {
  const { phase, player, startGame } = useGame();
  const theme = useTheme();
  const isVictory = phase === PlayerPhases.VICTORY;

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
          maxWidth: "620px",
          background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
          borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          padding: "24px",
          textAlign: "center",
          transition: "all .2s ease",
        }}
      >
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            letterSpacing: "0.12em",
            marginBottom: "8px",
            color: isVictory ? "#88cca0" : "#f87171",
          }}
        >
          {isVictory
            ? (theme.flavor.victoryTitle ?? "VICTORY")
            : (theme.flavor.defeatTitle ?? "DEFEAT")}
        </h1>

        <p
          style={{
            fontSize: "0.9rem",
            marginBottom: "24px",
            color: "rgba(140,160,165,0.70)",
            letterSpacing: "0.03em",
          }}
        >
          {isVictory
            ? (theme.flavor.victoryFlavor ?? "You win!")
            : (theme.flavor.defeatFlavor ?? "Better luck next time.")}
        </p>

      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "24px",
          fontSize: "14px",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "rgba(255,255,255,0.95)" }}>
            {player.turn}
          </div>
          <div style={{ color: "rgba(140,160,165,0.70)", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "11px" }}>Turns</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#88cca0" }}>
            {player.wins}
          </div>
          <div style={{ color: "rgba(140,160,165,0.70)", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "11px" }}>Wins</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "rgba(255,255,255,0.95)" }}>
            {player.life}
          </div>
          <div style={{ color: "rgba(140,160,165,0.70)", letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "11px" }}>Lives</div>
        </div>
      </div>

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
        {theme.flavor.playAgainButton ?? "Play Again"}
      </button>
      </div>
    </div>
  );
};
