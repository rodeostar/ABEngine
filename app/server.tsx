import { Application } from "oak";
import { bundler } from "@/app/bundle.ts";
import { setup, Configuration } from "tw";
import { getStyleTag, virtualSheet } from "tw/sheets";
import { App } from "@/ui/app.tsx";
import { DevelopmentMode } from "@/ui/entry.dev.tsx";
import { h } from "preact";
import render from "preact-render-to-string";

/**
 *
 * Unpack & cast config types
 */
type Config = Partial<{
  mode: "dev" | "prod";
  tailwind: Partial<Configuration>;
}>;

let js = "";

const rawConfig = await Deno.readTextFile("./config.json");
const config: Config = JSON.parse(rawConfig);
const sheet = virtualSheet();
const mode = config?.mode ?? "prod";

/**
 *
 * Initialize twind
 */
setup({
  ...(config?.tailwind || {}),
  sheet,
});

/***
 *
 * Oak microserver
 */
const app = new Application();

// Single page application, serving at all routes.
app.use(async (context) => {
  const ssrProps = {
    ws: new WebSocket("ws://localhost:8080"),
    sessionId: "",
    debug: false,
  };

  const content =
    mode === "prod" ? <App {...ssrProps} /> : <DevelopmentMode {...ssrProps} />;

  const ssr = render(content);

  // Bundle on serve, in development only.
  if (mode === "dev") js = await bundler(mode);

  const html = await Deno.readTextFile("./index.html");
  const withInjected = html
    .replace("<!-- @TW -->", getStyleTag(sheet))
    .replace("<!-- @BUNDLE -->", `<script>${js}</script>`)
    .replace("<!-- @SSR -->", ssr);

  // Minify HTML in production mode.
  const withMinify =
    mode === "prod"
      ? withInjected
          .replace(/\n/g, "")
          .replace(/[\t ]+\</g, "<")
          .replace(/\>[\t ]+\</g, "><")
          .replace(/\>[\t ]+$/g, ">")
      : withInjected;

  context.response.body = withMinify;
});

await app.listen({ port: 8000 });
