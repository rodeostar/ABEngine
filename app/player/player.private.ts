import { Player, PlayerShape } from "@/app/player/player.ts";
import { GameInstance } from "@/app/engine.ts";
import { CharacterEngine } from "@/app/character/character.private.ts";
import { createEmptyBoard } from "@/app/consts.ts";
import { ShopEngine } from "@/app/shop/shop.private.ts";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value != null;
}

const reorderArray = <T>(fromIndex: number, toIndex: number, a: T[]) => {
  const movedItem = a[fromIndex];
  const remainingItems = a.filter((_, index) => index !== fromIndex);
  const reorderedItems = [
    ...remainingItems.slice(0, toIndex),
    movedItem,
    ...remainingItems.slice(toIndex),
  ];

  return reorderedItems;
};

export class PlayerEngine extends Player {
  game: GameInstance;
  shop: ShopEngine;
  engines: Array<CharacterEngine | null>;
  userId: string;
  constructor(game: GameInstance, userId: string) {
    super();
    this.userId = userId;
    this.engines = createEmptyBoard();
    this.game = game;
    this.shop = new ShopEngine(game.set);
    this.shop.roll();
  }

  move(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex) return;
    if (this.engines[targetIndex] == null) {
      this.engines.splice(targetIndex, 1, this.engines[sourceIndex]);
      this.engines[sourceIndex] = null;
    } else if (
      this.engines[sourceIndex]?.name === this.engines[targetIndex]?.name
    ) {
      this.engines[targetIndex]?.levelUp();
      this.engines[sourceIndex] = null;
    } else {
      this.engines = reorderArray(sourceIndex, targetIndex, this.engines);
    }

    this.sync(sourceIndex);
    this.sync(targetIndex);
  }

  getPublicPlayer(): PlayerShape {
    return {
      shop: this.shop.characters,
      bank: this.bank,
      life: this.life,
      turn: this.turn,
      board: this.board,
      wins: this.wins,
      userId: this.userId,
    };
  }

  sync(boardIndex: number) {
    const target = this.engines[boardIndex];
    if (target) {
      this.board[boardIndex] = target.getPublicCharacter();
    } else {
      this.board[boardIndex] = null;
    }
  }

  lose() {
    if (this.life === 1) {
      this.game.end(this.userId);
    } else {
      this.life--;
      this.bank = 10;
      this.shop.roll();
    }
  }

  win() {
    if (this.wins === 10) {
      this.game.end(this.userId);
    } else {
      this.wins++;
      this.bank = 10;
      this.shop.roll();
    }
  }

  roll() {
    if (this.bank > 0) {
      this.shop.roll();
      this.bank--;
    }
  }

  get fighters() {
    return this.board.filter(notEmpty);
  }

  get front() {
    return this.fighters.at(-1);
  }

  buy(boardIndex: number, shopIndex: number) {
    const source = this.shop.characters[shopIndex];
    const target = this.engines[boardIndex];

    if (
      !source ||
      (!source && !target) ||
      (typeof source.name === "string" &&
        typeof target?.name === "string" &&
        source.name !== target.name) ||
      this.bank < 3
    ) {
      // do nothing
    } else {
      if (target && source.name === target.name) {
        // source and target match
        target.levelUp();
      } else if (target == null) {
        // place on empty square
        this.engines[boardIndex] = new CharacterEngine(source.create());
      }

      this.bank -= 3;
      this.shop.characters[boardIndex] = null;
      this.sync(boardIndex);
    }
  }
}
