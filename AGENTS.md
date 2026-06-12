# National Bourré League

A Vite + React + TypeScript single-page app teaching the card game Bourré. It has
three screens: Home, a Rules reference (standard rules + house-rule placeholders),
and an interactive Tutorial that walks through a hand of Bourré.

## Project layout

- `src/screens/` — `HomeScreen`, `RulesScreen`, `TutorialScreen`.
- `src/components/` — `PlayingCard` and `Hand` render the elegant card visuals.
- `src/data/` — content is data-driven: `rules.ts` (rule text + house-rule
  placeholders) and `tutorial.ts` (the step-by-step hand walkthrough).
- `src/types.ts` — `Card`/`Suit`/`Rank` model and helpers.

## Cursor Cloud specific instructions

- Standard scripts live in `package.json`: `npm run dev` (Vite dev server),
  `npm run lint` (ESLint), `npm run build` (`tsc -b && vite build`).
- The dev server runs on port **5173** and is configured with `server.host: true`
  in `vite.config.ts`, so it is reachable from outside the VM. Use `npm run dev`
  (development), not `npm run build`/`preview`, for iterating.
- Routing is a simple `useState` screen switch in `src/App.tsx` (no router
  library); add a screen by extending the `Screen` union and the `<main>` switch.
- The Tutorial's interactive "pick the legal play" logic is driven entirely by the
  `interactive-trick` step data in `src/data/tutorial.ts` (`legalIdx`, `bestIdx`,
  `explain`). Change the lesson by editing that data, not the component.
