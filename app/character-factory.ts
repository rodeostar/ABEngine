import { Character } from "@/app/character/character.ts";

export class CharacterFactory {
  characters: Record<string, Character> = {};
  count = 0;

  public create(name: string, input: Partial<Character>) {
    this.count++;
    return (this.characters[name] = new Character({
      power: input.power ?? 1,
      toughness: input.toughness ?? 1,
      tier: input?.tier ?? 1,
      level: 1,
      name,
      flavor: input.flavor ?? "",
      sprite: input.sprite ?? "",
    }));
  }

  get() {
    return this.characters;
  }

  roll(count = 3, turn = 1) {
    if (this.count < 1) return [];

    const maxTier = turn >= 6 ? 3 : turn >= 3 ? 2 : 1;
    const eligible = this.asArray().filter((c) => c.tier <= maxTier);
    if (eligible.length === 0) return [];

    return [...new Array(count)].map(() =>
      eligible[Math.floor(Math.random() * eligible.length)].clone()
    );
  }

  asArray() {
    return Object.values(this.characters);
  }
}
