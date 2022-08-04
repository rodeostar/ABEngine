import { GameInstance } from "@/app/engine.ts";
import { ShopEngine } from "@/app/shop/shop.private.ts";
import { Character } from "@/app/character/character.ts";
import SetOne from "@/app/set/one.ts";

export * from "https://deno.land/std@0.148.0/testing/asserts.ts";

export default () => {
  return {
    createStaticShop: () => {
      const shop = new ShopEngine(SetOne);
      shop.characters = [
        new Character({ name: "1" }),
        new Character({ name: "2" }),
        new Character({ name: "3" }),
      ];
      return shop;
    },
    game: () => {
      const game = new GameInstance({ set: SetOne });
      game.connect("1");
      game.connect("2");
      return game;
    },
  };
};
