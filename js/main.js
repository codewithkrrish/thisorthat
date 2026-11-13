/* ThisOrThat main — DOM wiring for the would-you-rather deck game.
 *
 * All question data, vote maths and streak logic live in engine.js.
 * This file only renders the deck, handles picks, and keeps history
 * and the best streak in the page.
 */

import {
  CATEGORIES,
  CATEGORY_IDS,
  SITE_URL,
  categoryById,
  questionById,
  questionsForCategory,
  voteSplit,
  buildDeck,
  makePick,
  applySkip,
  resultText,
  drawResultCard,
  loadHistory,
  addHistory,
  saveHistory,
  clearHistoryStorage,
  loadBestStreak,
  saveBestStreak,
  loadCategory,
  saveCategory,
  formatHistoryTime,
} from "./engine.js";

const $ = (id) => document.getElementById(id);

const els = {
  categoryRow: $("category-row"),
  categoryBlurb: $("category-blurb"),
  streakLine: $("streak-line"),
  deckBody: $("deck-body"),
  deckFinished: $("deck-finished"),
  finishedText: $("finished-text"),
  progressLine: $("progress-line"),
  questionCategory: $("question-category"),
  optionA: $("option-a"),
  optionB: $("option-b"),
  optionAText: $("option-a-text"),
  optionBText: $("option-b-text"),
  optionAPick: $("option-a-pick"),
  optionBPick: $("option-b-pick"),
  optionAVote: $("option-a-vote"),
  optionBVote: $("option-b-vote"),
  optionAFill: $("option-a-fill"),
  optionBFill: $("option-b-fill"),
  optionANumber: $("option-a-number"),
  optionBNumber: $("option-b-number"),
  nextBtn: $("next-btn"),
  skipBtn: $("skip-btn"),
  surpriseBtn: $("surprise-btn"),
  reshuffleBtn: $("reshuffle-btn"),
  cardStatus: $("card-status"),
  shareSection: $("share-section"),
  shareText: $("share-text"),
  downloadCardBtn: $("download-card-btn"),
  copyResultBtn: $("copy-result-btn"),
  historySection: $("history-section"),
  historyList: $("history-list"),
  clearHistoryBtn: $("clear-history-btn"),
};

const store = typeof localStorage !== "undefined" ? localStorage : null;

let category = loadCategory(store);
let deck = [];
let index = 0;
let current = null; // current question object
let pick = null; // current pick (from makePick) or null
let streak = 0;
let best = loadBestStreak(store);
let history = loadHistory(store);
let picksThisDeck = 0;

function setStatus(text) {
  els.cardStatus.textContent = text;
}

function renderStreak() {
  els.streakLine.innerHTML = `Streak: <strong>${streak}</strong> &middot; Best: ${best}`;
}

function renderCategoryRow() {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  const def = categoryById(category);
  els.categoryBlurb.textContent = def
    ? `${def.label} — ${def.blurb}`
    : "Every category, shuffled into one deck.";
}

/* --- Deck ----------------------------------------------------------------- */

function newDeckSeed() {
  return (Date.now() % 2147483647) ^ Math.floor(Math.random() * 2147483647);
}

function startDeck(nextCategory, seed) {
  category = nextCategory === "all" || CATEGORIES[nextCategory] ? nextCategory : "all";
  saveCategory(store, category);
  deck = buildDeck(category, seed === undefined ? newDeckSeed() : seed);
  index = 0;
  picksThisDeck = 0;
  renderCategoryRow();
  showCurrent();
}

function showCurrent() {
  els.deckFinished.hidden = true;
  els.deckBody.hidden = false;
  if (index >= deck.length) {
    showFinished();
    return;
  }
  current = questionById(deck[index]);
  pick = null;
  renderQuestion(current);
}

function renderQuestion(question) {
  const cat = categoryById(question.category);
  els.progressLine.textContent = `Question ${index + 1} of ${deck.length}`;
  els.questionCategory.textContent = cat ? cat.label : "";
  els.optionAText.textContent = question.a;
  els.optionBText.textContent = question.b;
  for (const side of ["a", "b"]) {
    const btn = side === "a" ? els.optionA : els.optionB;
    const pickTag = side === "a" ? els.optionAPick : els.optionBPick;
    const vote = side === "a" ? els.optionAVote : els.optionBVote;
    const fill = side === "a" ? els.optionAFill : els.optionBFill;
    btn.classList.remove("picked", "dimmed");
    btn.disabled = false;
    pickTag.hidden = true;
    vote.hidden = true;
    fill.style.width = "0";
    fill.dataset.value = "0";
  }
  els.optionANumber.textContent = "";
  els.optionBNumber.textContent = "";
  els.nextBtn.disabled = true;
  setStatus("");
}

