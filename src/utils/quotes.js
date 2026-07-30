import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { QUOTE_BANK } from "./constants";

const SHOWN_KEY = "mevzu_shown_quotes";
const HISTORY_KEY = "mevzu_quote_history";
const HISTORY_LIMIT = 200;

let poolPromise = null;

// Firestore'daki "quotes" koleksiyonunu bir kere çeker ve önbelleğe alır.
// Koleksiyon boşsa veya erişilemezse (henüz doldurulmadıysa, offline vb.)
// yerel QUOTE_BANK'a düşer — uygulama her koşulda çalışır.
async function loadPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      try {
        const snap = await getDocs(collection(db, "quotes"));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch { /* Firestore'a ulaşılamadı, yerel bankaya düş */ }
      return QUOTE_BANK.map((q, i) => ({ id: `local-${i}`, ...q }));
    })();
  }
  return poolPromise;
}

function getShown() {
  try { return JSON.parse(localStorage.getItem(SHOWN_KEY) || "[]"); } catch { return []; }
}

function markShown(id, poolSize) {
  const shown = getShown();
  const next = shown.includes(id) ? shown : [...shown, id];
  // Havuzun tamamı gösterildiyse listeyi sıfırla, döngü baştan başlasın.
  localStorage.setItem(SHOWN_KEY, JSON.stringify(next.length >= poolSize ? [] : next));
}

// Turlar sıfırlansa bile hiç silinmeyen, kalıcı "daha önce çıkan sözler" kaydı.
function addToHistory(quote) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const entry = { id: quote.id, quote: quote.quote, author: quote.author, cat: quote.cat, date: new Date().toISOString() };
    const next = [entry, ...history].slice(0, HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* localStorage yoksa geçmiş tutulamaz, akışı bozmasın */ }
}

export function getQuoteHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export async function getRandomQuote() {
  const pool = await loadPool();
  const shown = getShown();
  const available = pool.filter((q) => !shown.includes(q.id));
  // Havuzun tamamı gösterildiyse bu turda yeni bir döngü başlar.
  const turHavuzu = available.length > 0 ? available : pool;
  const chosen = turHavuzu[Math.floor(Math.random() * turHavuzu.length)];
  markShown(chosen.id, pool.length);
  addToHistory(chosen);
  return { ...chosen, poolTotal: pool.length, poolRemaining: turHavuzu.length - 1 };
}
