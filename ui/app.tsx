import { h, ComponentChildren } from "preact";
import { GameProvider, useGame, PlayerPhases } from "@/ui/provider.tsx";
import { tw } from "tw";
import { BattlePhase } from "@/ui/views/battle-phase.tsx";
import { ShopPhase } from "@/ui/views/shop-phase.tsx";

export type AppProps = {
  sessionId: string;
  ws: WebSocket;
  debug: boolean;
  children?: ComponentChildren;
};

export type DebuggerProps = {
  className?: string;
};

export const Debugger = ({ className = "" }: DebuggerProps) => {
  const { player, sessionId } = useGame();

  return (
    <div class={`${className} no-scrollbar`}>
      <h1>Debugging: {sessionId} </h1>

      <code>
        <pre>{JSON.stringify(player, undefined, 1)}</pre>
      </code>
    </div>
  );
};

const Router = () => {
  const { phase } = useGame();

  if (phase === PlayerPhases.BATTLE) return <BattlePhase />;
  else if (phase === PlayerPhases.SHOP) return <ShopPhase />;
  else if (phase === PlayerPhases.IN_QUEUE) return <div>in queue</div>;

  return <div>welcome</div>;
};

export const App = (props: AppProps) => {
  return (
    <GameProvider {...props}>
      <section
        class={tw`p-4 bg-[#eee] w-[640px] h-[340px] flex flex-col relative`}
      >
        <Router />
        {props.children}
      </section>
    </GameProvider>
  );
};
