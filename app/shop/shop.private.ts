import { CharacterFactory } from "@/app/set/set.private.ts";
import { Shop } from "@/app/shop/shop.ts";

export class ShopEngine extends Shop {
  set: CharacterFactory;
  constructor(set: CharacterFactory) {
    super();
    this.characters = set.roll();
    this.set = set;
  }

  roll() {
    this.characters = this.set.roll();
  }
}
