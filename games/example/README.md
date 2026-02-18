# Example Game

This is a reference game that ships with ABEngine. It demonstrates all supported unit abilities, items, and theme configuration.

## Structure

```
games/example/
  units.yaml    — unit definitions (name, stats, tier, abilities)
  items.yaml    — item definitions (stat buffs)
  theme.yaml    — UI theme (title, colors, flavor text)
  sprites/      — sprite assets (optional, see format below)
```

## Sprite Format

Place sprites in the `sprites/` folder using the naming convention:

- `<basename>-NE.png` — player-facing sprite
- `<basename>-SW.png` — enemy-facing sprite
- `<basename>.png` — fallback (used for both directions)

Reference the `<basename>` in `units.yaml` via the `sprite` field.

## Creating Your Own Game

1. Copy this folder to `games/your-game-name/`
2. Edit the YAML files to define your units, items, and theme
3. Set `"game": "your-game-name"` in `config.json`
4. Run `make dev`
