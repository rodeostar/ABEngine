import { ShopEngine } from "@/app/shop/shop.private.ts";
import { assertNotEquals } from "@/app/testing/main.ts";
import SetOne from "@/app/set/one.ts";

Deno.test("[ShopEngine] can roll child shop instance", () => {
  const engine = new ShopEngine(SetOne);
  const a1 = engine.characters[0]?.name;
  assertNotEquals(a1, null);
  engine.roll();
  assertNotEquals(engine.characters[0], null);
});
