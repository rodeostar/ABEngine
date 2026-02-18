import { Shop } from "@/app/shop/shop.ts";
import { assert, assertEquals } from "@/app/testing/main.ts";

Deno.test("[Shop] initializes", () => {
  assert(new Shop() instanceof Shop);
  assertEquals(new Shop().characters.length, 5);
  assertEquals(new Shop().items.length, 2);
});
