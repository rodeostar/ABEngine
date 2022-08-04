import { h } from "preact";
import { App, Debugger } from "@/ui/app.tsx";
import { tw } from "tw";

interface DevModeProps {
  ws: WebSocket;
}

const size = 450;

export const DevelopmentMode = ({ ws }: DevModeProps) => (
  <div class={tw`flex flex-col justify-center items-center gap-y-2 pt-8`}>
    <App sessionId={"player1"} ws={ws} debug>
      <Debugger
        className={tw`text-xs bg-black text-yellow-400 p-4 h-full w-[${size}px] overflow-scroll absolute right-[-${
          size + 20
        }px]`}
      />
    </App>
    <App sessionId="player2" ws={ws} debug>
      <Debugger
        className={tw`text-xs bg-black text-yellow-400 p-4 h-full w-[${size}px] overflow-scroll absolute right-[-${
          size + 20
        }px]`}
      />
    </App>
  </div>
);
