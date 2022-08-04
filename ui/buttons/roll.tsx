import { h } from "preact";
import { useGame } from "@/ui/provider.tsx";
import { ButtonStyles } from "@/ui/buttons/styles.ts";

export default () => {
  const { request } = useGame();

  return (
    <button
      class={ButtonStyles()}
      onClick={() => request("UserRoll", { boardIndex: "0", shopIndex: "0" })}
    >
      roll
    </button>
  );
};
