import { h } from "preact";
import { setup } from "@/ui/setup.ts";
import { DevelopmentMode } from "@/ui/entry.dev.tsx";

setup((props) => <DevelopmentMode {...props} />);
