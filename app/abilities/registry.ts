import { Character } from "@/app/character/character.ts";
import type { AbilityResult } from "@/app/combat/combat.ts";

export type EffectValue =
  | number
  | { power?: number; toughness?: number }
  | { name: string; power: number; toughness: number; tier: number; flavor: string };

export type RegistryEffect = (
  self: Character,
  allies: Character[],
  enemies: Character[],
  value: EffectValue,
  text: string
) => AbilityResult;

function buff(self: Character, value: { power?: number; toughness?: number }) {
  const p = value.power ?? 0;
  const t = value.toughness ?? 0;
  if (p) self.power += p;
  if (t) self.toughness += t;
}

export const registry: Record<string, RegistryEffect> = {
  buff_self(self, _allies, _enemies, value, text) {
    const v = value as { power?: number; toughness?: number };
    buff(self, v);
    return { buff: { power: v.power ?? 0, toughness: v.toughness ?? 0 }, text };
  },

  buff_behind(self, allies, _enemies, value, text) {
    const idx = allies.indexOf(self);
    const behind = allies[idx - 1];
    if (!behind) return;
    const v = value as { power?: number; toughness?: number };
    buff(behind, v);
    const toughness = v.toughness ?? 0;
    return toughness > 0
      ? { heal: toughness, text }
      : { buff: { power: v.power ?? 0, toughness: 0 }, text };
  },

  buff_all_allies(_self, allies, _enemies, value, text) {
    const v = value as { power: number; toughness: number };
    for (const ally of allies) {
      ally.power += v.power;
      ally.toughness += v.toughness;
    }
    return { buff: v, text };
  },

  heal_self(self, _allies, _enemies, value, text) {
    const n = value as number;
    self.toughness += n;
    return { heal: n, text };
  },

  heal_all_allies(_self, allies, _enemies, value, text) {
    const n = value as number;
    for (const ally of allies) ally.toughness += n;
    return { heal: n, text };
  },

  damage_random_enemy(_self, _allies, enemies, value, text) {
    if (enemies.length === 0) return;
    const n = value as number;
    const target = enemies[Math.floor(Math.random() * enemies.length)];
    target.toughness -= n;
    return { damage: n, text };
  },

  damage_backline(_self, _allies, enemies, value, text) {
    const back = enemies[0];
    if (!back) return;
    const n = value as number;
    back.toughness -= n;
    return { damage: n, text };
  },

  damage_frontline(_self, _allies, enemies, value, text) {
    const front = enemies[enemies.length - 1];
    if (!front) return;
    const n = value as number;
    front.toughness -= n;
    return { damage: n, text };
  },

  summon(_self, _allies, _enemies, value, text) {
    const v = value as {
      name: string;
      power: number;
      toughness: number;
      tier: number;
      flavor: string;
    };
    const character = new Character({
      name: v.name,
      power: v.power,
      toughness: v.toughness,
      tier: v.tier,
      flavor: v.flavor ?? "",
    });
    return { summon: character, text };
  },

  buff_self_if_stronger_ally(self, allies, _enemies, value, text) {
    const strongest = allies.reduce(
      (best, a) =>
        a.power + a.toughness > best.power + best.toughness ? a : best,
      allies[0]
    );
    if (!strongest || strongest === self) return;
    const v = value as { power: number; toughness: number };
    self.power += v.power;
    self.toughness += v.toughness;
    return { buff: v, text };
  },
};
