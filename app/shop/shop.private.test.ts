import { ShopEngine } from "@/app/shop/shop.private.ts";
import setup, { assertNotEquals } from "@/app/testing/main.ts";

Deno.test("[ShopEngine] can roll child shop instance", () => {
  const { set, itemSet } = setup();
  const engine = new ShopEngine(set, itemSet);
  const a1 = engine.characters[0]?.name;
  assertNotEquals(a1, null);
  engine.roll();
  assertNotEquals(engine.characters[0], null);
});
