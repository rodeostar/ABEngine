import { h } from "preact";
import { useTheme } from "@/ui/theme-provider.tsx";

interface CharacterCardProps {
  name?: string;
  power?: number;
  toughness?: number;
  level?: number;
  tier?: number;
  flavor?: string;
  sprite?: string;
  facing?: "NE" | "SW";
  abilityText?: string;
  damagePopup?: number;
  pulse?: boolean;
  selected?: boolean;
  empty?: boolean;
  onClick?: () => void;
  borderColor?: string;
  bgColor?: string;
  small?: boolean;
}

export const CharacterCard = ({
  name,
  power,
  toughness,
  level,
  tier = 1,
  flavor,
  sprite,
  facing = "NE",
  abilityText,
  damagePopup,
  pulse = false,
  selected = false,
  empty = false,
  onClick,
}: CharacterCardProps) => {
  const theme = useTheme();
  const size = 128;
  const pipSize = "22px";
  const pipFontSize = "11px";
  const spriteBase = sprite ? `/games/${theme.gameName}/sprites/${sprite}` : "";
  const spriteCandidates = sprite
    ? [`${spriteBase}-${facing}.png`, `${spriteBase}.png`]
    : [];

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
          flexShrink: 0,
          background: "rgba(94, 240, 196, .04)",
          borderLeft: "2px dashed rgba(94, 240, 196, .2)",
          borderRight: "2px dashed rgba(94, 240, 196, .2)",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          transition: "all .2s ease",
        }}
        onClick={onClick}
        title="Place unit here"
      />
    );
  }

  const borderSide = selected
    ? "3px solid rgba(94, 240, 196, .5)"
    : "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))";

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
        flexShrink: 0,
        background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
        borderLeft: borderSide,
        borderRight: borderSide,
        borderTop: "none",
        borderBottom: "none",
        borderRadius: "var(--radius-sm, 2px)",
        overflow: "hidden",
        transition: "all .2s ease",
        animation: pulse ? "glowPulse 3.2s ease-in-out infinite" : "none",
      }}
      onClick={onClick}
      aria-label={abilityText || flavor || name}
      title={name ? `${name}${abilityText ? "\n" + abilityText : ""}` : ""}
    >
      {spriteCandidates.length > 0 ? (
        <img
          src={spriteCandidates[0]}
          alt={name || "character sprite"}
          width={size}
          height={size}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: "cover",
            imageRendering: "pixelated",
            display: "block",
          }}
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            const fallback = spriteCandidates[1];
            if (fallback && img.src !== new URL(fallback, location.origin).href) {
              img.src = fallback;
            } else {
              img.style.display = "none";
              const parent = img.parentElement;
              if (parent) {
                const fb = document.createElement("div");
                fb.textContent = name ? name.charAt(0).toUpperCase() : "?";
                fb.style.cssText = `width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;color:rgba(94,240,196,0.15);letter-spacing:0.08em;user-select:none;`;
                parent.insertBefore(fb, img.nextSibling);
              }
            }
          }}
        />
      ) : (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: "700",
            color: "rgba(94, 240, 196, 0.15)",
            letterSpacing: "0.08em",
            userSelect: "none",
          }}
        >
          {name ? name.charAt(0).toUpperCase() : ""}
        </div>
      )}

      {damagePopup != null && damagePopup !== 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: damagePopup > 0 ? "#88cca0" : "#f87171",
              textShadow: "0 0 10px rgba(0,0,0,0.9)",
            }}
          >
            {damagePopup > 0 ? `+${damagePopup}` : damagePopup}
          </span>
        </div>
      )}

      {level != null && level > 1 && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "6px",
            fontSize: "10px",
            fontWeight: "bold",
            color: "#88cca0",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          Lv{level}
        </div>
      )}

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
          bottom: "6px",
          left: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <div
          style={{
            width: pipSize,
            height: pipSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: pipFontSize,
            fontWeight: "bold",
            backgroundColor: "rgba(184,94,94,0.75)",
            color: "rgba(255,255,255,0.9)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          {power}
        </div>
        <div
          style={{
            width: pipSize,
            height: pipSize,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: pipFontSize,
            fontWeight: "bold",
            backgroundColor: "rgba(94,240,196,0.4)",
            color: "rgba(255,255,255,0.9)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          {toughness}
        </div>
      </div>
    </div>
  );
};
