/* ThisOrThat engine — pure logic for the would-you-rather deck game.
 *
 * No DOM, no timers, no network here. main.js wires this to the page.
 *
 * The vote percentages are deterministic and playful, not a real poll:
 * each question's split comes from a stable FNV-1a hash of its id, so the
 * same question always shows the same split. The page says so plainly.
 * Nothing here claims to measure what real people would choose.
 */

export const MAX_HISTORY = 8;

export const HISTORY_KEY = "thisorthat:history:v1";
export const BEST_KEY = "thisorthat:best:v1";
export const CATEGORY_KEY = "thisorthat:category:v1";

export const SITE_URL = "https://thisorthat.vercel.app/";

/* --- Categories ---------------------------------------------------------- */

export const CATEGORIES = {
  funny: { id: "funny", label: "Funny", blurb: "Silly choices, serious debate." },
  food: { id: "food", label: "Food", blurb: "Taste buds versus willpower." },
  travel: { id: "travel", label: "Travel", blurb: "Where to, and how to get there." },
  tech: { id: "tech", label: "Tech", blurb: "Gadgets, apps and impossible powers." },
  life: { id: "life", label: "Life", blurb: "Time, money and everyday trade-offs." },
  deep: { id: "deep", label: "Deep", blurb: "The ones you actually think about." },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES);

export function categoryById(id) {
  return CATEGORIES[id] || null;
}

/* --- The question bank --------------------------------------------------- */
/* 72 original questions, 12 per category. Clean and kind by design:
 * no mean, cruel or embarrassing content — every option is a fair,
 * fun trade-off. */

