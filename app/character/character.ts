export type CharacterShape = Partial<{
  power: number;
  toughness: number;
  tier: number;
  level: number;
  name: string;
  exp: number;
  id: string;
}>;

export class Character {
  power: number;
  toughness: number;
  tier: number;
  level: number;
  name: string;
  exp: number;
  id: string;
  constructor({ power, toughness, tier, level, name, exp }: CharacterShape) {
    if (!name) throw new Error("Character must have a name!");
    this.id = crypto.randomUUID();
    this.name = name;
    this.power = power ?? 1;
    this.toughness = toughness ?? 1;
    this.tier = tier ?? 1;
    this.level = level ?? 1;
    this.exp = exp ?? 0;
  }

  create() {
    return new Character({
      name: this.name,
      power: this.power,
      toughness: this.toughness,
      tier: this.tier,
      level: this.level,
      exp: this.exp,
    });
  }
}

export type CharacterBoard = (Character | null)[];
