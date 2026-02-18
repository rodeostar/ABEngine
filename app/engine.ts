import { Character } from "@/app/character/character.ts";
import { CharacterFactory } from "@/app/character-factory.ts";
import { ItemFactory } from "@/app/item/item.ts";
import { PlayerEngine } from "@/app/player/player.private.ts";
import { CombatPrivate } from "@/app/combat/combat.private.ts";

export interface InstanceOptions {
  set: CharacterFactory;
  itemSet?: ItemFactory;
}

export type BattleResults = {
  battle: (Character | null)[] | undefined;
  inQueue: boolean;
  log?: CombatStep[];
  result?: string;
};

export interface SnapshotUnit {
  name: string;
  power: number;
  toughness: number;
  id: string;
  sprite?: string;
  flavor?: string;
  level?: number;
  tier?: number;
}

export interface CombatStep {
  type: "attack" | "ability" | "faint" | "summon";
  source: string;
  target?: string;
  damage?: number;
  returnDamage?: number;
  heal?: number;
  buff?: { power: number; toughness: number };
  text?: string;
  snapshot: { p1: SnapshotUnit[]; p2: SnapshotUnit[] };
}

export type AfterBattleHandler = (results: BattleResults) => void;

export type Lobby = {
  player: PlayerEngine;
  onComplete: AfterBattleHandler;
};

export class GameInstance {
  set: CharacterFactory;
  itemSet: ItemFactory | null;
  players: Record<string, PlayerEngine> = {};
  lobby: Lobby[] = [];

  constructor({ set, itemSet }: InstanceOptions) {
    this.set = set;
    this.itemSet = itemSet ?? null;
  }

  connect(userId: string) {
    this.players[userId] = new PlayerEngine(this, userId);
  }

  getUser(userId: string) {
    return this.players[userId];
  }

  end(userId: string) {
    delete this.players[userId];
  }

  createBattle(p1: PlayerEngine, p2: PlayerEngine) {
    const battle = new CombatPrivate(p1, p2);
    const { result, log } = battle.execute();

    if (result === p1.userId) {
      p1.win();
      p2.lose();
    } else if (result === p2.userId) {
      p2.win();
      p1.lose();
    } else {
      p1.turn++;
      p2.turn++;
      p1.bank = 10;
      p2.bank = 10;
      p1.shop.roll(p1.turn);
      p2.shop.roll(p2.turn);
    }

    return { result, log };
  }

  joinLobby(
    player: PlayerEngine,
    onComplete: (results: BattleResults) => void
  ) {
    let results: BattleResults = {
      battle: undefined,
      inQueue: true,
    };

    const next = this.lobby[0]?.player?.userId;

    if (!!next && next === player.userId) {
      return results;
    }

    if (this.lobby.length > 0) {
      const versus = this.lobby.shift();
      if (versus) {
        results = {
          battle: versus.player.board,
          inQueue: false,
        };

        versus.onComplete(results);
        onComplete(results);
      }
    } else {
      this.lobby.push({
        onComplete,
        player,
      });
    }

    return results;
  }

  encodeForClient(userId: string) {
    return JSON.stringify(this.getUser(userId).getPublicPlayer());
  }
}
