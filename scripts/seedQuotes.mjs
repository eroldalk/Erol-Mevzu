// Tek seferlik: yerel QUOTE_BANK'ı Firestore'daki "quotes" koleksiyonuna yükler.
// Çalıştırmadan önce Firebase Console'da Authentication > Email/Password açık olmalı
// ve Users sekmesinden bir kullanıcı oluşturulmuş olmalı (Firestore Rules yazma izni
// için request.auth != null şart koşuyor).
//
// Çalıştırma:
//   node scripts/seedQuotes.mjs
// E-posta/şifreyi ortam değişkeninden okur, yoksa terminalden sorar:
//   MEVZU_ADMIN_EMAIL=... MEVZU_ADMIN_PASSWORD=... node scripts/seedQuotes.mjs

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { QUOTE_BANK } from "../src/utils/constants.js";

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

const email = process.env.MEVZU_ADMIN_EMAIL || (await ask("Firebase e-posta: "));
const password = process.env.MEVZU_ADMIN_PASSWORD || (await ask("Firebase şifre: "));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, email, password);
console.log(`Giriş yapıldı. ${QUOTE_BANK.length} söz yükleniyor...`);

for (const q of QUOTE_BANK) {
  await addDoc(collection(db, "quotes"), q);
  console.log("  +", q.quote.split("\n")[0]);
}

console.log(`Tamam — ${QUOTE_BANK.length} söz Firestore'daki "quotes" koleksiyonuna eklendi.`);
process.exit(0);
