import { h, ComponentChildren, createContext } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { Player, PlayerShape } from "@/app/player/player.ts";
import { Character } from "@/app/character/character.ts";
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
}

const initialState: Partial<GameContextState> = {
  player: {
    ...new Player(),
    shop: [],
  },
  phase: PlayerPhases.SHOP,
  battle: undefined,
  coords: {
    clicked: null,
    hover: null,
    shopIndex: null,
    boardIndex: null,
  },
};

export interface GameContextState extends GameProviderProps {
  phase: PlayerPhases;
  battle: (Character | null)[] | undefined;
  player: PlayerShape;
  coords: {
    clicked: number | null;
    hover: number | null;
    shopIndex: number | null;
    boardIndex: number | null;
  };
  request(action: keyof GameEvents, params?: Record<string, string>): void;
  setCoords(type: "shopIndex" | "boardIndex", index: number): void;
}

const GameContext = createContext<Partial<GameContextState>>(initialState);

export const useGame = () => {
  const context: GameContextState = useContext(GameContext);
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
    ws.send(
      JSON.stringify({
        action: "UserConnected",
        userId: sessionId,
      })
    );

    ws.addEventListener("message", (event) => {
      const response = JSON.parse(event.data);

      if (response?.action === "UserInQueue") {
        dispatch((prev: GameContextState) => ({
          ...prev,
          phase: PlayerPhases.IN_QUEUE,
        }));
      } else if (response?.action === "UserBattle") {
        console.log("battling", response);
        dispatch((prev: GameContextState) => ({
          ...prev,
          battle: response?.battle,
          phase: PlayerPhases.BATTLE,
        }));
      } else if (response?.userId === sessionId) {
        dispatch((prev: GameContextState) => ({
          ...prev,
          player: response,
        }));
      }
    });
  }, []);

  function setCoords(type: "shopIndex" | "boardIndex", index: number) {
    const hasShopIndex = state.coords.shopIndex != null;
    const hasBoardIndex = state.coords.boardIndex != null;
    const attemptedPurchase = type === "boardIndex" && hasShopIndex;
    const hasAnIndexSet = hasShopIndex || hasBoardIndex;
    const isMoving = hasBoardIndex && type === "boardIndex";

    if (
      (type === "boardIndex" &&
        state.player.board[index] == null &&
        !hasAnIndexSet) ||
      (type === "shopIndex" && state.player.shop[index] == null)
    ) {
      return;
    }

    dispatch((prev: GameContextState) => ({
      ...prev,
      coords: {
        ...prev.coords,
        ...(hasAnIndexSet
          ? { boardIndex: null, shopIndex: null }
          : { [type]: index }),
      },
    }));

    if (attemptedPurchase) {
      request("UserPurchase", {
        boardIndex: index.toString(),
        shopIndex: state.coords.shopIndex.toString(),
      });
    }

    if (isMoving) {
      request("UserMove", {
        sourceIndex: state.coords.boardIndex.toString(),
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
        ...state,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
