import { assertEquals } from "@/app/testing/main.ts";
import setup from "@/app/testing/main.ts";
import { Character } from "@/app/character/character.ts";

const StrongCharA = {
  name: "Guy3",
  power: 3,
  toughness: 3,
};

const StrongCharB = {
  name: "Guy4",
  power: 4,
  toughness: 3,
};

Deno.test("[E2E] Playthrough", () => {
  const { game } = setup();

  const gameInstance = game();
  gameInstance.connect("1");
  gameInstance.connect("2");

  const p1 = gameInstance.getUser("1");
  const p2 = gameInstance.getUser("2");

  p1.shop.characters = [
    new Character(StrongCharB),
    new Character(StrongCharA),
    new Character(StrongCharB),
  ];

  p2.shop.characters = [new Character(StrongCharA), new Character(StrongCharB)];

  p1.buy(0, 0);
  p1.buy(1, 1);
  p1.buy(2, 2);
  p1.roll();

  p2.buy(0, 0);
  p2.roll();

  const resultsA = gameInstance.joinLobby(p1, () => {});
  assertEquals(resultsA, {
    battle: undefined,
    inQueue: true,
  });

  const resultsB = gameInstance.joinLobby(p2, () => {});
  assertEquals(resultsB, {
    battle: p1.board,
    inQueue: false,
  });
});
