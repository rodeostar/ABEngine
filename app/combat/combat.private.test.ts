import setup, { assertEquals } from "@/app/testing/main.ts";
import { CombatEngine } from "@/app/combat/combat.ts";
import { Character } from "@/app/character/character.ts";

const { game } = setup();

const WeakCharA = {
  name: "Guy2",
  exp: 4,
  level: 2,
  power: 1,
  toughness: 2,
};

const WeakCharB = {
  name: "Guy2",
  power: 1,
  toughness: 2,
};

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

Deno.test("[Combat] PlayerA Loses", () => {
  const g = game();
  const p1 = g.getUser("1");
  const p2 = g.getUser("2");
  p1.shop.characters = [new Character(WeakCharA), new Character(WeakCharB)];
  p2.shop.characters = [new Character(StrongCharA), new Character(StrongCharB)];
  p1.buy(0, 0);
  p1.buy(1, 1);
  p2.buy(0, 0);
  p2.buy(1, 1);
  const engine = new CombatEngine(p1.board, p2.board);
  const { result } = engine.start();
  assertEquals(result, "P2");
});

Deno.test("[Combat] Player A wins", () => {
  const g = game();
  const p1 = g.getUser("1");
  const p2 = g.getUser("2");
  p1.shop.characters = [
    new Character(StrongCharB),
    new Character(StrongCharA),
    new Character(StrongCharB),
  ];
  p2.shop.characters = [new Character(StrongCharA), new Character(StrongCharB)];
  p1.buy(0, 0);
  p1.buy(1, 1);
  p1.buy(2, 2);
  p2.buy(0, 0);
  p2.buy(1, 1);
  const engine = new CombatEngine(p1.board, p2.board);
  const { result } = engine.start();
  assertEquals(result, "P1");
});

Deno.test("[Combat] Draw", () => {
  const g = game();
  const p1 = g.getUser("1");
  const p2 = g.getUser("2");
  p1.shop.characters = [new Character(StrongCharA), new Character(StrongCharB)];
  p2.shop.characters = [new Character(StrongCharA), new Character(StrongCharB)];
  p1.buy(0, 0);
  p1.buy(1, 1);
  p2.buy(0, 0);
  p2.buy(1, 1);
  const engine = new CombatEngine(p1.board, p2.board);
  const { result } = engine.start();
  assertEquals(result, "DRAW");
});
