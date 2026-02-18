import { h } from "preact";

interface StatusBarProps {
  gold: number;
  lives: number;
  wins: number;
  turn: number;
}

export const StatusBar = ({
  gold,
  lives,
  wins,
  turn,
}: StatusBarProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        marginBottom: "12px",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "0.06em",
        background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
        borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
        borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
        borderTop: "none",
        borderBottom: "none",
        borderRadius: "var(--radius-sm, 2px)",
        transition: "all .2s ease",
        color: "rgba(255,255,255,0.95)",
      }}
    >
      <span>&#x2B21; {gold}</span>
      <span>&#x2665; {lives}</span>
      <span style={{ color: "#88cca0" }}>&#x2694; {wins}/10</span>
      <span style={{ color: "rgba(140,160,165,0.70)" }}>TURN {turn}</span>
    </div>
  );
};
