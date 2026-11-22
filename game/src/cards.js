// Four Winds Duel — the cards: four original suits, four card kinds, one deck.
// Suits are told apart by colour AND by their mark, never by text alone.

export const SUITS = {
  ember: { name: 'Ember', mark: '🔥', css: 'suit-ember' },
  tide:  { name: 'Tide',  mark: '💧', css: 'suit-tide'  },
  thorn: { name: 'Thorn', mark: '🌿', css: 'suit-thorn' },
  gale:  { name: 'Gale',  mark: '🌪️', css: 'suit-gale'  },
};

export const KINDS = {
  strike:  { label: 'Strike',  verb: 'deals' },
  ward:    { label: 'Ward',    verb: 'blocks' },
  mend:    { label: 'Mend',    verb: 'heals' },
  insight: { label: 'Insight', verb: 'draws' },
};

// One card definition: a unique id, its suit, its kind, its cost and its base value.
// The deck below is the full 24-card set; a duel shuffles two copies of nothing —
// each card is unique, so every hand is a fresh mix of the four winds.
const CARD_DEFS = [
  // Ember — the aggressive suit: cheap, hard-hitting strikes.
  { id: 'ember-spark',   suit: 'ember', kind: 'strike', cost: 1, value: 4, name: 'Spark Snap',    text: 'A quick ember crack.' },
  { id: 'ember-flare',   suit: 'ember', kind: 'strike', cost: 2, value: 7, name: 'Flare Burst',   text: 'Fire blooms outward.' },
  { id: 'ember-inferno', suit: 'ember', kind: 'strike', cost: 3, value: 11, name: 'Inferno Roar', text: 'The whole hearth, at once.' },
  { id: 'ember-ash',     suit: 'ember', kind: 'ward',   cost: 1, value: 4, name: 'Ash Veil',      text: 'Ash swallows the blow.' },
  { id: 'ember-coal',    suit: 'ember', kind: 'mend',   cost: 2, value: 5, name: 'Coal Heart',    text: 'Warmth knits the wound.' },
  { id: 'ember-cinder',  suit: 'ember', kind: 'insight', cost: 1, value: 1, name: 'Cinder Read',  text: 'Draw 1 card.' },

  // Tide — the steady suit: balanced strikes and the best wards.
  { id: 'tide-ripple',   suit: 'tide', kind: 'strike', cost: 1, value: 3, name: 'Ripple Cut',    text: 'Water finds the gap.' },
  { id: 'tide-surge',    suit: 'tide', kind: 'strike', cost: 2, value: 6, name: 'Surge Crash',   text: 'A wave with weight.' },
  { id: 'tide-maelstrom',suit: 'tide', kind: 'strike', cost: 3, value: 10, name: 'Maelstrom',     text: 'The sea turns over.' },
  { id: 'tide-mist',     suit: 'tide', kind: 'ward',   cost: 1, value: 5, name: 'Mist Wall',     text: 'Blows lose their way.' },
  { id: 'tide-spring',   suit: 'tide', kind: 'mend',   cost: 2, value: 6, name: 'Spring Water',  text: 'Clear water, clean wounds.' },
  { id: 'tide-current',  suit: 'tide', kind: 'insight', cost: 1, value: 2, name: 'Read Currents', text: 'Draw 2 cards.' },

  // Thorn — the tricky suit: cheap tricks and the strongest heal.
  { id: 'thorn-thistle', suit: 'thorn', kind: 'strike', cost: 1, value: 3, name: 'Thistle Jab',  text: 'Small, sharp, unfair.' },
  { id: 'thorn-briar',   suit: 'thorn', kind: 'strike', cost: 2, value: 6, name: 'Briar Lash',   text: 'Vines answer back.' },
  { id: 'thorn-overgrowth', suit: 'thorn', kind: 'strike', cost: 3, value: 9, name: 'Overgrowth', text: 'The forest takes its due.' },
  { id: 'thorn-bark',    suit: 'thorn', kind: 'ward',   cost: 2, value: 8, name: 'Bark Plate',   text: 'Old wood, hard as stone.' },
  { id: 'thorn-bloom',   suit: 'thorn', kind: 'mend',   cost: 1, value: 4, name: 'Bloom Mend',   text: 'Petals close the cut.' },
  { id: 'thorn-seed',    suit: 'thorn', kind: 'insight', cost: 1, value: 1, name: 'Seed Thought', text: 'Draw 1 card.' },

  // Gale — the swift suit: big strikes and the deepest draw.
  { id: 'gale-gust',     suit: 'gale', kind: 'strike', cost: 1, value: 4, name: 'Gust Slash',    text: 'Wind with an edge.' },
  { id: 'gale-tempest',  suit: 'gale', kind: 'strike', cost: 2, value: 7, name: 'Tempest Howl',  text: 'The sky shouts back.' },
  { id: 'gale-cyclone',  suit: 'gale', kind: 'strike', cost: 3, value: 12, name: 'Cyclone Eye',  text: 'Everything spins in.' },
  { id: 'gale-draft',    suit: 'gale', kind: 'ward',   cost: 1, value: 3, name: 'Draft Dodge',   text: 'Step aside on the wind.' },
  { id: 'gale-breeze',   suit: 'gale', kind: 'mend',   cost: 1, value: 3, name: 'Cool Breeze',   text: 'A breath, and steadier.' },
  { id: 'gale-omen',     suit: 'gale', kind: 'insight', cost: 2, value: 3, name: 'Storm Omen',    text: 'Draw 3 cards.' },
];

/** The bonus a resonating card gains: +2 to its value. */
export const RESONANCE_BONUS = 2;

/** A fresh, shuffled copy of the full deck (new card objects, so play never mutates the definitions). */
export function buildDeck() {
  const deck = CARD_DEFS.map((d) => ({ ...d }));
  shuffle(deck);
  return deck;
}

/** Fisher–Yates shuffle, in place. */
export function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

/** The display value of a card: its base value, plus the resonance bonus when it applies. */
export function effectiveValue(card, resonance) {
  return card.value + (resonance ? RESONANCE_BONUS : 0);
}

/** One-line summary of a card, for the log. */
export function describeCard(card, value) {
  const suit = SUITS[card.suit];
  const kind = KINDS[card.kind];
  return `${suit.mark} ${card.name} (${kind.label} ${value})`;
}
