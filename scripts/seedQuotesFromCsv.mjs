// Tek seferlik: scripts/quotes-batch1.csv dosyasındaki sözleri Firestore'daki
// "quotes" koleksiyonuna EKLER (mevcut sözlerin üzerine yazmaz).
// CSV kolonları: quote, author, cat
//
// Çalıştırmadan önce Firebase Console'da Authentication > Email/Password açık olmalı
// ve Users sekmesinden bir kullanıcı oluşturulmuş olmalı (Firestore Rules yazma izni
// için request.auth != null şart koşuyor).
//
// Çalıştırma:
//   node scripts/seedQuotesFromCsv.mjs
// E-posta/şifreyi ortam değişkeninden okur, yoksa terminalden sorar:
//   MEVZU_ADMIN_EMAIL=... MEVZU_ADMIN_PASSWORD=... node scripts/seedQuotesFromCsv.mjs

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

const firebaseConfig = {
  apiKey: "AIzaSyBSpkgsgmaQxStwbXT_Ne3kW98BjJjaNHI",
  authDomain: "mevzuv1.firebaseapp.com",
  projectId: "mevzuv1",
  storageBucket: "mevzuv1.firebasestorage.app",
  messagingSenderId: "840585016949",
  appId: "1:840585016949:web:5191ddc8323b5aa2492a3c",
};

async function ask(question) {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

const csvPath = new URL("./quotes-batch1.csv", import.meta.url);
const csvContent = await readFile(csvPath, "utf-8");
const rows = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
const quotes = rows.map((r) => ({ quote: r.quote, author: r.author, cat: r.cat }));

const email = process.env.MEVZU_ADMIN_EMAIL || (await ask("Firebase e-posta: "));
const password = process.env.MEVZU_ADMIN_PASSWORD || (await ask("Firebase şifre: "));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, email, password);
console.log(`Giriş yapıldı. ${quotes.length} söz ekleniyor...`);

for (const q of quotes) {
  await addDoc(collection(db, "quotes"), q);
  console.log("  +", q.quote.split("\n")[0]);
}

console.log(`Tamam — ${quotes.length} söz Firestore'daki "quotes" koleksiyonuna eklendi.`);
process.exit(0);
