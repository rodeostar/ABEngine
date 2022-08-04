import { CharacterFactory } from "@/app/set/set.private.ts";

const Set = new CharacterFactory();

Set.create("Priest", { power: 1, toughness: 3 });
Set.create("Bandit", { power: 3, toughness: 2 });
Set.create("Pirate", { power: 2, toughness: 2 });

Set.create("Cardinal", { power: 2, toughness: 4, tier: 2 });
Set.create("Lord", { power: 2, toughness: 3, tier: 2 });
Set.create("Wizard", { power: 1, toughness: 3, tier: 2 });

export const Abilities: Record<string, Record<string, () => void>> = {
  Cardinal: {
    hurt: () => {},
    faint: () => {},
    before: () => {},
  },
  Bandit: {
    hurt: () => {},
    faint: () => {},
    before: () => {},
  },
  Wizard: {
    hurt: () => {},
    faint: () => {},
    before: () => {},
  },
};

export default Set;
