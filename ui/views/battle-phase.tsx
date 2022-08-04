import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGame } from "@/ui/provider.tsx";
import { CombatEngine } from "@/app/combat/combat.ts";

export const BattlePhase = () => {
  const [fight, setfight] = useState(new CombatEngine([], []));
  const { battle, player } = useGame();

  useEffect(() => {
    if (battle) {
      setfight(() => new CombatEngine(player.board, battle));
    }
  }, [battle]);

  if (!fight) {
    return <div>An error occured. Please refresh the page.</div>;
  }

  return <div>Battling: {JSON.stringify({})}</div>;
};
