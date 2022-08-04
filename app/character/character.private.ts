import { Character, CharacterShape } from "@/app/character/character.ts";

export class CharacterEngine extends Character {
  id: string;
  constructor(props: CharacterShape) {
    super(props);
    this.id = crypto.randomUUID();
  }

  levelUp() {
    if (this.exp < 5) {
      this.exp++;

      if (this.exp === 2 || this.exp === 5) {
        this.level++;
      }

      this.power++;
      this.toughness++;
    }
  }

  getPublicCharacter() {
    return super.create();
  }
}
