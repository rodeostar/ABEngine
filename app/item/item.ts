export interface ItemShape {
  name: string;
  power: number;
  toughness: number;
  flavor: string;
}

export class Item implements ItemShape {
  name: string;
  power: number;
  toughness: number;
  flavor: string;

  constructor({ name, power, toughness, flavor }: ItemShape) {
    this.name = name;
    this.power = power;
    this.toughness = toughness;
    this.flavor = flavor;
  }

  clone(): Item {
    return new Item({
      name: this.name,
      power: this.power,
      toughness: this.toughness,
      flavor: this.flavor,
    });
  }
}

export class ItemFactory {
  items: Item[] = [];

  create(name: string, stats: Partial<ItemShape>): Item {
    const item = new Item({
      name,
      power: stats.power ?? 0,
      toughness: stats.toughness ?? 0,
      flavor: stats.flavor ?? "",
    });
    this.items.push(item);
    return item;
  }

  roll(count = 2): (Item | null)[] {
    if (this.items.length === 0) return new Array(count).fill(null);

    return [...new Array(count)].map(() =>
      this.items[Math.floor(Math.random() * this.items.length)].clone()
    );
  }
}
