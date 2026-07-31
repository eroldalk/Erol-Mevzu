import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { QUOTE_BANK } from "./constants";

const USED_KEY = "mevzu_used_quotes";
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

function getUsed() {
  try { return JSON.parse(localStorage.getItem(USED_KEY) || "[]"); } catch { return []; }
}

// Sayfayı açmak / "Yeniden Karıştır" bir sözü tüketmez — sadece görüntüler.
// Bir söz yalnızca gerçekten indirildiğinde (markQuoteUsed) havuzdan düşer.
export function markQuoteUsed(quote) {
  const used = getUsed();
  const next = used.includes(quote.id) ? used : [...used, quote.id];
  const poolSize = quote.poolTotal || next.length;
  // Havuzun tamamı indirildiyse listeyi sıfırla, yeni bir tur başlasın.
  localStorage.setItem(USED_KEY, JSON.stringify(next.length >= poolSize ? [] : next));
}

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
  const used = getUsed();
  const available = pool.filter((q) => !used.includes(q.id));
  const source = available.length > 0 ? available : pool;
  const chosen = source[Math.floor(Math.random() * source.length)];
  addToHistory(chosen);
  return { ...chosen, poolTotal: pool.length, poolRemaining: available.length };
}
