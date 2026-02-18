import { h, createContext } from "preact";
import { useContext, ComponentChildren } from "preact/hooks";
import type { ThemeShape } from "@/app/loader.ts";

const ThemeContext = createContext<ThemeShape | null>(null);

/** Build full ThemeShape from server-injected data (which has no tierColor/tierLabel). */
export function buildThemeFromData(data: Record<string, unknown> | null): ThemeShape {
  if (!data) return getDefaultTheme();
  const tiers = (data.tiers as Record<number, { color: string; label: string }>) ?? {};
  return {
    ...data,
    gameName: (data.gameName as string) ?? "example",
    title: (data.title as string) ?? "Auto Battler",
    tagline: (data.tagline as string) ?? "",
    fontFamily: (data.fontFamily as string) ?? "",
    colors: (data.colors as Record<string, string>) ?? {},
    tiers,
    flavor: (data.flavor as Record<string, string>) ?? {},
    unitAbilities: (data.unitAbilities as Record<string, string>) ?? {},
    tierColor: (tier: number) => tiers[tier]?.color ?? "#9ca3af",
    tierLabel: (tier: number) => tiers[tier]?.label ?? "Common",
    bg: (data.bg as string) ?? "#050608",
    cardBg: (data.cardBg as string) ?? "rgba(12, 15, 20, 0.90)",
    accent: (data.accent as string) ?? "#88cca0",
    accentBlue: (data.accentBlue as string) ?? "#88cca0",
    text: (data.text as string) ?? "rgba(255,255,255,0.95)",
    textDim: (data.textDim as string) ?? "rgba(140,160,165,0.70)",
    danger: (data.danger as string) ?? "#f87171",
    success: (data.success as string) ?? "#4ade80",
    gold: (data.gold as string) ?? "#fbbf24",
  } as ThemeShape;
}

export function getDefaultTheme(): ThemeShape {
  const tiers: Record<number, { color: string; label: string }> = {
    1: { color: "#9ca3af", label: "Common" },
    2: { color: "#60a5fa", label: "Rare" },
    3: { color: "#fbbf24", label: "Legendary" },
  };
  return {
    gameName: "example",
    title: "AUTO BATTLER",
    tagline: "Build your squad. Fight to survive.",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    colors: {},
    tiers,
    flavor: {},
    unitAbilities: {},
    tierColor: (tier: number) => tiers[tier]?.color ?? "#6b7280",
    tierLabel: (tier: number) => tiers[tier]?.label ?? "Common",
    bg: "#050608",
    cardBg: "rgba(12, 15, 20, 0.90)",
    accent: "#88cca0",
    accentBlue: "#88cca0",
    text: "rgba(255,255,255,0.95)",
    textDim: "rgba(140,160,165,0.70)",
    danger: "#f87171",
    success: "#4ade80",
    gold: "#fbbf24",
  };
}

export function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeShape;
  children: ComponentChildren;
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeShape {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return theme;
}