export const QUESTIONS = [
  // Funny
  { id: "funny-01", category: "funny", a: "Always speak in rhymes", b: "Always communicate by interpretive dance" },
  { id: "funny-02", category: "funny", a: "Have a laugh track follow you everywhere", b: "Have a narrator describe everything you do" },
  { id: "funny-03", category: "funny", a: "Fight one horse-sized duck", b: "Fight a hundred duck-sized horses" },
  { id: "funny-04", category: "funny", a: "Sneeze every time you say hello", b: "Burp every time you say goodbye" },
  { id: "funny-05", category: "funny", a: "Wear a clown wig every day", b: "Wear flippers on your hands every day" },
  { id: "funny-06", category: "funny", a: "Have your thoughts broadcast on a speaker", b: "Have your dreams shown on a screen for everyone to see" },
  { id: "funny-07", category: "funny", a: "Be able to talk to animals, but they all insult you", b: "Be able to talk to plants, but they only gossip about you" },
  { id: "funny-08", category: "funny", a: "Always have to hop everywhere", b: "Always have to walk backwards" },
  { id: "funny-09", category: "funny", a: "Have a theme song play whenever you enter a room", b: "Have a spotlight follow you everywhere" },
  { id: "funny-10", category: "funny", a: "Eat a spoonful of wasabi every morning", b: "Take an ice-cold shower every morning" },
  { id: "funny-11", category: "funny", a: "Never be able to whisper again", b: "Never be able to shout again" },
  { id: "funny-12", category: "funny", a: "Have a tiny clone of yourself follow you around", b: "Have a tiny version of your best friend follow you around" },
  // Food
  { id: "food-01", category: "food", a: "Eat only pizza for the rest of your life", b: "Eat only pasta for the rest of your life" },
  { id: "food-02", category: "food", a: "Never eat chocolate again", b: "Never eat ice cream again" },
  { id: "food-03", category: "food", a: "Have every meal be too spicy", b: "Have every meal be completely bland" },
  { id: "food-04", category: "food", a: "Eat breakfast foods for every meal", b: "Eat dessert for every meal" },
  { id: "food-05", category: "food", a: "Always eat with chopsticks", b: "Always eat with your hands" },
  { id: "food-06", category: "food", a: "Drink only water forever", b: "Drink only fizzy drinks forever" },
  { id: "food-07", category: "food", a: "Have a personal chef", b: "Have a personal baker" },
  { id: "food-08", category: "food", a: "Eat a whole lemon", b: "Eat a raw onion like an apple" },
  { id: "food-09", category: "food", a: "Never use salt again", b: "Never use sugar again" },
  { id: "food-10", category: "food", a: "Eat the same meal every day for a year", b: "Never eat the same meal twice for a year" },
  { id: "food-11", category: "food", a: "Have unlimited free takeaway", b: "Have unlimited free fancy restaurant meals" },
  { id: "food-12", category: "food", a: "Be able to eat anything without gaining weight", b: "Be able to cook anything perfectly on the first try" },
  // Travel
  { id: "travel-01", category: "travel", a: "Live on a beach forever", b: "Live in the mountains forever" },
  { id: "travel-02", category: "travel", a: "Travel the world for free, but never stay anywhere more than a week", b: "Travel to one dream place and stay there for a year" },
  { id: "travel-03", category: "travel", a: "Always travel by train", b: "Always travel by boat" },
  { id: "travel-04", category: "travel", a: "Visit space for a day", b: "Explore the deep ocean for a day" },
  { id: "travel-05", category: "travel", a: "Have a free first-class ticket anywhere once a year", b: "Have a free hotel stay anywhere once a month" },
  { id: "travel-06", category: "travel", a: "Never fly again", b: "Never drive again" },
  { id: "travel-07", category: "travel", a: "Live in a different country every year", b: "Live in the same town your whole life but holiday everywhere" },
  { id: "travel-08", category: "travel", a: "Backpack through Europe", b: "Road trip across your own country" },
  { id: "travel-09", category: "travel", a: "Stay in a treehouse", b: "Stay in an underwater hotel" },
  { id: "travel-10", category: "travel", a: "Travel with only a backpack", b: "Travel with five suitcases" },
  { id: "travel-11", category: "travel", a: "Always be the tour guide", b: "Always be the tourist" },
  { id: "travel-12", category: "travel", a: "See the Northern Lights", b: "See a total solar eclipse" },
  // Tech
  { id: "tech-01", category: "tech", a: "Give up your phone for a month", b: "Give up the internet for a month" },
  { id: "tech-02", category: "tech", a: "Have unlimited battery life", b: "Have unlimited data" },
  { id: "tech-03", category: "tech", a: "Be able to teleport anywhere, but only once a day", b: "Be able to fly, but only at walking speed" },
  { id: "tech-04", category: "tech", a: "Have a robot butler", b: "Have a self-driving car" },
  { id: "tech-05", category: "tech", a: "Never use social media again", b: "Never watch videos online again" },
  { id: "tech-06", category: "tech", a: "Have the fastest computer in the world", b: "Have the best camera in the world" },
  { id: "tech-07", category: "tech", a: "Talk to your pet through an app", b: "Have an app that translates any language instantly" },
  { id: "tech-08", category: "tech", a: "Live without a smartphone", b: "Live without a laptop" },
  { id: "tech-09", category: "tech", a: "Have every app you want for free", b: "Have every gadget you want for free" },
  { id: "tech-10", category: "tech", a: "Be a famous streamer", b: "Be a famous app developer" },
  { id: "tech-11", category: "tech", a: "Have Wi-Fi everywhere you go", b: "Have perfect phone signal everywhere you go" },
  { id: "tech-12", category: "tech", a: "Time travel to the past", b: "Time travel to the future" },
  // Life
  { id: "life-01", category: "life", a: "Be rich but always busy", b: "Be comfortable but always free" },
  { id: "life-02", category: "life", a: "Have more time", b: "Have more money" },
  { id: "life-03", category: "life", a: "Always be 10 minutes late", b: "Always be 20 minutes early" },
  { id: "life-04", category: "life", a: "Know the date of your death", b: "Know the cause of your death" },
  { id: "life-05", category: "life", a: "Be able to pause time", b: "Be able to rewind time by 10 seconds" },
  { id: "life-06", category: "life", a: "Live without music", b: "Live without movies" },
  { id: "life-07", category: "life", a: "Have a photographic memory", b: "Be able to forget anything on purpose" },
  { id: "life-08", category: "life", a: "Always know when someone is lying", b: "Always get away with lying" },
  { id: "life-09", category: "life", a: "Be the funniest person in the room", b: "Be the smartest person in the room" },
  { id: "life-10", category: "life", a: "Never have to sleep", b: "Never have to eat" },
  { id: "life-11", category: "life", a: "Live 100 years in the past", b: "Live 100 years in the future" },
  { id: "life-12", category: "life", a: "Have a rewind button for your life", b: "Have a pause button for your life" },
  // Deep
  { id: "deep-01", category: "deep", a: "Know all the answers", b: "Know all the questions" },
  { id: "deep-02", category: "deep", a: "Be remembered for kindness", b: "Be remembered for brilliance" },
  { id: "deep-03", category: "deep", a: "Change one decision from your past", b: "See one moment from your future" },
  { id: "deep-04", category: "deep", a: "Live a life with no regrets", b: "Live a life with no fears" },
  { id: "deep-05", category: "deep", a: "Always tell the truth", b: "Always be kind" },
  { id: "deep-06", category: "deep", a: "Have world peace for a day", b: "End hunger for a day" },
  { id: "deep-07", category: "deep", a: "Be able to heal anyone", b: "Be able to bring back one memory for anyone" },
  { id: "deep-08", category: "deep", a: "Know what happens after this life", b: "Know how the universe began" },
  { id: "deep-09", category: "deep", a: "Give up your favourite memory", b: "Give up your favourite possession" },
  { id: "deep-10", category: "deep", a: "Be able to speak every language", b: "Be able to play every instrument" },
  { id: "deep-11", category: "deep", a: "Live in a world without lies", b: "Live in a world without secrets" },
  { id: "deep-12", category: "deep", a: "Trade lives with a stranger for a day", b: "Trade lives with your best friend for a day" },
];

