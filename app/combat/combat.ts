import { Character } from "@/app/character/character.ts";
import { CombatStep, SnapshotUnit } from "@/app/engine.ts";

export type AbilityResult = {
  damage?: number;
  heal?: number;
  buff?: { power: number; toughness: number };
  text?: string;
  summon?: Character;
} | void;

export type AbilityFn = (
  self: Character,
  allies: Character[],
  enemies: Character[]
) => AbilityResult;

export type AbilityMap = Record<
  string,
  Partial<{ before: AbilityFn; hurt: AbilityFn; faint: AbilityFn }>
>;

const toSnap = (c: Character): SnapshotUnit => ({
  name: c.name, power: c.power, toughness: c.toughness, id: c.id,
  sprite: c.sprite, flavor: c.flavor, level: c.level, tier: c.tier,
});

const snapshot = (p1c: Character[], p2c: Character[]) => ({
  p1: p1c.map(toSnap),
  p2: p2c.map(toSnap),
});

export class CombatEngine {
  p1c: Character[];
  p2c: Character[];
  abilities: AbilityMap;
  log: CombatStep[] = [];

  constructor(
    p1f: (Character | null)[],
    p2f: (Character | null)[],
    abilities: AbilityMap = {}
  ) {
    // Clone characters so combat mutates copies; player/AI boards stay intact
    this.p1c = p1f
      .filter((item): item is Character => item != null)
      .map((c) => c.clone());
    this.p2c = p2f
      .filter((item): item is Character => item != null)
      .map((c) => c.clone());
    this.abilities = abilities;
  }

  private getAbility(name: string) {
    return this.abilities[name] || {};
  }

  private triggerAbility(
    trigger: "before" | "hurt" | "faint",
    char: Character,
    allies: Character[],
    enemies: Character[]
  ) {
    const ability = this.getAbility(char.name);
    const fn = ability[trigger];
    if (!fn) return;

    const result = fn(char, allies, enemies);
    if (result) {
      this.log.push({
        type: "ability",
        source: char.name,
        target: result.damage ? enemies[enemies.length - 1]?.name : undefined,
        damage: result.damage,
        heal: result.heal,
        buff: result.buff,
        text: result.text,
        snapshot: snapshot(this.p1c, this.p2c),
      });

      if (result.summon) {
        allies.push(result.summon);
        this.log.push({
          type: "summon",
          source: char.name,
          text: `${char.name} summoned ${result.summon.name}`,
          snapshot: snapshot(this.p1c, this.p2c),
        });
      }
    }
  }

  private pvp(c1: Character, c2: Character) {
    this.triggerAbility("before", c1, this.p1c, this.p2c);
    this.triggerAbility("before", c2, this.p2c, this.p1c);

    c2.toughness -= c1.power;
    c1.toughness -= c2.power;

    this.log.push({
      type: "attack",
      source: c1.name,
      target: c2.name,
      damage: c1.power,
      returnDamage: c2.power,
      snapshot: snapshot(this.p1c, this.p2c),
    });

    if (c1.toughness > 0) {
      this.triggerAbility("hurt", c1, this.p1c, this.p2c);
    }
    if (c2.toughness > 0) {
      this.triggerAbility("hurt", c2, this.p2c, this.p1c);
    }

    if (c1.toughness <= 0) {
      this.triggerAbility("faint", c1, this.p1c, this.p2c);
      this.log.push({
        type: "faint",
        source: c1.name,
        snapshot: snapshot(this.p1c, this.p2c),
      });
    }
    if (c2.toughness <= 0) {
      this.triggerAbility("faint", c2, this.p2c, this.p1c);
      this.log.push({
        type: "faint",
        source: c2.name,
        snapshot: snapshot(this.p1c, this.p2c),
      });
    }

    return [c1, c2];
  }

  start(): { result: string; log: CombatStep[] } {
    let safety = 100;
    while (safety-- > 0) {
      const c1 = this.p1c.at(-1);
      const c2 = this.p2c.at(-1);

      if (!c1 && !c2) return { result: "DRAW", log: this.log };
      if (!c1 && c2) return { result: "P2", log: this.log };
      if (c1 && !c2) return { result: "P1", log: this.log };

      if (c1 && c2) {
        this.pvp(c1, c2);
        if (c1.toughness <= 0) this.p1c.pop();
        if (c2.toughness <= 0) this.p2c.pop();
      }
    }

    return { result: "DRAW", log: this.log };
  }
}
