import setup, { assertEquals, assertNotEquals } from "@/app/testing/main.ts";
import { PlayerEngine } from "@/app/player/player.private.ts";
import { Character } from "@/app/character/character.ts";

const { game } = setup();

const StrongCharA = new Character({
  name: "Guy3",
  power: 3,
  toughness: 3,
});

const StrongCharB = new Character({
  name: "Guy4",
  power: 4,
  toughness: 3,
});

const StrongCharC = new Character({
  name: "Guy5",
  power: 4,
  toughness: 3,
});

Deno.test("[PlayerEngine] can purchase a character from the shop", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());
  const namePurchasing = player.shop.characters[0]?.name;
  const nameFailedPurchase = player.shop.characters[1]?.name;
  player.buy(0, 0);
  assertEquals(player.board[0]?.name, namePurchasing);
  assertEquals(player.bank, 7);
  player.buy(0, 1);
  assertEquals(player.bank, 7);
  assertEquals(player.shop.characters[1]?.name, nameFailedPurchase);
  player.buy(2, 2);
  assertEquals(player.bank, 4);
});

Deno.test(
  "[PlayerEngine] public board stays in sync with private engine",
  () => {
    const player = new PlayerEngine(game(), crypto.randomUUID());
    assertEquals(player.engines[0], null);
    assertEquals(player.board[0], null);
    player.buy(1, 0);
    player.roll();
    player.roll();
    player.roll();
    assertEquals(player.board[0]?.id, player.engines[0]?.id);
  }
);

Deno.test("[PlayerEngine] new shop items load when player rolls", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());
  const a1 = player.shop.characters[0]?.id;
  player.roll();
  assertNotEquals(a1, player.shop.characters[0]?.id);
});

Deno.test("[PlayerEngine] syncs engine with public board", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());

  player.sync(0);
  assertEquals(player.board[0], player.engines[0]);

  player.buy(0, 0);
  assertEquals(player.board[0]?.name, player.engines[0]?.name);
});

Deno.test("[PlayerEngine] Player wins", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());
  player.roll();
  player.roll();
  player.win();

  assertEquals(player.bank, 10);
  assertEquals(player.wins, 1);
  assertEquals(player.life, 10);
});

Deno.test("[PlayerEngine] Player loses", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());
  player.roll();
  player.roll();
  player.lose();
  assertEquals(player.bank, 10);
  assertEquals(player.wins, 0);
  assertEquals(player.life, 9);
});

Deno.test("[PlayerEngine] Player move to empty slot", () => {
  const player = new PlayerEngine(game(), crypto.randomUUID());
  player.shop.characters = [StrongCharA, StrongCharB, null];
  player.buy(0, 0);
  player.buy(1, 1);

  assertEquals(player.board[0]?.name, StrongCharA.name);
  assertEquals(player.board[3], null);

  player.move(0, 3);

  assertEquals(player.board[3]?.name, StrongCharA.name);
  assertEquals(player.board[0], null);
});
