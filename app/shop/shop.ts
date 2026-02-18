import { Character } from "@/app/character/character.ts";
import { Item } from "@/app/item/item.ts";
import { createEmptyBoard } from "@/app/consts.ts";

export class Shop {
  characters = createEmptyBoard<Character>();
  items: (Item | null)[] = [null, null];
}

export interface ShopShape {
  characters: Array<Character | null>;
  items: Array<Item | null>;
}
