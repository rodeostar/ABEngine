import { GameInstance } from "@/app/engine.ts";
import { ShopEngine } from "@/app/shop/shop.private.ts";
import { Character } from "@/app/character/character.ts";
import { CharacterFactory } from "@/app/character-factory.ts";
import { ItemFactory } from "@/app/item/item.ts";

export * from "https://deno.land/std@0.148.0/testing/asserts.ts";

const set = new CharacterFactory();
set.create("Guy1", { power: 1, toughness: 1 });
set.create("Guy2", { power: 1, toughness: 2 });
set.create("Guy3", { power: 3, toughness: 3 });
set.create("Guy4", { power: 4, toughness: 3 });
set.create("Guy5", { power: 4, toughness: 3 });

const itemSet = new ItemFactory();

export default () => {
  return {
    set,
    itemSet,
    createStaticShop: () => {
      const shop = new ShopEngine(set, itemSet);
      shop.characters = [
        new Character({ name: "1" }),
        new Character({ name: "2" }),
        new Character({ name: "3" }),
      ];
      return shop;
    },
    game: () => {
      const game = new GameInstance({ set, itemSet });
      game.connect("1");
      game.connect("2");
      return game;
    },
  };
};
