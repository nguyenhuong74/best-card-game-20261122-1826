# Four Winds Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/nguyenhuong74/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/nguyenhuong74/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

An original, complete card game that plays offline in a desktop browser —
no build step, no network requests, no libraries. Built for the make.fun
**"Make the best card game"** bounty (`best-card-game-20261122-1826`).

## The game

You are the **Ember Keeper**, duelling the **Warden of the Gale** for the four
winds. Each side has **30 HP** and **3 energy** a turn. Play cards from your
hand to strike, ward, mend and draw — and watch for **Resonance**: play two
cards of the same suit in one turn and the second gains **+2**.

- **4 original suits** — Ember 🔥, Tide 💧, Thorn 🌿, Gale 🌪️ — told apart by
  colour *and* shape, never by text alone.
- **24 unique cards** across 4 kinds: Strike, Ward, Mend, Insight.
- **A readable opponent**: the Warden heals when hurt, wards when you are
  loaded, and chases Resonance just like you do — so you can read its hand
  and counter it.
- **Title screen, live table, win screen and loss screen**, with a running
  duel log, HP bars, block and energy on display.
- **Mouse and keyboard**: click a card or press **1–5** to play it,
  **Enter** ends the turn, **R** restarts.

## Screenshots

`screenshots/` holds four real renders of the game's own code in desktop
Chrome, in order: the title screen (cover), a mid-game table, the victory
screen and the defeat screen.

## Play it

Serve `game/` with any static server and open `game/index.html`, for example:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

## Layout

- `game/index.html` — the page: title screen, table, end screens
- `game/styles.css` — the table, cards and overlays
- `game/src/cards.js` — the four suits and the 24-card deck
- `game/src/engine.js` — turns, resonance, damage, and the Warden's AI
- `game/src/render.js` — draws the engine's state onto the table
- `game/src/main.js` — wiring: buttons, keyboard, demo screens
- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with `vendor/makefun-game.ts`
- `screenshots/` — real renders of the game's own code in Chrome

## License

MIT — see [LICENSE](LICENSE). SPDX-License-Identifier: MIT

---

<sub>Entered on [make.fun](https://make.fun/?ref=6nfavmbn&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
