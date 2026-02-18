import { assertEquals, assertNotEquals } from "@/app/testing/main.ts";
import { Character } from "@/app/character/character.ts";

Deno.test("[Character] Construct public character", () => {
  const char = new Character({ name: "hello" });

  assertEquals(char.name, "hello");
  assertEquals(char.power, 1);
  assertEquals(char.toughness, 1);
  assertEquals(char.exp, 0);
  assertEquals(char.tier, 1);
});

Deno.test("[Character] Public character can clone itself", () => {
  const char = new Character({ name: "hello" });
  const copy = char.clone();

  assertEquals(char.name, copy.name);
  assertEquals(char.exp, copy.exp);
  assertEquals(char.power, copy.power);
  assertEquals(char.toughness, copy.toughness);
  assertEquals(char.tier, copy.tier);

  // Ensure this is not a reference
  assertNotEquals(char.id, copy.id);
});
