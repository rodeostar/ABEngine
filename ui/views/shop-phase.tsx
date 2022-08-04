import { h, Fragment } from "preact";
import {
  RollButton,
  EndturnButton,
  ConnectButton,
  PurchaseButton,
} from "@/ui/buttons/index.ts";
import Board, { Shop } from "@/ui/board.tsx";
import { tw } from "tw";

export const ShopPhase = () => {
  return (
    <>
      <Board />
      <Shop />

      <div class={tw`grid grid-cols-4 gap-x-2 h-[15%]`}>
        <RollButton />
        <EndturnButton />
        <PurchaseButton />
        <ConnectButton />
      </div>
    </>
  );
};
