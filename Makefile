SHELL := cmd.exe
.SHELLFLAGS := /C

.PHONY: dev kill test clean

kill:
	powershell -NoProfile -ExecutionPolicy Bypass -File scripts\kill-ports.ps1

dev: kill
	ping -n 2 127.0.0.1 >nul
	deno task dev

test:
	deno task test

clean: kill
	if exist main.bundle.js del /f main.bundle.js
