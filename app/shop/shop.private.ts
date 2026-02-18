import { CharacterFactory } from "@/app/character-factory.ts";
import { ItemFactory } from "@/app/item/item.ts";
import { Shop } from "@/app/shop/shop.ts";

export class ShopEngine extends Shop {
  set: CharacterFactory;
  itemSet: ItemFactory | null;

  constructor(set: CharacterFactory, itemSet: ItemFactory | null = null) {
    super();
    this.set = set;
    this.itemSet = itemSet;
    this.characters = set.roll(3);
    if (itemSet) {
      this.items = itemSet.roll(2);
    }
  }

  roll(turn = 1) {
    this.characters = this.set.roll(3, turn);
    if (this.itemSet) {
      this.items = this.itemSet.roll(2);
    }
  }
}
