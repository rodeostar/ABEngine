import { h, ComponentChildren, createContext } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { Player, PlayerShape } from "@/app/player/player.ts";
import { Character } from "@/app/character/character.ts";
import { Item } from "@/app/item/item.ts";
import { CombatStep } from "@/app/engine.ts";
import { GameEvents } from "@/app/events.ts";

export interface GameProviderProps {
  children: ComponentChildren;
  sessionId: string;
  ws: WebSocket;
}

export enum PlayerPhases {
  WELCOME = "WELCOME",
  SHOP = "SHOP",
  IN_QUEUE = "IN_QUEUE",
  BATTLE = "BATTLE",
  GAME_OVER = "GAME_OVER",
  VICTORY = "VICTORY",
}

const initialState: Partial<GameContextState> = {
  player: {
    ...new Player(),
    shop: [],
    shopItems: [],
  },
  phase: PlayerPhases.WELCOME,
  battle: undefined,
  battleLog: [],
  battleResult: undefined,
  aiBoard: [],
  coords: {
    clicked: null,
    hover: null,
    shopIndex: null,
    boardIndex: null,
    itemShopIndex: null,
  },
};

export interface GameContextState extends GameProviderProps {
  phase: PlayerPhases;
  battle: (Character | null)[] | undefined;
  battleLog: CombatStep[];
  battleResult: string | undefined;
  aiBoard: (Character | null)[];
  player: PlayerShape;
  coords: {
    clicked: number | null;
    hover: number | null;
    shopIndex: number | null;
    boardIndex: number | null;
    itemShopIndex: number | null;
  };
  request(action: keyof GameEvents, params?: Record<string, string>): void;
  setCoords(type: "shopIndex" | "boardIndex" | "itemShopIndex", index: number): void;
  startGame(): void;
  returnToShop(): void;
}

const GameContext = createContext<Partial<GameContextState>>(initialState);

export const useGame = () => {
  const context: GameContextState = useContext(GameContext) as GameContextState;
  if (context === undefined) {
    throw new Error("useGame can only be used inside GameProvider");
  }
  return context;
};

export const GameProvider = ({
  children,
  sessionId,
  ws,
}: GameProviderProps) => {
  const [state, dispatch] = useState(initialState);

  useEffect(() => {
    ws.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);

      if (response?.action === "UserBattle") {
        const log = response.log || [];
        if (log.length > 0) {
          console.group("[Battle] Result: " + response.result);
          console.log("Full combat log (for debugging):", log);
          log.forEach((step: { type: string; source?: string; target?: string; damage?: number; text?: string; snapshot?: unknown }, i: number) => {
            const msg = step.type === "attack"
              ? `[${i + 1}] ${step.source} → ${step.target} (${step.damage} dmg)`
              : step.type === "ability"
              ? `[${i + 1}] ${step.source}: ${step.text}`
              : step.type === "faint"
              ? `[${i + 1}] ${step.source} falls`
              : `[${i + 1}] ${step.type}` + (step.text ? ": " + step.text : "");
            console.log(msg, step.snapshot);
          });
          console.groupEnd();
        }
        dispatch((prev) => ({
          ...prev,
          battleLog: log,
          battleResult: response.result,
          aiBoard: response.aiBoard || [],
          phase: PlayerPhases.BATTLE,
        }));
      } else if (response?.action === "UserGameOver") {
        setTimeout(() => {
          dispatch((prev) => ({
            ...prev,
            phase: PlayerPhases.GAME_OVER,
          }));
        }, 4000);
      } else if (response?.action === "UserVictory") {
        setTimeout(() => {
          dispatch((prev) => ({
            ...prev,
            phase: PlayerPhases.VICTORY,
          }));
        }, 4000);
      } else if (response?.userId === sessionId) {
        dispatch((prev) => ({
          ...prev,
          player: response,
        }));
      }
    });
  }, []);

  function startGame() {
    request("UserConnect");
    dispatch((prev) => ({
      ...prev,
      phase: PlayerPhases.SHOP,
    }));
  }

  function returnToShop() {
    dispatch((prev) => ({
      ...prev,
      phase: PlayerPhases.SHOP,
      battleLog: [],
      battleResult: undefined,
      aiBoard: [],
    }));
  }

  function setCoords(
    type: "shopIndex" | "boardIndex" | "itemShopIndex",
    index: number
  ) {
    const hasShopIndex = state.coords.shopIndex != null;
    const hasBoardIndex = state.coords.boardIndex != null;
    const hasItemIndex = state.coords.itemShopIndex != null;
    const hasAnIndexSet = hasShopIndex || hasBoardIndex || hasItemIndex;

    // Item purchase: select item then click board slot
    if (type === "boardIndex" && hasItemIndex) {
      request("UserBuyItem", {
        boardIndex: index.toString(),
        itemShopIndex: state.coords.itemShopIndex!.toString(),
      });
      dispatch((prev) => ({
        ...prev,
        coords: { ...prev.coords, boardIndex: null, shopIndex: null, itemShopIndex: null },
      }));
      return;
    }

    // Character purchase: select shop then click board slot
    const attemptedPurchase = type === "boardIndex" && hasShopIndex;
    const isMoving = hasBoardIndex && type === "boardIndex";

    if (
      (type === "boardIndex" &&
        state.player.board[index] == null &&
        !hasAnIndexSet) ||
      (type === "shopIndex" && state.player.shop[index] == null) ||
      (type === "itemShopIndex" && state.player.shopItems[index] == null)
    ) {
      return;
    }

    dispatch((prev) => ({
      ...prev,
      coords: {
        ...prev.coords,
        ...(hasAnIndexSet
          ? { boardIndex: null, shopIndex: null, itemShopIndex: null }
          : { [type]: index }),
      },
    }));

    if (attemptedPurchase) {
      request("UserPurchase", {
        boardIndex: index.toString(),
        shopIndex: state.coords.shopIndex!.toString(),
      });
    }

    if (isMoving) {
      request("UserMove", {
        sourceIndex: state.coords.boardIndex!.toString(),
        targetIndex: index.toString(),
      });
    }
  }

  function request(action: keyof GameEvents, params?: Record<string, string>) {
    if (ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          action,
          userId: sessionId,
          ...(params || {}),
        })
      );
    }
  }

  return (
    <GameContext.Provider
      value={{
        ws,
        sessionId,
        request,
        setCoords,
        startGame,
        returnToShop,
        ...state,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