function showFinished() {
  current = null;
  pick = null;
  els.deckBody.hidden = true;
  els.deckFinished.hidden = false;
  const label = category === "all" ? "the full deck" : `the ${categoryById(category).label} deck`;
  els.finishedText.textContent =
    `You played through ${label} — ${picksThisDeck} pick${picksThisDeck === 1 ? "" : "s"} this round, ` +
    `best streak ${best}. Shuffle for a fresh order and go again.`;
}

/* --- Picking --------------------------------------------------------------- */

/* Jump the percentage bars straight to their final widths (used by
 * tests, and by reduced-motion users who asked for no animation). */
export function finishPercentages() {
  if (!pick) return;
  for (const side of ["a", "b"]) {
    const fill = side === "a" ? els.optionAFill : els.optionBFill;
    fill.style.width = `${fill.dataset.value}%`;
  }
}

function renderPick() {
  const split = pick.split;
  for (const side of ["a", "b"]) {
    const btn = side === "a" ? els.optionA : els.optionB;
    const pickTag = side === "a" ? els.optionAPick : els.optionBPick;
    const vote = side === "a" ? els.optionAVote : els.optionBVote;
    const fill = side === "a" ? els.optionAFill : els.optionBFill;
    const number = side === "a" ? els.optionANumber : els.optionBNumber;
    const isPicked = pick.picked === side;
    btn.classList.toggle("picked", isPicked);
    btn.classList.toggle("dimmed", !isPicked);
    btn.disabled = true;
    pickTag.hidden = !isPicked;
    vote.hidden = false;
    number.textContent = `${split[side]}%`;
    fill.dataset.value = String(split[side]);
  }
  const prefersReduced = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    finishPercentages();
  } else {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(finishPercentages);
    });
  }
  els.nextBtn.disabled = false;
  els.shareSection.hidden = false;
  els.shareText.textContent = resultText(pick);
  setStatus("");
}

export function pickOption(side) {
  if (!current || pick) return null; // one pick per question
  if (side !== "a" && side !== "b") return null;
  pick = makePick(current, side, streak, best);
  streak = pick.streak;
  best = pick.best;
  saveBestStreak(store, best);
  picksThisDeck += 1;
  history = addHistory(history, pick);
  saveHistory(store, history);
  renderHistory();
  renderStreak();
  renderPick();
  return pick;
}

export function nextQuestion() {
  if (!pick) return false; // must pick before moving on
  index += 1;
  showCurrent();
  return true;
}

export function skipQuestion() {
  if (!current) return false;
  const reset = applySkip();
  streak = reset.streak;
  renderStreak();
  index += 1;
  showCurrent();
  setStatus("Skipped — streak reset to zero.");
  return true;
}

export function surpriseMe() {
  // A fresh shuffled deck of everything; the category filter resets to All.
  startDeck("all");
  setStatus("Surprise deck shuffled — pick a side.");
}

export function reshuffleDeck() {
  startDeck(category);
  setStatus("Deck shuffled — fresh order, same category.");
}

export function switchCategory(nextCategory) {
  if (nextCategory !== "all" && !CATEGORIES[nextCategory]) return false;
  if (nextCategory === category) return true;
  startDeck(nextCategory);
  return true;
}

/* --- History --------------------------------------------------------------- */

function renderHistory() {
  els.historyList.innerHTML = "";
  els.historySection.hidden = history.length === 0;
  for (const item of history) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    const main = document.createElement("span");
    main.className = "history-main";
    main.textContent = `${item.a} or ${item.b}? — `;
    const pickedEl = document.createElement("span");
    pickedEl.className = "history-pick";
    pickedEl.textContent = `${item.pickedPercent}% picked "${item.pickedText}"`;
    main.append(pickedEl);
    const meta = document.createElement("span");
    meta.className = "history-meta";
    const when = formatHistoryTime(item.time);
    const cat = categoryById(item.category);
    meta.textContent = `${cat ? cat.label : ""}${when ? ` · ${when}` : ""}`;
    btn.append(main, meta);
    btn.addEventListener("click", () => {
      revisitHistory(item);
    });
    li.append(btn);
    els.historyList.append(li);
  }
}

