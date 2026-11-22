// Four Winds Duel — the entry point: wires buttons, keyboard and the engine together.
// Demo hooks for screenshots and testing live on the query string:
//   ?screen=play   jump straight to a mid-game table
//   ?screen=win    show the victory screen
//   ?screen=loss   show the defeat screen
//   ?selftest=1    auto-play a full duel in the browser and report the result

import { newGame, beginDuel, playCard, endTurn, checkEnd, drawCards } from './engine.js';
import { renderAll } from './render.js';

let state = newGame();

function refresh() {
  renderAll(state);
}

/** Play the card at hand index i, if the rules allow it. */
function tryPlay(index) {
  if (state.phase !== 'playing' || !state.yourTurn) return;
  const result = playCard(state, 'you', index);
  if (result) refresh();
}

/** Start a brand-new duel and show the table. */
function freshDuel() {
  state = newGame();
  beginDuel(state);
  refresh();
}

document.getElementById('start-btn').addEventListener('click', () => {
  beginDuel(state);
  refresh();
});

document.getElementById('again-btn').addEventListener('click', freshDuel);
document.getElementById('restart').addEventListener('click', freshDuel);

document.getElementById('end-turn').addEventListener('click', () => {
  endTurn(state);
  refresh();
});

window.addEventListener('winds:play', (event) => {
  tryPlay(event.detail.index);
});

document.addEventListener('keydown', (event) => {
  if (state.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
    beginDuel(state);
    refresh();
    return;
  }
  if (event.key === 'r' || event.key === 'R') {
    if (state.phase !== 'title') freshDuel();
    return;
  }
  if (state.phase !== 'playing' || !state.yourTurn) return;
  if (event.key === 'Enter') {
    endTurn(state);
    refresh();
    return;
  }
  const n = Number.parseInt(event.key, 10);
  if (n >= 1 && n <= state.you.hand.length) tryPlay(n - 1);
});

/** Set up a mid-game table for a screenshot: some cards already played, HP dented. */
function demoPlay() {
  beginDuel(state);
  state.you.hp = 24;
  state.foe.hp = 19;
  state.you.block = 5;
  state.turn = 3;
  // Open with a strike, then follow with the same suit to show resonance (+2).
  const strikeAt = state.you.hand.findIndex((c) => c.kind === 'strike');
  if (strikeAt >= 0) {
    const suit = state.you.hand[strikeAt].suit;
    playCard(state, 'you', strikeAt);
    const followAt = state.you.hand.findIndex((c) => c.suit === suit);
    if (followAt >= 0 && state.phase === 'playing') playCard(state, 'you', followAt);
  } else {
    playCard(state, 'you', 0);
  }
  // Top the hand back up, so the table shows a full hand of five.
  drawCards(state.you, 2);
  refresh();
}

/** Set up the victory screen: the Warden at 0 HP. */
function demoWin() {
  beginDuel(state);
  state.foe.hp = 0;
  checkEnd(state);
  refresh();
}

/** Set up the defeat screen: you at 0 HP. */
function demoLoss() {
  beginDuel(state);
  state.you.hp = 0;
  checkEnd(state);
  refresh();
}

/**
 * Self-test: play a whole duel with a simple policy (play the first affordable
 * card, then end the turn) and write the outcome into the page, so a headless
 * browser run can prove the game is actually playable end to end.
 */
function selfTest() {
  beginDuel(state);
  let steps = 0;
  while (state.phase === 'playing' && steps < 400) {
    steps += 1;
    if (state.yourTurn) {
      const affordable = state.you.hand.findIndex((c) => c.cost <= state.you.energy);
      if (affordable >= 0) playCard(state, 'you', affordable);
      else endTurn(state);
    }
  }
  refresh();
  const verdict = document.createElement('div');
  verdict.id = 'selftest-result';
  verdict.textContent = `SELFTEST phase=${state.phase} turns=${state.turn} youHp=${state.you.hp} foeHp=${state.foe.hp} steps=${steps}`;
  document.body.appendChild(verdict);
  document.title = verdict.textContent;
}

const params = new URLSearchParams(window.location.search);
if (params.get('selftest') === '1') {
  selfTest();
} else if (params.get('screen') === 'play') {
  demoPlay();
} else if (params.get('screen') === 'win') {
  demoWin();
} else if (params.get('screen') === 'loss') {
  demoLoss();
} else {
  refresh();
}
