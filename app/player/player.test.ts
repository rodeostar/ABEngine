import { assertEquals } from "@/app/testing/main.ts";
import { Player } from "@/app/player/player.ts";

Deno.test("[Player] initializes with correct values", () => {
  const player = new Player();

  assertEquals(player.bank, 10);
  assertEquals(player.board.length, 5);
  assertEquals(player.life, 10);
  assertEquals(player.turn, 1);
});
