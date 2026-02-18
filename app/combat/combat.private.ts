import { Player } from "@/app/player/player.ts";
import { CombatEngine, AbilityMap } from "@/app/combat/combat.ts";
import { CombatStep } from "@/app/engine.ts";

export class CombatPrivate extends CombatEngine {
  p1: Player;
  p2: Player;

  constructor(p1: Player, p2: Player, abilities: AbilityMap = {}) {
    super(p1.board, p2.board, abilities);
    this.p1 = p1;
    this.p2 = p2;
  }

  execute(): { result: string; log: CombatStep[] } {
    const { result, log } = this.start();

    if (result === "P1") return { result: this.p1.userId, log };
    if (result === "P2") return { result: this.p2.userId, log };
    return { result: "DRAW", log };
  }
}
