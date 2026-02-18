import { h, ComponentChildren, FunctionComponent } from "preact";
import { GameProvider, useGame, PlayerPhases } from "@/ui/provider.tsx";
import { ThemeProvider, getDefaultTheme } from "@/ui/theme-provider.tsx";
import type { ThemeShape } from "@/app/loader.ts";

export type GameViews = {
  Welcome: FunctionComponent;
  ShopPhase: FunctionComponent;
  BattlePhase: FunctionComponent;
  GameOver: FunctionComponent;
};

export type AppProps = {
  sessionId: string;
  ws: WebSocket;
  debug: boolean;
  views: GameViews;
  theme?: ThemeShape | null;
  bgColor?: string;
  children?: ComponentChildren;
};

const Router = ({ views }: { views: GameViews }) => {
  const { phase } = useGame();

  switch (phase) {
    case PlayerPhases.BATTLE:
      return <views.BattlePhase />;
    case PlayerPhases.SHOP:
      return <views.ShopPhase />;
    case PlayerPhases.GAME_OVER:
    case PlayerPhases.VICTORY:
      return <views.GameOver />;
    case PlayerPhases.IN_QUEUE:
      return <div>Waiting...</div>;
    case PlayerPhases.WELCOME:
    default:
      return <views.Welcome />;
  }
};

export const App = ({ views, theme: themeProp, bgColor, ...props }: AppProps) => {
  const theme = themeProp ?? getDefaultTheme();
  const backgroundColor = bgColor ?? "transparent";
  const content = (
    <section
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "auto",
        backgroundColor,
        fontFamily: theme.fontFamily,
        color: theme.text,
      }}
    >
      <Router views={views} />
      {props.children}
    </section>
  );

  return (
    <GameProvider {...props}>
      <ThemeProvider theme={theme}>{content}</ThemeProvider>
    </GameProvider>
  );
};
