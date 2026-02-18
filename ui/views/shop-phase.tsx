import { h, Fragment } from "preact";
import { useGame } from "@/ui/provider.tsx";
import { useTheme } from "@/ui/theme-provider.tsx";
import { StatusBar } from "@/ui/components/status-bar.tsx";
import { CharacterCard } from "@/ui/components/character-card.tsx";
import { ItemCard } from "@/ui/components/item-card.tsx";
import { Character } from "@/app/character/character.ts";

export const ShopPhase = () => {
  const { player, request, setCoords, coords } = useGame();
  const theme = useTheme();
  const board = (player?.board ?? []) as (Character | null)[];
  const shop = (player?.shop ?? []) as (Character | null)[];

  const hasShopSelection = coords.shopIndex != null && shop[coords.shopIndex];
  const hasBoardSelection = coords.boardIndex != null && board[coords.boardIndex];
  const selectedShopChar = hasShopSelection ? shop[coords.shopIndex!] : null;
  const selectedBoardChar = hasBoardSelection ? board[coords.boardIndex!] : null;

  const isBoardSlotValidTarget = (index: number) => {
    if (hasShopSelection) return true;
    if (hasBoardSelection && coords.boardIndex !== index) return true;
    return false;
  };
  const isBoardSlotMerge = (index: number) => {
    const occupant = board[index];
    if (hasShopSelection && occupant?.name === selectedShopChar?.name) return true;
    if (hasBoardSelection && index !== coords.boardIndex && occupant?.name === selectedBoardChar?.name) return true;
    return false;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "18px 24px",
        color: "rgba(255,255,255,0.95)",
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
        }}
      >
      <StatusBar
        gold={player.bank}
        lives={player.life}
        wins={player.wins}
        turn={player.turn}
      />
      </div>

      <div
        style={{
          maxWidth: "860px",
          width: "100%",
          margin: "0 auto",
          padding: "14px",
          background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
          borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
          borderTop: "none",
          borderBottom: "none",
          borderRadius: "var(--radius-sm, 2px)",
          transition: "all .2s ease",
        }}
      >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(140,160,165,0.70)",
          marginBottom: "8px",
        }}
      >
        {theme.flavor.boardLabel ?? "Your Board"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 128px)",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {(player?.board || []).map((character, index) => {
          const validTarget = isBoardSlotValidTarget(index);
          const mergeHere = isBoardSlotMerge(index);
          return (
            <div key={index} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {(validTarget || mergeHere) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "4px",
                    gap: "2px",
                  }}
                >
                  {mergeHere && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        color: "#88cca0",
                        background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
                        borderLeft: "2px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                        borderRight: "2px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
                        borderTop: "none",
                        borderBottom: "none",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm, 2px)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Lv+1
                    </span>
                  )}
                  {validTarget && (
                    <span style={{ color: "rgba(94, 240, 196, 0.5)", fontSize: "18px", lineHeight: 1 }}>▼</span>
                  )}
                </div>
              )}
              <CharacterCard
                name={character?.name}
                power={character?.power}
                toughness={character?.toughness}
                level={character?.level}
                tier={character?.tier}
                flavor={character?.flavor}
                sprite={character?.sprite}
                facing="NE"
                abilityText={character?.name ? theme.unitAbilities?.[character.name] : undefined}
                empty={!character}
                selected={coords.boardIndex === index}
                onClick={() => setCoords("boardIndex", index)}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "rgba(140,160,165,0.70)",
          }}
        >
          {theme.flavor.shopLabel ?? "Shop"}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "500",
            color: "rgba(140,160,165,0.50)",
          }}
        >
          {theme.flavor.shopPrice ?? "3 gold each"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 128px)",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {(player?.shop || []).map((character, index) => (
          <CharacterCard
            key={`shop-${index}`}
            name={character?.name}
            power={character?.power}
            toughness={character?.toughness}
            level={character?.level}
            tier={character?.tier}
            flavor={character?.flavor}
            sprite={character?.sprite}
            facing="NE"
            abilityText={character?.name ? theme.unitAbilities?.[character.name] : undefined}
            empty={!character}
            selected={coords.shopIndex === index}
            onClick={() => setCoords("shopIndex", index)}
          />
        ))}
        {(player?.shopItems || []).map((item, index) => (
          <ItemCard
            key={`item-${index}`}
            name={item?.name}
            power={item?.power}
            toughness={item?.toughness}
            flavor={item?.flavor}
            empty={!item}
            selected={coords.itemShopIndex === index}
            onClick={() => setCoords("itemShopIndex", index)}
          />
        ))}
      </div>
      {(player.bank === 1 || player.bank === 0) && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(140,160,165,0.70)",
            marginTop: "12px",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            textShadow: "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          {player.bank === 1 && <span>One {theme.flavor.rollCurrency ?? "⬡"} left — roll for new units.</span>}
          {player.bank === 0 && (
            <Fragment>
              <span>Ready for battle?</span>
              <span style={{ color: "rgba(94, 240, 196, 0.5)" }}>▼</span>
            </Fragment>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        <button
          style={{
            padding: "10px 0",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "13px",
            cursor: player.bank > 0 ? "pointer" : "default",
            background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
            borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: "var(--radius-sm, 2px)",
            color: player.bank > 0 ? "rgba(255,255,255,0.95)" : "rgba(140,160,165,0.4)",
            opacity: player.bank > 0 ? 1 : 0.5,
            transition: "all .2s ease",
          }}
          onClick={() => request("UserRoll")}
          disabled={player.bank <= 0}
        >
          {theme.flavor.rollButton ?? "Cast"} (1 {theme.flavor.rollCurrency ?? "⬡"})
        </button>
        <button
          style={{
            padding: "10px 0",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "13px",
            cursor: "pointer",
            background: "var(--holo-panel-bg, rgba(94, 240, 196, .03))",
            borderLeft: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderRight: "3px solid var(--holo-panel-outline, rgba(94, 240, 196, .3))",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: "var(--radius-sm, 2px)",
            color: "rgba(255,255,255,0.95)",
            transition: "all .2s ease",
          }}
          onClick={() => request("UserEndTurn")}
        >
          {theme.flavor.endTurnButton ?? "End Turn"} &#x2694;
        </button>
      </div>
      </div>
    </div>
  );
};
