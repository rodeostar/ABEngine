import { Character } from "@/app/character/character.ts";
import { CharacterFactory } from "@/app/set/set.private.ts";
import { GameEvents } from "@/app/events.ts";
import { PlayerEngine } from "@/app/player/player.private.ts";
import { EventEmitter } from "@/deps.ts";
import { CombatPrivate } from "@/app/combat/combat.private.ts";

export interface InstanceOptions {
  set: CharacterFactory;
}

export type BattleResults = {
  battle: (Character | null)[] | undefined;
  inQueue: boolean;
};

export type AfterBattleHandler = (results: BattleResults) => void;

export type Lobby = {
  player: PlayerEngine;
  onComplete: AfterBattleHandler;
};

export class GameInstance {
  set: CharacterFactory;
  events: EventEmitter<GameEvents> = new EventEmitter<GameEvents>();
  players: Record<string, PlayerEngine> = {};
  lobby: Lobby[] = [];

  constructor({ set }: InstanceOptions) {
    this.set = set;
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
    const results = battle.results();

    if (results === p1.userId) {
      p1.win();
      p2.lose();
    }

    if (results === p2.userId) {
      p2.win();
      p1.lose();
    }

    return results;
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

    // Avoid players battling themselves.
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