/* Revisit a past pick: rebuild the deck with that question first, in its
 * own category, and show the stored pick. The streak is untouched. */
export function revisitHistory(item) {
  if (!item || !questionById(item.questionId)) return false;
  const rest = buildDeck(item.category, newDeckSeed()).filter((id) => id !== item.questionId);
  category = item.category;
  saveCategory(store, category);
  deck = [item.questionId, ...rest];
  index = 0;
  picksThisDeck = 0;
  renderCategoryRow();
  els.deckFinished.hidden = true;
  els.deckBody.hidden = false;
  current = questionById(deck[0]);
  pick = {
    questionId: item.questionId,
    category: item.category,
    a: item.a,
    b: item.b,
    picked: item.picked,
    pickedText: item.pickedText,
    split: item.split,
    pickedPercent: item.pickedPercent,
    streak,
    best,
  };
  renderQuestion(current);
  renderPick();
  finishPercentages();
  return true;
}

export function clearHistory() {
  history = [];
  clearHistoryStorage(store);
  renderHistory();
  setStatus("History cleared.");
}

/* --- Result card ------------------------------------------------------------ */

function buildCardCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  return canvas;
}

export function renderCard() {
  if (!pick) {
    setStatus("Pick a side first, then download the card.");
    return false;
  }
  const canvas = buildCardCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    setStatus("Card preview is not available in this browser — canvas is not supported here.");
    return false;
  }
  const ok = drawResultCard(ctx, pick);
  if (!ok) {
    setStatus("Could not draw the result card in this browser.");
    return false;
  }
  setStatus("Card ready. Use Download to save it, or Copy to share the result as text.");
  return true;
}

export function downloadCard() {
  if (!pick) {
    setStatus("Pick a side first, then download the card.");
    return Promise.resolve(false);
  }
  const canvas = buildCardCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx || !drawResultCard(ctx, pick)) {
    setStatus("Card download is not supported in this browser — canvas is not available here.");
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("Could not create the card image in this browser.");
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thisorthat-${pick.questionId}.png`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Result card downloaded.");
      resolve(true);
    }, "image/png");
  });
}

async function copyText(text, doneMessage) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(doneMessage);
    return true;
  } catch {
    /* Clipboard API unavailable — fall back to a temporary textarea. */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (ok) {
      setStatus(doneMessage);
      return true;
    }
  } catch {
    /* fall through to the message below */
  }
  setStatus("Copy is not available in this browser — long-press the result to select it.");
  return false;
}

export function copyResultText() {
  if (!pick) {
    setStatus("Pick a side first, then copy the result.");
    return Promise.resolve(false);
  }
  return copyText(resultText(pick), "Result copied to the clipboard.");
}

/* --- Wiring ------------------------------------------------------------------ */

els.categoryRow.addEventListener("click", (event) => {
  const btn = event.target.closest(".category-btn");
  if (!btn) return;
  switchCategory(btn.dataset.category);
});

els.optionA.addEventListener("click", () => pickOption("a"));
els.optionB.addEventListener("click", () => pickOption("b"));
els.nextBtn.addEventListener("click", nextQuestion);
els.skipBtn.addEventListener("click", skipQuestion);
els.surpriseBtn.addEventListener("click", surpriseMe);
els.reshuffleBtn.addEventListener("click", reshuffleDeck);
els.downloadCardBtn.addEventListener("click", downloadCard);
els.copyResultBtn.addEventListener("click", copyResultText);
els.clearHistoryBtn.addEventListener("click", clearHistory);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA"
    || target.tagName === "SELECT")) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key;
  // Enter/Space activate a focused button on their own, so only handle
  // them when focus is not on a button (avoids a double action).
  const onButton = !!(target && target.tagName === "BUTTON");
  if (key === "1" || key === "ArrowLeft") {
    event.preventDefault();
    pickOption("a");
  } else if (key === "2" || key === "ArrowRight") {
    event.preventDefault();
    pickOption("b");
  } else if (key === "n" || key === "N" || (!onButton && (key === "Enter" || key === " "))) {
    event.preventDefault();
    nextQuestion();
  } else if (key === "s" || key === "S") {
    event.preventDefault();
    skipQuestion();
  }
});

/* --- Init -------------------------------------------------------------------- */

renderStreak();
renderHistory();
startDeck(category);

export function getState() {
  return {
    category,
    deck: [...deck],
    index,
    current,
    pick,
    streak,
    best,
    history,
    picksThisDeck,
    finished: index >= deck.length,
  };
}
