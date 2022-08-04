import { h } from "preact";
import { setup } from "@/ui/setup.ts";
import { App } from "@/ui/app.tsx";

setup(({ sessionId, ws }) => (
  <App sessionId={sessionId} ws={ws} debug={false} />
));
