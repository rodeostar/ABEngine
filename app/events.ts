export type GameEvents = {
  UserConnect(userId: string): void;
  UserPurchase(userId: string, boardIndex: number, shopIndex: number): void;
  UserMove(userId: string, source: number, target: number): void;
  UserRoll(userId: string): void;
  UserEndTurn(userId: string): void;
  UserInQueue(userId: string): void;
  UserBattle(
    userId: string,
    results: "WIN" | "LOSS" | "DRAW",
    opponent: string
  ): void;
  UserLostGame(userId: string): void;
  UserWonGame(userId: string): void;
};
