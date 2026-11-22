// Four Winds Duel — the engine: state, turns, resonance, damage and the Warden's brain.
// No DOM here: the engine is pure game logic, and render.js draws whatever it says.

import { buildDeck, effectiveValue, describeCard, shuffle } from './cards.js';

export const MAX_HP = 30;
export const MAX_ENERGY = 3;
export const HAND_LIMIT = 7;
export const START_HAND = 5;

/** A fresh duel. Both sides draw 5; you move first. */
export function newGame() {
  const state = {
    phase: 'title', // title | playing | won | lost
    turn: 1,
    yourTurn: true,
    you: freshFighter(),
    foe: freshFighter(),
    playedThisTurn: [],
    log: [],
    winner: null,
  };
  state.you.deck = buildDeck();
  state.foe.deck = buildDeck();
  drawCards(state.you, START_HAND);
  drawCards(state.foe, START_HAND);
  return state;
}

function freshFighter() {
  return { hp: MAX_HP, block: 0, energy: MAX_ENERGY, hand: [], deck: [], discard: [] };
}

/** Draw n cards (reshuffle the discard pile when the deck runs dry). */
export function drawCards(fighter, n) {
  for (let i = 0; i < n; i++) {
    if (fighter.hand.length >= HAND_LIMIT) break;
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) break;
      fighter.deck = fighter.discard;
      fighter.discard = [];
      // A reshuffled pile is shuffled again, so the next draw stays honest.
      shuffle(fighter.deck);
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

/** Has this fighter already played this suit this turn? That is resonance. */
export function hasResonance(state, fighterKey, suit) {
  return state.playedThisTurn.some(
    (p) => p.by === fighterKey && p.card.suit === suit,
  );
}

/** Can the fighter afford this card right now? */
export function canPlay(state, fighterKey, card) {
  const fighter = state[fighterKey];
  return (
    state.phase === 'playing' &&
    state.yourTurn === (fighterKey === 'you') &&
    fighter.energy >= card.cost
  );
}

/**
 * Play a card from a fighter's hand. Returns a record of what happened, or null
 * when the play is illegal. Damage eats block first, then HP; Mends heal up to
 * the cap; Insights draw. A second card of the same suit in one turn resonates (+2).
 */
export function playCard(state, fighterKey, handIndex) {
  const fighter = state[fighterKey];
  const foe = fighterKey === 'you' ? state.foe : state.you;
  const card = fighter.hand[handIndex];
  if (!card || !canPlay(state, fighterKey, card)) return null;

  const resonance = hasResonance(state, fighterKey, card.suit);
  const value = effectiveValue(card, resonance);
  fighter.energy -= card.cost;
  fighter.hand.splice(handIndex, 1);
  fighter.discard.push(card);
  state.playedThisTurn.push({ by: fighterKey, card, value, resonance });

  let note = '';
  if (card.kind === 'strike') {
    const blocked = Math.min(foe.block, value);
    foe.block -= blocked;
    foe.hp = Math.max(0, foe.hp - (value - blocked));
    note = blocked > 0
      ? `hits for ${value - blocked} (${blocked} blocked)`
      : `hits for ${value}`;
  } else if (card.kind === 'ward') {
    fighter.block += value;
    note = `gains ${value} block`;
  } else if (card.kind === 'mend') {
    const healed = Math.min(MAX_HP - fighter.hp, value);
    fighter.hp += healed;
    note = `heals ${healed}`;
  } else if (card.kind === 'insight') {
    drawCards(fighter, value);
    note = `draws ${value}`;
  }

  const who = fighterKey === 'you' ? 'You' : 'The Warden';
  const res = resonance ? ' — Resonance +2!' : '';
  addLog(state, `${who} play ${describeCard(card, value)}: ${note}.${res}`, fighterKey === 'you' ? 'good' : 'bad');

  checkEnd(state);
  return { card, value, resonance, note };
}

/** Is the duel over? Sets phase to 'won' or 'lost' and records the winner. */
export function checkEnd(state) {
  if (state.phase !== 'playing') return;
  if (state.foe.hp <= 0) {
    state.phase = 'won';
    state.winner = 'you';
    addLog(state, 'The Warden falls. The four winds are yours!', 'good');
  } else if (state.you.hp <= 0) {
    state.phase = 'lost';
    state.winner = 'foe';
    addLog(state, 'Your HP is gone. The Warden keeps the winds.', 'bad');
  }
}

/** End your turn: the Warden takes theirs, then a fresh turn begins for you. */
export function endTurn(state) {
  if (state.phase !== 'playing' || !state.yourTurn) return;
  state.yourTurn = false;
  state.playedThisTurn = [];
  addLog(state, '— The Warden takes the table —', 'info');
  runFoeTurn(state);
  if (state.phase !== 'playing') return;
  startYourTurn(state);
}

/** A fresh turn for you: energy back, a card drawn, block fades. */
export function startYourTurn(state) {
  state.turn += 1;
  state.yourTurn = true;
  state.playedThisTurn = [];
  state.you.energy = MAX_ENERGY;
  // Block is a one-turn shield, so it clears when a new turn starts.
  state.you.block = 0;
  state.foe.block = 0;
  drawCards(state.you, 1);
  addLog(state, `— Turn ${state.turn}: your move —`, 'info');
}

/** The Warden's turn: a greedy brain with two readable habits. */
export function runFoeTurn(state) {
  const foe = state.foe;
  foe.energy = MAX_ENERGY;
  drawCards(foe, 1);
  state.playedThisTurn = [];

  // Habit 1: hurt and low on HP? Mend first, while it can afford it.
  // Habit 2: otherwise strike with the biggest affordable card, ward when weak.
  let guard = 0;
  while (foe.energy > 0 && guard < 12) {
    guard += 1;
    const pick = chooseFoeCard(state);
    if (pick === null) break;
    playCard(state, 'foe', pick);
    if (state.phase !== 'playing') return;
  }
  addLog(state, 'The Warden ends its turn.', 'info');
}

/**
 * Pick the Warden's next card. Healing wins when HP is low, a ward wins when the
 * player is about to hit hard, otherwise the biggest affordable strike — and a
 * second card of a suit already played this turn is worth more, so the Warden
 * chases resonance just like you do.
 */
export function chooseFoeCard(state) {
  const foe = state.foe;
  const affordable = foe.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => card.cost <= foe.energy);
  if (affordable.length === 0) return null;

  const scored = affordable.map(({ card, index }) => {
    let score = card.value * 2 - card.cost;
    if (hasResonance(state, 'foe', card.suit)) score += 5;
    if (card.kind === 'mend' && foe.hp <= 12) score += 14;
    if (card.kind === 'mend' && foe.hp >= MAX_HP - 2) score -= 20;
    if (card.kind === 'ward' && state.you.hand.length >= 4) score += 6;
    if (card.kind === 'insight' && foe.hand.length <= 2) score += 5;
    if (card.kind === 'strike') score += 3;
    return { index, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Never play a card that scores terribly: stop the turn instead.
  if (scored[0].score < 0) return null;
  return scored[0].index;
}

/** Append a line to the duel log (newest last, capped so it never grows forever). */
export function addLog(state, text, tone = 'info') {
  state.log.push({ text, tone });
  if (state.log.length > 60) state.log.splice(0, state.log.length - 60);
}

/** Start a duel from the title screen. */
export function beginDuel(state) {
  state.phase = 'playing';
  state.yourTurn = true;
  state.turn = 1;
  state.you.energy = MAX_ENERGY;
  addLog(state, 'The duel begins. Your move — play a card!', 'info');
}
