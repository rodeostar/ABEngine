import { CharacterFactory } from "@/app/character-factory.ts";
import { CharacterEngine } from "@/app/character/character.private.ts";
import { Character } from "@/app/character/character.ts";
import { createEmptyBoard } from "@/app/consts.ts";

export class AIPlayer {
  board: (Character | null)[];
  engines: (CharacterEngine | null)[];
  userId = "ai-opponent";

  constructor(set: CharacterFactory, turn: number) {
    this.engines = createEmptyBoard();
    this.board = createEmptyBoard<Character>();

    const gold = Math.min(10 + Math.max(0, turn - 3) * 2, 20);
    let remaining = gold;

    const shop = set.roll(5, turn);

    for (let i = 0; i < this.board.length && remaining >= 3; i++) {
      const unit = shop[i % shop.length];
      if (!unit) continue;

      const existing = this.engines.findIndex(
        (e) => e != null && e.name === unit.name
      );

      if (existing >= 0 && this.engines[existing]) {
        this.engines[existing]!.levelUp();
        this.syncSlot(existing);
      } else {
        this.engines[i] = new CharacterEngine(unit.clone());
        this.syncSlot(i);
      }

      remaining -= 3;
    }
  }

  private syncSlot(index: number) {
    const eng = this.engines[index];
    this.board[index] = eng ? eng.getPublicCharacter() : null;
  }
}
