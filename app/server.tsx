import { bundler } from "@/app/bundle.ts";
import { loadGame } from "@/app/loader.ts";
import { GameInstance } from "@/app/engine.ts";
import { PlayerEngine } from "@/app/player/player.private.ts";
import { AIPlayer } from "@/app/ai.ts";
import { CombatPrivate } from "@/app/combat/combat.private.ts";
import { GameEvents } from "@/app/events.ts";
import { setup, Configuration } from "tw";
import { getStyleTag, virtualSheet } from "tw/sheets";

type Config = Partial<{
  game: string;
  mode: "dev" | "prod";
  tailwind: Partial<Configuration>;
}>;

const rawConfig = await Deno.readTextFile("./config.json");
const config: Config = JSON.parse(rawConfig);
const sheet = virtualSheet();
const mode = config?.mode ?? "prod";
const gameName = config?.game ?? "example";

setup({
  ...(config?.tailwind || {}),
  sheet,
});

const game = await loadGame(`./games/${gameName}`);
const units = game.characterFactory;
const items = game.itemFactory;
const gameInstance = new GameInstance({ set: units, itemSet: items });

let js = "";

const themeData = {
  gameName,
  title: game.theme.title,
  tagline: game.theme.tagline,
  fontFamily: game.theme.fontFamily,
  colors: game.theme.colors,
  tiers: game.theme.tiers,
  flavor: game.theme.flavor,
  unitAbilities: game.theme.unitAbilities ?? {},
  backgroundImage: game.theme.backgroundImage,
  bg: game.theme.bg,
  cardBg: game.theme.cardBg,
  accent: game.theme.accent,
  accentBlue: game.theme.accentBlue,
  text: game.theme.text,
  textDim: game.theme.textDim,
  danger: game.theme.danger,
  success: game.theme.success,
  gold: game.theme.gold,
};

// ── WS game logic ──

const encode = <T>(action: keyof GameEvents, message?: T): string =>
  JSON.stringify({ action, ...(message || {}) });

const decode = (message: string) => {
  const { action, userId, ...params }: Record<string, string> =
    JSON.parse(message);
  return {
    action,
    userId,
    params,
    reqs: () => typeof userId !== "undefined" && typeof action !== "undefined",
  };
};

const pipeAction = (
  user: PlayerEngine,
  action: string,
  params: Record<string, string>,
  ws: WebSocket,
) => {
  switch (action) {
    case "UserRoll":
      user.roll();
      break;

    case "UserPurchase":
      if (params.shopIndex != null && params.boardIndex != null)
        user.buy(parseInt(params.boardIndex), parseInt(params.shopIndex));
      break;

    case "UserBuyItem":
      if (params.itemShopIndex != null && params.boardIndex != null)
        user.buyItem(parseInt(params.boardIndex), parseInt(params.itemShopIndex));
      break;

    case "UserEndTurn": {
      const ai = new AIPlayer(units, user.turn);
      const battle = new CombatPrivate(
        user,
        { ...ai, userId: ai.userId } as any,
        game.abilities,
      );
      const { result, log } = battle.execute();
      const playerWon = result === user.userId;
      const isDraw = result === "DRAW";

      if (playerWon) user.win();
      else if (isDraw) { user.turn++; user.bank = 10; user.shop.roll(user.turn); }
      else user.lose();

      ws.send(JSON.stringify({
        action: "UserBattle",
        result: playerWon ? "WIN" : isDraw ? "DRAW" : "LOSS",
        log,
        aiBoard: ai.board.map((c) =>
          c ? { name: c.name, power: c.power, toughness: c.toughness, level: c.level, tier: c.tier, flavor: c.flavor, sprite: c.sprite, id: c.id } : null
        ),
      }));

      if (user.life <= 0) ws.send(encode("UserGameOver"));
      else if (user.wins >= 10) ws.send(encode("UserVictory"));
      break;
    }

    case "UserStartGame":
      gameInstance.connect(user.userId);
      break;

    case "UserMove":
      if (params.sourceIndex != null && params.targetIndex != null)
        user.move(parseInt(params.sourceIndex), parseInt(params.targetIndex));
      break;
  }
};

function handleWebSocket(req: Request): Response {
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.addEventListener("error", (e) => console.log("WS error:", e));
  ws.addEventListener("message", (event) => {
    const decoded = decode(event.data);
    if (decoded.reqs()) {
      const { action, userId, params } = decoded;
      let user = gameInstance.getUser(userId);
      if (!user) {
        gameInstance.connect(userId);
        user = gameInstance.getUser(userId);
      }
      if (user) {
        pipeAction(user, action, params, ws);
        ws.send(gameInstance.encodeForClient(userId));
      }
    }
  });

  return response;
}

// ── Sprite serving ──

async function handleSprite(pathname: string): Promise<Response> {
  const filePath = `${Deno.cwd()}${pathname.replace(/\//g, "\\")}`;
  try {
    const bytes = await Deno.readFile(filePath);
    const lower = pathname.toLowerCase();
    const contentType =
      lower.endsWith(".png") ? "image/png" :
      lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "image/jpeg" :
      lower.endsWith(".webp") ? "image/webp" :
      lower.endsWith(".gif") ? "image/gif" :
      "application/octet-stream";
    return new Response(bytes, { headers: { "content-type": contentType } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

// ── HTML page ──

async function handlePage(): Promise<Response> {
  if (mode === "dev") js = await bundler(mode);

  const html = await Deno.readTextFile("./index.html");
  const rendered = html
    .replace("<!-- @TW -->", getStyleTag(sheet))
    .replace("<!-- @SSR -->", "")
    .replace("<!-- @THEME -->", [
      `<script>window.__GAME_THEME__=${JSON.stringify(themeData)}</script>`,
      game.theme.backgroundImage ? `<style>body{background-image:url(${game.theme.backgroundImage});}</style>` : "",
      `<title>${game.theme.title || "ABEngine"}</title>`,
    ].join("\n"))
    .replace("<!-- @BUNDLE -->", `<script>${js}</script>`);

  const body = mode === "prod"
    ? rendered.replace(/\n/g, "").replace(/[\t ]+\</g, "<").replace(/\>[\t ]+\</g, "><").replace(/\>[\t ]+$/g, ">")
    : rendered;

  return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
}

// ── Single server ──

const PORT = 4042;

Deno.serve({ port: PORT }, async (req) => {
  const url = new URL(req.url);

  if (req.headers.get("upgrade") === "websocket") {
    return handleWebSocket(req);
  }

  const spritePrefix = `/games/${gameName}/sprites/`;
  if (url.pathname.startsWith(spritePrefix) && !url.pathname.includes("..")) {
    return await handleSprite(url.pathname);
  }

  return await handlePage();
});
