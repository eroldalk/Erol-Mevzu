import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

await page.goto("http://localhost:5174/Erol-Mevzu/", { waitUntil: "networkidle" });
await page.locator('input[autocomplete="username"]').fill("mevzu");
await page.locator('input[autocomplete="current-password"]').fill("123456");
await page.locator('button[type="submit"]').click();
await page.waitForSelector("text=Sürpriz Kart", { timeout: 15000 });
await page.locator("text=Sürpriz Kart").first().click();
await page.waitForSelector("text=Söz aranıyor", { state: "detached", timeout: 15000 }).catch(() => {});
await page.waitForTimeout(500);

async function readKalan() {
  const t = await page.locator("body").innerText();
  const m = t.match(/(\d+)\s*SÖZ KALDI/);
  return m ? m[1] : (t.match(/TUR TAMAMLANDI/) ? "0(tur)" : "?");
}

console.log("baslangic kalan:", await readKalan());

// Sadece karıştır (indirmeden) — sayı SABİT kalmalı
for (let i = 0; i < 3; i++) {
  await page.locator("button", { hasText: "Yeniden Karıştır" }).click();
  await page.waitForTimeout(600);
  console.log(`karistir #${i+1} sonrasi kalan:`, await readKalan());
}

// Şimdi indir — sayı 1 DÜŞMELİ
// İndirme dialogunu engellememek için download event bekleyelim
const [download] = await Promise.all([
  page.waitForEvent("download", { timeout: 10000 }).catch(() => null),
  page.locator("button", { hasText: "İndir" }).click(),
]);
await page.waitForTimeout(800);
console.log("indirme sonrasi kalan:", await readKalan(), "| download event:", !!download);

// Sayfadan çık, tekrar gir — sayı DEĞİŞMEMELİ (indirmedikçe)
await page.locator("button").first().click(); // geri
await page.waitForTimeout(300);
await page.locator("text=Sürpriz Kart").first().click();
await page.waitForSelector("text=Söz aranıyor", { state: "detached", timeout: 15000 }).catch(() => {});
await page.waitForTimeout(500);
console.log("girip-ciktiktan sonra kalan:", await readKalan());

console.log("ERRORS::" + JSON.stringify(errors));
await browser.close();
