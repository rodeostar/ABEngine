import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useGame } from "@/ui/provider.tsx";
import { useTheme } from "@/ui/theme-provider.tsx";
import { CharacterCard } from "@/ui/components/character-card.tsx";
import { Character } from "@/app/character/character.ts";

type UnitSlot = Character | null;

const renderSlots = (
  source: UnitSlot[],
  facing: "NE" | "SW",
  unitAbilities?: Record<string, string>,
  damagePopups?: (number | undefined)[],
  pulseStates?: boolean[]
) => {
  const cards = source.map((unit, i) => {
    if (!unit || !unit.name) {
      return <CharacterCard key={`e-${i}`} empty />;
    }
    return (
      <CharacterCard
        key={unit.id || i}
        name={unit.name}
        power={unit.power}
        toughness={unit.toughness}
        level={unit.level}
        tier={unit.tier}
        sprite={unit.sprite}
        facing={facing}
        abilityText={unitAbilities?.[unit.name]}
        flavor={unit.flavor}
        damagePopup={damagePopups?.[i]}
        pulse={pulseStates?.[i] ?? false}
      />
    );
  });
  while (cards.length < 5) {
    cards.push(<CharacterCard key={`pad-${cards.length}`} empty />);
  }
  return cards;
};

const padBoard = (arr: UnitSlot[], len = 5): UnitSlot[] => {
  const out = arr.slice(0, len);
  while (out.length < len) out.push(null);
  return out;
};

