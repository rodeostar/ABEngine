import { assertEquals, assertNotEquals, assert } from "@/app/testing/main.ts";
import { CharacterFactory } from "@/app/set/set.private.ts";

Deno.test("[CharacterSet] roll()", () => {
  const factory = new CharacterFactory();
  const a1 = factory.create("friend", {});
  const a2 = factory.create("friend2", {});
  const a3 = factory.create("friend3", {});
  const afterRoll = factory.roll();

  for (const char of afterRoll) {
    assertNotEquals(char.id, a1.id);
    assertNotEquals(char.id, a2.id);
    assertNotEquals(char.id, a3.id);
  }
});

Deno.test("[CharacterSet] get()", () => {
  const fact = new CharacterFactory();
  assertEquals(fact.characters, fact.get());
});

Deno.test("[CharacterSet] asArray()", () => {
  const fact = new CharacterFactory();
  const arr = fact.asArray();
  arr.every((item) => assert(item.name in fact.characters));
});

Deno.test("[CharacterSet] create()", () => {
  const factory = new CharacterFactory();
  const friend = factory.create("friend", {});
  assertEquals(factory.characters["friend"].id, friend.id);
});
