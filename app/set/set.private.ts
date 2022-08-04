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
    }));
  }

  get() {
    return this.characters;
  }

  roll(tier = 0) {
    if (this.count < 1) return [];

    const list = this.asArray();
    return [...new Array(tier + 3)].map(() =>
      list[Math.floor(Math.random() * list.length)].create()
    );
  }

  asArray() {
    return Object.values(this.characters);
  }
}
