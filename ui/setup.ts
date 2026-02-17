import { render, ComponentChild } from "preact";

export type RenderCallback = ({
  sessionId,
  ws,
}: {
  sessionId: string;
  ws: WebSocket;
}) => ComponentChild;

const setCookie = (name: string, value: string, days = 7, path = "/") => {
  if (typeof document === "undefined") return "";
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires="${expires}"; path="${path}";`;
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
};

export function setup(content: RenderCallback) {
  const main = document.getElementById("root");
  const sessionId = getCookie("sessionId") || crypto.randomUUID();
  setCookie("sessionId", sessionId);
  const ws = new WebSocket("ws://localhost:4040");

  ws.addEventListener("open", () => {
    if (main) {
      render(content({ sessionId, ws }), main);
    }
  });
}
