// Four Winds Duel — the renderer: turns engine state into cards on the table.
// It only reads state and touches the DOM; no game rules live here.

import { SUITS, KINDS, effectiveValue, RESONANCE_BONUS } from './cards.js';
import { hasResonance } from './engine.js';

const $ = (id) => document.getElementById(id);

/** Build one card's DOM node. `opts.playable` marks unaffordable cards grey. */
export function cardNode(card, opts = {}) {
  const suit = SUITS[card.suit];
  const kind = KINDS[card.kind];
  const el = document.createElement('div');
  el.className = `card ${suit.css}`;
  el.dataset.cardId = card.id;
  if (opts.playable === false) el.classList.add('unaffordable');
  if (opts.played) el.classList.add('played');

  const shownValue = effectiveValue(card, opts.resonance === true);
  const valueLine = card.kind === 'insight'
    ? `Draw ${shownValue}`
    : `${kind.verb} ${shownValue}`;
  // The resonance tag shows only on a card already played, where the boost
  // actually happened; in the hand the boosted value itself is the preview.
  const resLine = opts.played && opts.resonance
    ? `<div class="card-text">✦ Resonance +${RESONANCE_BONUS}</div>`
    : '';

  el.innerHTML =
    `<div class="cost">${card.cost}</div>` +
    `<div class="suit-mark" title="${suit.name}">${suit.mark}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-kind">${suit.name} · ${kind.label}</div>` +
    `<div class="card-value">${card.kind === 'insight' ? '＋' + shownValue : shownValue}</div>` +
    `<div class="card-text">${card.text}</div>` +
    resLine +
    (opts.key !== undefined ? `<div class="card-key">${opts.key}</div>` : '');
  el.title = `${card.name} — ${suit.name} ${kind.label}, cost ${card.cost}, ${valueLine}. ${card.text}`;
  return el;
}

/** The back of a card, for the Warden's hidden hand. */
export function cardBackNode() {
  const el = document.createElement('div');
  el.className = 'card back';
  el.textContent = '🌪️';
  el.title = 'Opponent card (hidden)';
  return el;
}

/** Draw the whole table from the current state. */
export function renderAll(state) {
  renderFighter(state, 'you');
  renderFighter(state, 'foe');
  renderPlayed(state);
  renderLog(state);
  renderControls(state);
  renderScreens(state);
}

function renderFighter(state, key) {
  const fighter = state[key];
  const prefix = key === 'you' ? 'you' : 'foe';
  const fill = $(`${prefix}-hp-fill`);
  const text = $(`${prefix}-hp-text`);
  fill.style.width = `${Math.max(0, (fighter.hp / 30) * 100)}%`;
  text.textContent = `${fighter.hp} / 30`;

  const blockRow = $(`${prefix}-block-row`);
  const block = $(`${prefix}-block`);
  blockRow.hidden = fighter.block <= 0;
  block.textContent = String(fighter.block);

  if (key === 'you') $('you-energy').textContent = String(fighter.energy);

  const handEl = $(`${prefix}-hand`);
  handEl.innerHTML = '';
  fighter.hand.forEach((card, i) => {
    if (key === 'foe') {
      handEl.appendChild(cardBackNode());
      return;
    }
    const affordable = fighter.energy >= card.cost && state.phase === 'playing' && state.yourTurn;
    // Preview resonance: a card whose suit you already played this turn shows
    // its boosted value right in your hand, so the combo is a real decision.
    const resonance = hasResonance(state, 'you', card.suit);
    const node = cardNode(card, { playable: affordable, resonance, key: i + 1 });
    node.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('winds:play', { detail: { index: i } }));
    });
    handEl.appendChild(node);
  });
}

function renderPlayed(state) {
  const row = $('played-row');
  row.innerHTML = '';
  if (state.playedThisTurn.length === 0) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = state.phase === 'playing'
      ? 'No cards played yet this turn — play one from your hand.'
      : 'The table waits for the duel to begin.';
    row.appendChild(note);
    return;
  }
  for (const play of state.playedThisTurn.slice(-4)) {
    const node = cardNode(play.card, { played: true, resonance: play.resonance });
    row.appendChild(node);
  }
}

function renderLog(state) {
  const log = $('log');
  log.innerHTML = '';
  for (const line of state.log.slice(-9)) {
    const div = document.createElement('div');
    div.className = line.tone;
    div.textContent = line.text;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;
}

function renderControls(state) {
  const endBtn = $('end-turn');
  endBtn.disabled = !(state.phase === 'playing' && state.yourTurn);
  // The chip lights up once you have played any suit this turn: your next card
  // of that suit resonates, so the table tells you the combo is live.
  const chip = $('resonance-chip');
  chip.hidden = !(state.phase === 'playing' && state.yourTurn && state.playedThisTurn.some((p) => p.by === 'you'));
  const banner = $('turn-banner');
  if (state.phase === 'playing') {
    banner.hidden = false;
    banner.textContent = state.yourTurn
      ? `Your turn — Turn ${state.turn}`
      : 'The Warden is thinking…';
  } else {
    banner.hidden = true;
  }
}

/** Title screen and win/loss screens, shown or hidden by phase. */
function renderScreens(state) {
  $('title-screen').hidden = state.phase !== 'title';
  const end = $('end-screen');
  if (state.phase === 'won' || state.phase === 'lost') {
    end.hidden = false;
    const won = state.phase === 'won';
    $('end-emoji').textContent = won ? '🏆' : '🥀';
    const title = $('end-title');
    title.textContent = won ? 'VICTORY' : 'DEFEAT';
    title.className = won ? 'win' : 'loss';
    $('end-line').textContent = won
      ? 'The Warden bows. The four winds answer to you now.'
      : 'The Warden keeps the winds — this time. Shuffle up and try again.';
    $('end-score').textContent =
      `Final score — You ${state.you.hp} HP · Warden ${state.foe.hp} HP · ${state.turn} turn${state.turn === 1 ? '' : 's'} played.`;
  } else {
    end.hidden = true;
  }
}
