# ThisOrThat — Would You Rather? Pick a Side

Two options, one choice, no wrong answers. Pick a category, tap the side
you would choose, and ThisOrThat shows you the fun vote split and keeps
your streak going. It is a bit of fun for ice-breakers, group chats and
friendly arguments — nothing more than that.

Live at https://thisorthat.vercel.app/

## What it does

- **72 would-you-rather questions, six categories** — Funny, Food, Travel,
  Tech, Life and Deep, twelve original questions each. Pick All for the
  full shuffled deck, or one category for a focused round.
- **Tap to choose** — the option you pick highlights, the other dims, and
  the vote percentages animate in for both sides.
- **Fun vote percentages** — each question's split is deterministic: the
  same question always shows the same numbers, because the split comes
  from a stable hash of the question itself. The splits are playful, not
  a real poll — there is no database of real votes behind them.
- **Streak counter** — every pick in a row grows your streak; skipping a
  question resets it to zero. Your best streak is saved in this browser.
- **Deck progress and a finish state** — "Question X of Y" as you play,
  then a deck-finished screen with a shuffle-and-play-again button.
- **Surprise me** — shuffles a fresh deck of everything when you cannot
  decide what to play.
- **Shareable result card** — a 1080×1350 PNG drawn on a canvas (question,
  both options, your pick marked, vote percentages, streak, site URL)
  with a download button, plus a copy-result-text button.
- **Recent picks** — your last 8 picks are kept in local storage; tap one
  to see that question again.
- **Keyboard friendly** — 1 or left arrow picks the first option, 2 or
  right arrow the second, N or Enter moves on, S skips.

## The honest part

The percentages are made up in the nicest possible way: they are derived
from a hash of each question, so they are stable and shareable, but they
are not survey results and they do not measure what real people would
choose. A lopsided split does not mean your choice is unpopular, and a
close split does not mean it is a hard call. If you want a real vote,
ask your friends — that is half the fun of this game anyway.

## Privacy

Everything runs in your browser. Your picks, your streak, your best
streak and your history are stored in this browser's local storage and
never leave your device. There is no server, no analytics and no account.
Clearing your browser data clears everything.

## How it is built

100% browser-side, no dependencies, no build step. Vanilla JavaScript ES
modules:

- `js/engine.js` — the pure logic: the 72-question bank, category
  filtering, the FNV-1a hash and vote-split maths, the seeded shuffle,
  streak logic, share text, the canvas card drawing, and local-storage
  helpers. No DOM in here, so it is easy to test.
- `js/main.js` — the DOM wiring: deck rendering, pick flow, keyboard
  shortcuts, history rendering, card download and copy.
- `index.html`, `styles.css`, `favicon.svg` — the page itself.

Open `index.html` in a browser (or serve the folder with any static server)
and it just works.

## Limits I know about

- The vote percentages are playful, not real poll data — see "The honest
  part" above.
- The result card is drawn on a canvas, so very old browsers without canvas
  support cannot download it; the button says so instead of failing
  silently.
- Your streak, best streak, history and last category live in local
  storage, so they do not follow you to another browser or device.
- The deck is 72 questions, so a full All-deck run is long by design —
  categories exist for shorter rounds.
