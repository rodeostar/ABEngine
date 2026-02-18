export type CharacterShape = Partial<{
  power: number;
  toughness: number;
  tier: number;
  level: number;
  name: string;
  exp: number;
  id: string;
  flavor: string;
  sprite: string;
}>;

export class Character {
  power: number;
  toughness: number;
  tier: number;
  level: number;
  name: string;
  exp: number;
  id: string;
  flavor: string;
  sprite: string;

  constructor({ power, toughness, tier, level, name, exp, flavor, sprite }: CharacterShape) {
    if (!name) throw new Error("Character must have a name!");
    this.id = crypto.randomUUID();
    this.name = name;
    this.power = power ?? 1;
    this.toughness = toughness ?? 1;
    this.tier = tier ?? 1;
    this.level = level ?? 1;
    this.exp = exp ?? 0;
    this.flavor = flavor ?? "";
    this.sprite = sprite ?? "";
  }

  clone() {
    return new Character({
      name: this.name,
      power: this.power,
      toughness: this.toughness,
      tier: this.tier,
      level: this.level,
      exp: this.exp,
      flavor: this.flavor,
      sprite: this.sprite,
    });
  }
}

export type CharacterBoard = (Character | null)[];
