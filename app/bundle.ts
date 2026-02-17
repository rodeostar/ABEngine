import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";

export async function bundler(mode: "dev" | "prod" = "prod") {
  const outfile = `./main.bundle.js`;
  await esbuild.build({
    absWorkingDir: Deno.cwd(),
    jsxFactory: "h",
    jsxFragment: "Fragment",
    loader: {
      ".ts": "ts",
      ".js": "js",
      ".tsx": "tsx",
    },
    treeShaking: true,
    logLevel: "silent",
    external: ["tw", "tailwindcss"],
    format: "iife",
    bundle: true,
    minify: mode === "prod",
    minifyWhitespace: mode === "prod",
    target: "chrome99",
    entryPoints: ["./ui/entry.client.tsx"],
    plugins: [
      ...denoPlugins({
        configPath: `${Deno.cwd()}/deno.json`,
      }),
    ],
    outfile,
  });

  const result = await Deno.readTextFile(outfile);
  esbuild.stop();
  return result;
}
