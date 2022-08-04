import { Character } from "@/app/character/character.ts";
import { createEmptyBoard } from "@/app/consts.ts";

export class Shop {
  characters = createEmptyBoard<Character>();
}

export interface ShopShape {
  characters: Array<Character | null>;
}
