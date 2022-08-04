permissions=--allow-net --allow-read --allow-env --allow-write --allow-run

run:
	deno run $(permissions) --watch ./app/server.tsx

ws:
	deno run $(permissions) --watch ./app/wss.ts

test:
	deno test
