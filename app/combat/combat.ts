import { Character } from "@/app/character/character.ts";
import { Abilities } from "@/app/set/one.ts";

export enum CombatStages {
  before = 0,
  hurt = 1,
  faint = 2,
}

const defaultHandlers = {
  hurt: () => {},
  before: () => {},
  faint: () => {},
};

export class CombatEngine {
  p1c: Character[];
  p2c: Character[];

  constructor(p1f: (Character | null)[], p2f: (Character | null)[]) {
    this.p1c = p1f.filter((item) => item != null) as Character[];
    this.p2c = p2f.filter((item) => item != null) as Character[];
  }

  pvp(c1: Character, c2: Character) {
    const p1a = Abilities[c1.name] || defaultHandlers;
    const p2a = Abilities[c2.name] || defaultHandlers;
    if (p1a.before) p1a.before();
    if (p2a.before) p2a.before();

    while (c1.toughness >= 0 && c2.toughness >= 0) {
      c2.toughness -= c1.power;
      c1.toughness -= c2.power;
      if (c1.toughness > 0 && p1a.hurt) p1a.hurt();
      if (c2.toughness > 0 && p2a.hurt) p2a.hurt();
    }

    if (c1.toughness < 1 && p1a.faint) p1a.faint();
    if (c2.toughness < 1 && p2a.faint) p2a.faint();
    return [c1, c2];
  }

  start() {
    while (this.p1c.length >= 0 || this.p2c.length >= 0) {
      const c1 = this.p1c.at(-1);
      const c2 = this.p2c.at(-1);
      if (!c1 && !c2) {
        return "DRAW";
      }
      if (!c1 && c2) {
        return "P1";
      }
      if (c1 && !c2) {
        return "P2";
      }
      if (c1 && c2) {
        const [c1r, c2r] = this.pvp(c1, c2);
        if (c1r.toughness <= 0) this.p1c.pop();
        if (c2r.toughness <= 0) this.p2c.pop();
      }
    }
  }
}