export const BattlePhase = () => {
  const { battleLog, battleResult, aiBoard, player, returnToShop } = useGame();
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showDebugLog, setShowDebugLog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);

  const log = battleLog || [];
  const currentStep = log[stepIndex];
  const canStep = stepIndex < log.length && log.length > 0;

  const eventLine = (() => {
    if (!currentStep) return "";
    const s = currentStep;
    if (s.type === "attack" && s.source && s.target != null && s.damage != null)
      return `${s.source} hits ${s.target} for ${s.damage}` +
        (s.returnDamage ? ` \u2014 ${s.target} hits back for ${s.returnDamage}` : "");
    if (s.type === "ability" && s.text) return `${s.source}: ${s.text}`;
    if (s.type === "faint" && s.source) return `${s.source} falls`;
    if (s.type === "summon" && s.text) return s.text;
    return s.text || "";
  })();

  useEffect(() => {
    if (stepIndex < log.length) {
      if (isPaused) return;
      const step = log[stepIndex];
      const base =
        step?.type === "ability" ? 2400 : step?.type === "faint" ? 1800 : step?.type === "attack" ? 2000 : 1800;
      const delay = Math.max(150, Math.floor(base / speedMult));
      const timer = setTimeout(() => setStepIndex((p) => p + 1), delay);
      return () => clearTimeout(timer);
    } else if (log.length > 0) {
      const timer = setTimeout(() => setShowResult(true), 1400);
      return () => clearTimeout(timer);
    } else {
      setShowResult(true);
    }
  }, [stepIndex, log.length, isPaused, speedMult]);

  useEffect(() => {
    if (showResult && !showDebugLog) {
      const timer = setTimeout(() => returnToShop(), 4500);
      return () => clearTimeout(timer);
    }
  }, [showResult, showDebugLog]);

  const p1Snap = currentStep?.snapshot?.p1 || [];
  const p2Snap = currentStep?.snapshot?.p2 || [];

  const p1Source: UnitSlot[] = padBoard(
    p1Snap.length > 0 ? p1Snap : (player?.board || []).slice(0, 5)
  );
  const p2Source: UnitSlot[] = padBoard(
    p2Snap.length > 0 ? [...p2Snap].reverse() : ([...(aiBoard || [])].slice(0, 5)).reverse()
  );

  const mkDamagePopups = (source: UnitSlot[]) =>
    currentStep?.type === "attack" && currentStep.damage != null
      ? source.map((u) => {
          if (!u?.name) return undefined;
          if (u.name === currentStep!.target) return -currentStep!.damage!;
          if (u.name === currentStep!.source && currentStep!.returnDamage) return -currentStep!.returnDamage!;
          return undefined;
        })
      : [];

  const mkPulseStates = (source: UnitSlot[]) =>
    source.map((u) => {
      if (!u?.name || !currentStep?.source) return false;
      return u.name === currentStep.source || (currentStep.target != null && u.name === currentStep.target);
    });

  const p1Popups = mkDamagePopups(p1Source);
  const p2Popups = mkDamagePopups(p2Source);
  const p1Pulse = mkPulseStates(p1Source);
  const p2Pulse = mkPulseStates(p2Source);

  const resultColor =
    battleResult === "WIN" ? "#88cca0"
    : battleResult === "LOSS" ? "#f87171"
    : "rgba(255,255,255,0.7)";

  const resultText =
    battleResult === "WIN" ? "VICTORY"
    : battleResult === "LOSS" ? "DEFEATED"
    : "DRAW";

  const resultFlavor =
    battleResult === "WIN" ? (theme.flavor.battleWinFlavor ?? "Enemy eliminated.")
    : battleResult === "LOSS" ? (theme.flavor.battleLossFlavor ?? "Squad down.")
    : (theme.flavor.battleDrawFlavor ?? "Stalemate.");

  const glassBtn = (enabled: boolean, active: boolean) => ({
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: "600" as const,
    color: enabled ? "rgba(255,255,255,0.85)" : "rgba(140,160,165,0.4)",
    background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
    borderLeft: active ? "3px solid rgba(94, 240, 196, .5)" : "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
    borderRight: active ? "3px solid rgba(94, 240, 196, .5)" : "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
    borderTop: "none" as const,
    borderBottom: "none" as const,
    borderRadius: "var(--radius-sm, 2px)",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.5,
    transition: "all .2s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "20px 24px",
        position: "relative",
        fontFamily: theme.fontFamily,
        color: "rgba(255,255,255,0.95)",
      }}
    >
      {/* Header: title + controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#88cca0",
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          &#x2694; {theme.flavor.combatTitle ?? "Combat"} &#x2694;
        </div>
        {log.length > 0 && !showResult && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button type="button" onClick={() => setStepIndex((p) => Math.min(p + 1, log.length))} disabled={!canStep} style={glassBtn(canStep, false)}>Step</button>
            <button type="button" onClick={() => setIsPaused((p) => !p)} style={glassBtn(true, isPaused)}>{isPaused ? "Play" : "Pause"}</button>
            <button type="button" onClick={() => setSpeedMult((m) => (m === 1 ? 2 : 1))} style={glassBtn(true, speedMult === 2)}>{speedMult === 2 ? "1×" : "2×"}</button>
          </div>
        )}
      </div>

      {/* Battlefield */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {/* Team labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
            width: "100%",
            maxWidth: "1380px",
          }}
        >
          <span style={{ flex: "1 1 0", textAlign: "center", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(140,160,165,0.60)", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
            {theme.flavor.yourForcesLabel ?? "You"}
          </span>
          <span style={{ flex: "0 0 24px", textAlign: "center", fontSize: "14px", color: "rgba(94, 240, 196, 0.4)" }}>⚔</span>
          <span style={{ flex: "1 1 0", textAlign: "center", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(140,160,165,0.60)", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
            {theme.flavor.enemyLabel ?? "Enemy"}
          </span>
        </div>

        {/* Cards row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            width: "100%",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {renderSlots(p1Source, "NE", theme.unitAbilities, p1Popups, p1Pulse)}

          <div style={{ width: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", color: "rgba(94, 240, 196, 0.3)" }}>⚔</span>
          </div>

          {renderSlots(p2Source, "SW", theme.unitAbilities, p2Popups, p2Pulse)}
        </div>

        {/* Event text */}
        {eventLine && (
          <div
            style={{
              marginTop: "16px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#88cca0",
              textAlign: "center",
              letterSpacing: "0.04em",
              minHeight: "20px",
              textShadow: "0 1px 6px rgba(0,0,0,0.8)",
            }}
          >
            {eventLine}
          </div>
        )}
      </div>

      {/* Result overlay */}
      {showResult && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.85)",
            padding: "20px",
            overflow: "auto",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: "bold", letterSpacing: "0.2em", marginBottom: "8px", color: resultColor }}>
            {resultText}
          </div>
          <div style={{ fontSize: "13px", fontStyle: "italic", color: "rgba(140,160,165,0.70)", marginBottom: "16px" }}>
            {resultFlavor}
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => returnToShop()}
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.85)",
                background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
                borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderTop: "none",
                borderBottom: "none",
                borderRadius: "var(--radius-sm, 2px)",
                cursor: "pointer",
                transition: "all .2s ease",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: "600",
              }}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setShowDebugLog((v) => !v)}
              style={{
                padding: "6px 14px",
                fontSize: "11px",
                color: "rgba(140,160,165,0.70)",
                background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
                borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderTop: "none",
                borderBottom: "none",
                borderRadius: "var(--radius-sm, 2px)",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              {showDebugLog ? "Hide" : "Show"} log
            </button>
          </div>
          {showDebugLog && log.length > 0 && (
            <div
              style={{
                width: "100%",
                maxWidth: "700px",
                maxHeight: "220px",
                overflow: "auto",
                textAlign: "left",
                fontSize: "11px",
                fontFamily: theme.fontFamily,
                color: "rgba(140,160,165,0.70)",
                background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
                borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                borderTop: "none",
                borderBottom: "none",
                borderRadius: "var(--radius-sm, 2px)",
                padding: "12px",
                lineHeight: "1.5",
              }}
            >
              {log.map((step, i) => (
                <div key={i} style={{ marginBottom: "6px" }}>
                  <span style={{ color: "#88cca0" }}>[{i + 1}]</span>{" "}
                  {step.type === "attack" && step.damage != null && `${step.source} → ${step.target} (${step.damage})`}
                  {step.type === "ability" && step.text && `${step.source}: ${step.text}`}
                  {step.type === "faint" && `${step.source} falls`}
                  {step.type === "summon" && step.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
