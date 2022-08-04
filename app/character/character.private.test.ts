import { assertEquals, assertNotEquals } from "@/app/testing/main.ts";
import { CharacterEngine } from "@/app/character/character.private.ts";

Deno.test("[CharacterEngine] levels up a character", () => {
  const char = new CharacterEngine({ name: "Guy" });
  char.levelUp();

  assertEquals(char.power, 2);
  assertEquals(char.toughness, 2);
  assertEquals(char.level, 1);
  assertEquals(char.exp, 1);

  const charB = new CharacterEngine({
    name: "Guy2",
    exp: 1,
    level: 1,
  });
  const charC = new CharacterEngine({
    name: "Guy3",
    exp: 4,
    level: 2,
  });

  charB.levelUp();
  charC.levelUp();

  assertEquals(charB.level, 2);
  assertEquals(charB.exp, 2);

  assertEquals(charC.level, 3);
  assertEquals(charC.exp, 5);
});

Deno.test("[CharacterEngine] can create a copy of the public instance", () => {
  const char = new CharacterEngine({ name: "hello" });
  const copy = char.create();

  assertEquals(char.name, copy.name);
  assertEquals(char.exp, copy.exp);
  assertEquals(char.power, copy.power);
  assertEquals(char.toughness, copy.toughness);
  assertEquals(char.tier, copy.tier);

  // Ensure this is not a reference
  assertNotEquals(char.id, copy.id);
});
