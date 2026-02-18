import { parse as parseYaml } from "jsr:@std/yaml";
import { join, resolve } from "jsr:@std/path";
import { CharacterFactory } from "@/app/character-factory.ts";
import { ItemFactory } from "@/app/item/item.ts";
import type { AbilityMap, AbilityFn } from "@/app/combat/combat.ts";
import { registry, type EffectValue } from "@/app/abilities/registry.ts";

export type ThemeShape = {
  gameName: string;
  title: string;
  tagline: string;
  fontFamily: string;
  colors: Record<string, string>;
  tiers: Record<number, { color: string; label: string }>;
  flavor: Record<string, string>;
  /** Unit name -> ability description (e.g. "Mends the thread behind her.") for tooltips */
  unitAbilities?: Record<string, string>;
  tierColor: (tier: number) => string;
  tierLabel: (tier: number) => string;
  // Flattened for views: bg, cardBg, accent, accentBlue, text, textDim, danger, success, gold
  backgroundImage?: string;
  bg: string;
  cardBg: string;
  accent: string;
  accentBlue: string;
  text: string;
  textDim: string;
  danger: string;
  success: string;
  gold: string;
};

type UnitEntry = {
  name: string;
  power: number;
  toughness: number;
  tier: number;
  flavor?: string;
  sprite?: string;
  ability?: {
    trigger: "before" | "hurt" | "faint";
    effect: string;
    value: unknown;
    text: string;
  };
};

const triggerLabel: Record<"before" | "hurt" | "faint", string> = {
  before: "Start of battle",
  hurt: "Hurt",
  faint: "Faint",
};

function formatBuff(value: { power?: number; toughness?: number }) {
  const p = value.power ?? 0;
  const t = value.toughness ?? 0;
  const pText = p ? `${p > 0 ? "+" : ""}${p}` : "0";
  const tText = t ? `${t > 0 ? "+" : ""}${t}` : "0";
  return `${pText}/${tText}`;
}

function formatAbilityText(ability: UnitEntry["ability"]): string {
  if (!ability) return "";
  const { trigger, effect, value, text } = ability;
  let body = text || "";

  switch (effect) {
    case "buff_self": {
      body = `Gain ${formatBuff((value as { power?: number; toughness?: number }) ?? {})}.`;
      break;
    }
    case "buff_behind": {
      body = `Give the ally behind ${formatBuff((value as { power?: number; toughness?: number }) ?? {})}.`;
      break;
    }
    case "buff_all_allies": {
      body = `Give all allies ${formatBuff((value as { power?: number; toughness?: number }) ?? {})}.`;
      break;
    }
    case "heal_self": {
      body = `Heal ${Number(value) || 0}.`;
      break;
    }
    case "heal_all_allies": {
      body = `Heal all allies ${Number(value) || 0}.`;
      break;
    }
    case "damage_random_enemy": {
      body = `Deal ${Number(value) || 0} damage to a random enemy.`;
      break;
    }
    case "damage_backline": {
      body = `Deal ${Number(value) || 0} damage to the back enemy.`;
      break;
    }
    case "damage_frontline": {
      body = `Deal ${Number(value) || 0} damage to the front enemy.`;
      break;
    }
    case "summon": {
      const summon = value as { name: string; power: number; toughness: number } | undefined;
      if (summon?.name) body = `Summon ${summon.name} (${summon.power}/${summon.toughness}).`;
      break;
    }
    case "buff_self_if_stronger_ally": {
      body = `If another ally is stronger, gain ${formatBuff((value as { power?: number; toughness?: number }) ?? {})}.`;
      break;
    }
  }

  return `${triggerLabel[trigger]}: ${body}`;
}

type ItemEntry = {
  name: string;
  power: number;
  toughness: number;
  flavor?: string;
};

type ThemeEntry = {
  title: string;
  tagline: string;
  fontFamily: string;
  colors: Record<string, string>;
  tiers: Record<string, { color: string; label: string }>;
  flavor: Record<string, string>;
};

export type LoadedGame = {
  characterFactory: CharacterFactory;
  itemFactory: ItemFactory;
  abilities: AbilityMap;
  theme: ThemeShape;
};

export async function loadGame(gameDir: string): Promise<LoadedGame> {
  const base = join(Deno.cwd(), gameDir);
  const unitsRaw = await Deno.readTextFile(join(base, "units.yaml"));
  const itemsRaw = await Deno.readTextFile(join(base, "items.yaml"));
  const themeRaw = await Deno.readTextFile(join(base, "theme.yaml"));

  const units = parseYaml(unitsRaw) as UnitEntry[];
  const items = parseYaml(itemsRaw) as ItemEntry[];
  const themeParsed = parseYaml(themeRaw) as ThemeEntry;

  const characterFactory = new CharacterFactory();
  for (const u of units) {
    characterFactory.create(u.name, {
      power: u.power,
      toughness: u.toughness,
      tier: u.tier,
      flavor: u.flavor ?? "",
      sprite: u.sprite ?? "",
    });
  }

  const itemFactory = new ItemFactory();
  for (const it of items) {
    itemFactory.create(it.name, {
      power: it.power,
      toughness: it.toughness,
      flavor: it.flavor ?? "",
    });
  }

  const abilities: AbilityMap = {};
  const unitAbilities: Record<string, string> = {};
  for (const u of units) {
    if (u.ability) {
      unitAbilities[u.name] = formatAbilityText(u.ability);
      const { trigger, effect, value, text } = u.ability;
      const fn = registry[effect];
      if (fn) {
        const abilityFn: AbilityFn = (self, allies, enemies) =>
          fn(self, allies, enemies, value as EffectValue, text);
        if (!abilities[u.name]) abilities[u.name] = {};
        abilities[u.name][trigger] = abilityFn;
      }
    }
  }

  const tiersNum: Record<number, { color: string; label: string }> = {};
  for (const [k, v] of Object.entries(themeParsed.tiers ?? {})) {
    tiersNum[Number(k)] = v;
  }

  const colors = themeParsed.colors ?? {};
  const gameDirName = resolve(gameDir).split(/[\\/]/).pop() ?? "example";
  const theme: ThemeShape = {
    ...colors,
    gameName: gameDirName,
    title: themeParsed.title ?? "",
    tagline: themeParsed.tagline ?? "",
    fontFamily: themeParsed.fontFamily ?? "",
    colors,
    tiers: tiersNum,
    flavor: themeParsed.flavor ?? {},
    unitAbilities,
    tierColor: (tier: number) => tiersNum[tier]?.color ?? "#6b7280",
    tierLabel: (tier: number) => tiersNum[tier]?.label ?? "Common",
    backgroundImage: themeParsed.backgroundImage,
    bg: colors.bg ?? "#0a0e1a",
    cardBg: colors.cardBg ?? "#141824",
    accent: colors.accent ?? "#c9956b",
    accentBlue: colors.accentBlue ?? "#4a9eff",
    text: colors.text ?? "#e2e8f0",
    textDim: colors.textDim ?? "#64748b",
    danger: colors.danger ?? "#ef4444",
    success: colors.success ?? "#22c55e",
    gold: colors.gold ?? "#f59e0b",
  };

  return {
    characterFactory,
    itemFactory,
    abilities,
    theme,
  };
}
