import { Character, CharacterBoard } from "@/app/character/character.ts";
import { Item } from "@/app/item/item.ts";
import { createEmptyBoard } from "@/app/consts.ts";

export class Player {
  bank = 10;
  life = 10;
  turn = 1;
  board = createEmptyBoard<Character>();
  wins = 0;
  userId: string = crypto.randomUUID();
}

export interface PlayerShape {
  userId: string;
  bank: number;
  life: number;
  turn: number;
  wins: number;
  board: CharacterBoard;
  shop: CharacterBoard;
  shopItems: (Item | null)[];
}
