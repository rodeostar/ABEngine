import { h } from "preact";

interface ItemCardProps {
  name?: string;
  power?: number;
  toughness?: number;
  flavor?: string;
  selected?: boolean;
  empty?: boolean;
  onClick?: () => void;
  borderColor?: string;
  bgColor?: string;
}

export const ItemCard = ({
  name,
  power = 0,
  toughness = 0,
  flavor,
  selected = false,
  empty = false,
  onClick,
}: ItemCardProps) => {
  const size = 128;

  if (empty) {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          width: `${size}px`,
          height: `${size}px`,
          background: "rgba(94, 240, 196, .04)",
          borderLeft: "2px dashed rgba(94, 240, 196, .2)",
          borderRight: "2px dashed rgba(94, 240, 196, .2)",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          transition: "all .2s ease",
        }}
        onClick={onClick}
      />
    );
  }

  const borderSide = selected
    ? "3px solid rgba(94, 240, 196, .5)"
    : "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))";

  const parts = [];
  if (power > 0) parts.push(`+${power}`);
  if (toughness > 0) parts.push(`+${toughness}`);
  const statText = parts.join("/");

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        width: `${size}px`,
        height: `${size}px`,
        background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
        borderLeft: borderSide,
        borderRight: borderSide,
        borderTop: "none",
        borderBottom: "none",
        borderRadius: "var(--radius-sm, 2px)",
        overflow: "hidden",
        transition: "all .2s ease",
      }}
      onClick={onClick}
      title={flavor || ""}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "700",
          color: "rgba(94, 240, 196, 0.15)",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        {name ? name.charAt(0).toUpperCase() : ""}
      </div>
      {name && (
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "6px",
            fontSize: "9px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.75)",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
            letterSpacing: "0.04em",
            maxWidth: "90px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.04em",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
        }}
      >
        {statText}
      </div>
    </div>
  );
};
