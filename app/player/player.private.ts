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
  override userId: string;

  constructor(game: GameInstance, userId: string) {
    super();
    this.userId = userId;
    this.engines = createEmptyBoard();
    this.game = game;
    this.shop = new ShopEngine(game.set, game.itemSet ?? null);
    this.shop.roll(this.turn);
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
      shopItems: this.shop.items,
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
    if (this.life <= 1) {
      this.life = 0;
    } else {
      this.life--;
      this.bank = 10;
      this.turn++;
      this.shop.roll(this.turn);
    }
  }

  win() {
    if (this.wins >= 10) {
      this.wins = 10;
    } else {
      this.wins++;
      this.bank = 10;
      this.turn++;
      this.shop.roll(this.turn);
    }
  }

  roll() {
    if (this.bank > 0) {
      this.shop.roll(this.turn);
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

    if (!source || this.bank < 3) return;
    if (target && source.name !== target.name) return;

    if (target && source.name === target.name) {
      target.levelUp();
    } else {
      this.engines[boardIndex] = new CharacterEngine(source.clone());
    }

    this.bank -= 3;
    this.shop.characters[shopIndex] = null;
    this.sync(boardIndex);
  }

  buyItem(boardIndex: number, itemShopIndex: number) {
    const item = this.shop.items[itemShopIndex];
    const target = this.engines[boardIndex];

    if (!item || !target || this.bank < 3) return;

    target.power += item.power;
    target.toughness += item.toughness;
    this.bank -= 3;
    this.shop.items[itemShopIndex] = null;
    this.sync(boardIndex);
  }
}
