import { Player } from "@/app/player/player.ts";
import { CombatEngine } from "@/app/combat/combat.ts";

export class CombatPrivate extends CombatEngine {
  p1: Player;
  p2: Player;
  constructor(p1: Player, p2: Player) {
    super(p1.board, p2.board);

    this.p1 = p1;
    this.p2 = p2;
  }

  results() {
    const results = this.start();
    if (results === "P1") return this.p1.userId;
    if (results === "P2") return this.p2.userId;
    return "DRAW";
  }
}