export function questionById(id) {
  return QUESTIONS.find((q) => q.id === id) || null;
}

export function questionsForCategory(categoryId) {
  if (!categoryId || categoryId === "all") return [...QUESTIONS];
  if (!CATEGORIES[categoryId]) return [...QUESTIONS]; // unknown category falls back to All
  return QUESTIONS.filter((q) => q.category === categoryId);
}

/* --- Deterministic hash + vote split ------------------------------------- */

/* FNV-1a, 32-bit, over the question id. The split is a function of the
 * id alone, so the same question always shows the same percentages. */
export function hashQuestion(id) {
  const input = String(id || "");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/* Vote split for a question: { a, b } summing to 100. Each side stays in
 * the plausible 8–92 range and the split is never exactly 50/50 — a
 * dead heat is boring, and a real poll never lands on it either.
 * A hash that lands on 50 is nudged to 49 or 51 by a second hash bit. */
export function voteSplit(questionId) {
  const hash = hashQuestion(questionId);
  let a = 8 + (hash % 85); // 8..92
  if (a === 50) a = ((hash >>> 8) % 2 === 0) ? 49 : 51;
  return { a, b: 100 - a };
}

export function splitForSide(split, side) {
  return side === "a" ? split.a : split.b;
}

/* --- Seeded shuffle ------------------------------------------------------- */

/* mulberry32 — small, fast, deterministic PRNG. */
export function seededRandom(seed) {
  let state = (Number(seed) || 0) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Fisher–Yates with a seeded PRNG. Returns a new array; same seed +
 * same input always gives the same order, different seeds differ. */
export function shuffleDeck(list, seed) {
  const out = [...list];
  const rand = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* Build a shuffled deck of question ids for a category (or all).
 * Unknown categories fall back to All; an explicit seed makes the
 * order reproducible. */
export function buildDeck(categoryId, seed) {
  const pool = questionsForCategory(categoryId);
  return shuffleDeck(pool.map((q) => q.id), seed);
}

/* --- Streak ---------------------------------------------------------------- */

export function applyPick(streak, best) {
  const next = (Number(streak) || 0) + 1;
  return { streak: next, best: Math.max(Number(best) || 0, next) };
}

export function applySkip() {
  return { streak: 0 };
}

/* --- A pick: question + choice + split + streak --------------------------- */

export function makePick(question, side, streak, best) {
  if (!question || (side !== "a" && side !== "b")) return null;
  const split = voteSplit(question.id);
  const nextStreak = applyPick(streak, best);
  return {
    questionId: question.id,
    category: question.category,
    a: question.a,
    b: question.b,
    picked: side,
    pickedText: side === "a" ? question.a : question.b,
    split,
    pickedPercent: splitForSide(split, side),
    streak: nextStreak.streak,
    best: nextStreak.best,
  };
}

/* --- Share text + result card ---------------------------------------------- */

export function resultText(pick) {
  if (!pick) return "";
  return (
    `Would you rather ${pick.a} or ${pick.b}? ` +
    `I picked "${pick.pickedText}" — the fun vote says ${pick.pickedPercent}% agree. ` +
    `My streak: ${pick.streak}. Play at ${SITE_URL}`
  );
}

export function cardData(pick) {
  if (!pick) return null;
  const category = categoryById(pick.category);
  return {
    width: 1080,
    height: 1350,
    question: "Would you rather…",
    a: pick.a,
    b: pick.b,
    picked: pick.picked,
    split: pick.split,
    streak: pick.streak,
    best: pick.best,
    categoryLabel: category ? category.label : "This or That",
    url: SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    disclaimer: "Just for fun — the percentages are playful, not a real poll.",
  };
}

/* Draw the shareable result card onto an injected 2d context (canvas is
 * injected so tests can use a recording stub). Returns false when there
 * is no usable context. */
export function drawResultCard(ctx, pick) {
  const data = cardData(pick);
  if (!data || !ctx || typeof ctx.fillRect !== "function") return false;
  const W = data.width;
  const H = data.height;
  const ACCENT = "#E5484D";

  ctx.fillStyle = "#0B0B0F";
  ctx.fillRect(0, 0, W, H);

  // Top accent bar and brand.
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, W, 10);
  ctx.fillStyle = "#F5F5F7";
  ctx.font = "700 44px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("THISORTHAT", W / 2, 96);
  ctx.fillStyle = "#9A9AA5";
  ctx.font = "400 30px Inter, sans-serif";
  ctx.fillText(`${data.categoryLabel} · Would you rather`, W / 2, 146);

  // Question line.
  ctx.fillStyle = "#F5F5F7";
  ctx.font = "700 58px Inter, sans-serif";
  ctx.fillText(data.question, W / 2, 236);

  // Two option boxes. The picked one gets the accent border + tag.
  const boxY = [330, 600];
  const sides = ["a", "b"];
  sides.forEach((side, i) => {
    const y = boxY[i];
    const isPicked = data.picked === side;
    ctx.fillStyle = "#121218";
    ctx.fillRect(100, y, 880, 200);
    ctx.strokeStyle = isPicked ? ACCENT : "#23232E";
    ctx.lineWidth = isPicked ? 5 : 2;
    ctx.strokeRect(100, y, 880, 200);
    ctx.fillStyle = isPicked ? ACCENT : "#9A9AA5";
    ctx.font = "700 30px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(isPicked ? "YOUR PICK" : (side === "a" ? "OPTION A" : "OPTION B"), 140, y + 52);
    ctx.fillStyle = "#F5F5F7";
    ctx.font = "700 44px Inter, sans-serif";
    wrapText(ctx, data[side], 140, y + 116, 800, 56, "left");
    ctx.fillStyle = isPicked ? "#F5F5F7" : "#9A9AA5";
    ctx.font = "800 52px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${data.split[side]}%`, 940, y + 52);
    ctx.textAlign = "left";
  });

  // Vote bars.
  let barY = 880;
  ctx.textAlign = "left";
  for (const side of sides) {
    ctx.fillStyle = "#9A9AA5";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText(side === "a" ? "Option A" : "Option B", 100, barY);
    ctx.fillStyle = "#F5F5F7";
    ctx.textAlign = "right";
    ctx.fillText(`${data.split[side]}%`, 980, barY);
    ctx.textAlign = "left";
    ctx.fillStyle = "#23232E";
    ctx.fillRect(100, barY + 14, 880, 14);
    ctx.fillStyle = side === data.picked ? ACCENT : "#5A5A66";
    ctx.fillRect(100, barY + 14, Math.round(880 * (data.split[side] / 100)), 14);
    barY += 76;
  }

  // Streak line.
  ctx.fillStyle = "#D8D8DE";
  ctx.font = "400 32px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Streak: ${data.streak}  ·  Best: ${data.best}`, W / 2, 1110);

  // Footer — stacked with clear gaps so nothing overlaps the bars.
  ctx.fillStyle = "#D8D8DE";
  ctx.font = "400 28px Inter, sans-serif";
  ctx.fillText("Would you rather… play again?", W / 2, 1200);
  ctx.fillStyle = "#F5F5F7";
  ctx.font = "700 34px Inter, sans-serif";
  ctx.fillText("thisorthat.vercel.app", W / 2, 1252);
  ctx.fillStyle = "#9A9AA5";
  ctx.font = "400 26px Inter, sans-serif";
  ctx.fillText(data.disclaimer, W / 2, 1298);
  return true;
}

/* Simple word-wrap for canvas text. align is "center" or "left". */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, align = "center") {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

/* --- Storage helpers (injectable storage so tests can stub it) ----------- */

function safeGet(storage, key) {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    if (storage) storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(storage, key) {
  try {
    if (storage) storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* --- History (localStorage, last 8 picks) ---------------------------------- */

export function validateHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const question = questionById(item.questionId);
    if (!question) continue;
    if (item.picked !== "a" && item.picked !== "b") continue;
    const split = voteSplit(question.id);
    out.push({
      questionId: question.id,
      category: question.category,
      a: question.a,
      b: question.b,
      picked: item.picked,
      pickedText: item.picked === "a" ? question.a : question.b,
      split,
      pickedPercent: splitForSide(split, item.picked),
      time: typeof item.time === "string" ? item.time : "",
    });
    if (out.length >= MAX_HISTORY) break;
  }
  return out;
}

export function loadHistory(storage) {
  const raw = safeGet(storage, HISTORY_KEY);
  if (!raw) return [];
  try {
    return validateHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function addHistory(history, pick, at = new Date()) {
  if (!pick) return history;
  const item = {
    questionId: pick.questionId,
    category: pick.category,
    a: pick.a,
    b: pick.b,
    picked: pick.picked,
    pickedText: pick.pickedText,
    split: pick.split,
    pickedPercent: pick.pickedPercent,
    time: at instanceof Date ? at.toISOString() : String(at),
  };
  const rest = history.filter((h) => h.questionId !== item.questionId);
  return [item, ...rest].slice(0, MAX_HISTORY);
}

export function saveHistory(storage, history) {
  return safeSet(storage, HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function clearHistoryStorage(storage) {
  safeRemove(storage, HISTORY_KEY);
}

/* --- Best streak persistence ------------------------------------------------ */

export function loadBestStreak(storage) {
  const raw = safeGet(storage, BEST_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function saveBestStreak(storage, best) {
  return safeSet(storage, BEST_KEY, String(Math.max(0, Math.floor(Number(best) || 0))));
}

/* --- Category persistence --------------------------------------------------- */

export function loadCategory(storage) {
  const raw = safeGet(storage, CATEGORY_KEY);
  if (raw === "all" || CATEGORIES[raw]) return raw;
  return "all";
}

export function saveCategory(storage, categoryId) {
  return safeSet(storage, CATEGORY_KEY, categoryId === "all" || CATEGORIES[categoryId] ? categoryId : "all");
}

export function formatHistoryTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
