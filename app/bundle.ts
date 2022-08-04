import { build } from "https://deno.land/x/esbuild@v0.14.25/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.4.1/mod.ts";

export async function bundler(mode: "dev" | "prod" = "prod") {
  const outfile = `./main.bundle.js`;
  await build({
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
    target: "chrome58",
    entryPoints: ["./ui/entry.client.tsx"],
    plugins: [
      denoPlugin({
        importMapFile: "import_map.json",
      }),
    ],
    outfile,
  });

  return await Deno.readTextFile(outfile);
}
