import SetOne from "@/app/set/one.ts";
import { GameInstance, BattleResults } from "@/app/engine.ts";
import { PlayerEngine } from "@/app/player/player.private.ts";
import { WebSocketClient, WebSocketServer } from "ws";
import { GameEvents } from "@/app/events.ts";

const game = new GameInstance({ set: SetOne });
const wss = new WebSocketServer(8080);

const encode = <T>(action: keyof GameEvents, message?: T): string => {
  return JSON.stringify({
    action,
    ...(message || {}),
  });
};

const decode = (message: string) => {
  const { action, userId, ...params }: Record<string, string> =
    JSON.parse(message);

  return {
    action,
    userId,
    params,
    reqs() {
      return typeof userId !== "undefined" && typeof action !== "undefined";
    },
  };
};

const pipeAction = (
  user: PlayerEngine,
  action: string,
  params: Record<string, string>,
  ws: WebSocketClient
) => {
  const sendResult = (results: BattleResults) => {
    if (results.inQueue) {
      console.log(`${user.userId} entered queue.`);
      ws.send(encode("UserInQueue"));
    } else {
      console.log(`${user.userId} is battling.`);
      ws.send(encode("UserBattle", results));
    }
  };

  switch (action) {
    case "UserRoll":
      user.roll();
      break;
    case "UserPurchase":
      if (params.shopIndex != null && params.boardIndex != null)
        user.buy(parseInt(params.boardIndex), parseInt(params.shopIndex));
      break;
    case "UserEndTurn":
      game.joinLobby(user, (results: BattleResults) => {
        sendResult(results);
      });
      break;
    case "UserMove":
      if (params.sourceIndex != null && params.targetIndex != null) {
        user.move(parseInt(params.sourceIndex), parseInt(params.targetIndex));
      }
  }
};

wss.on("connection", (ws: WebSocketClient) => {
  ws.on("error", (error) => {
    console.log(error);
  });
  ws.on("message", (message: string) => {
    const decoded = decode(message);

    if (decoded.reqs()) {
      const { action, userId, params } = decoded;
      const user = game.getUser(userId);
      if (user) pipeAction(user, action, params, ws);
      else game.connect(userId);

      ws.send(game.encodeForClient(userId));
    }
  });
});
