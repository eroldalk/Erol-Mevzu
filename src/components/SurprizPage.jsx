import { useState, useRef, useEffect } from "react";
import { DEFAULT, COLORS, ICON_CATS, EMOJI_CATS, FONT_PRESETS } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import { getRandomQuote } from "../utils/quotes";
import Card from "./Card";

const LAYOUTS = ["a", "b", "c"];
const BG_ANIMS = ["none", "aurora", "plasma", "stars", "rings", "rain", "waves", "fire", "nebula", "geo", "sparks"];
const TEXT_ANIMS = ["none", "glow", "float", "shimmer", "glitch", "pulse", "neon", "shake", "bounce", "flicker", "zoom"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildState(q) {
  const emojiPool = EMOJI_CATS[q.cat] || EMOJI_CATS.Sembol;
  const iconPool = ICON_CATS[q.cat] || ICON_CATS.Sembol;
  const useEmoji = Math.random() < 0.5;

  return {
    ...DEFAULT,
    layout: rand(LAYOUTS),
    color: rand(COLORS),
    iconMode: useEmoji ? "emoji" : "svg",
    emoji: rand(emojiPool),
    svgIcon: rand(iconPool).n,
    iconSize: 120 + Math.floor(Math.random() * 80),
    iconOpacity: +(0.08 + Math.random() * 0.14).toFixed(2),
    quote: q.quote,
    author: q.author,
    tag: q.cat,
    cat: q.cat,
    fontSize: rand([22, 26, 28, 32]),
    fontStyle: rand(Object.keys(FONT_PRESETS)),
    bgAnim: rand(BG_ANIMS),
    textAnim: rand(TEXT_ANIMS),
  };
}

export default function SurprizPage({ tema, onBack }) {
  const T = TEMALAR[tema];
  const [s, setS] = useState(null);
  const [kalan, setKalan] = useState(null);
  const [toplam, setToplam] = useState(null);
  const cardRef = useRef(null);

  const karistir = async () => {
    setS(null);
    const q = await getRandomQuote();
    setS(buildState(q));
    setKalan(q.poolRemaining);
    setToplam(q.poolTotal);
  };

  useEffect(() => { karistir(); }, []);

  const fixGradientForCapture = (doc) => {
    doc.querySelectorAll("[data-mevzu-gradient]").forEach((el) => {
      el.style.background = "none";
      el.style.webkitTextFillColor = "";
      el.style.color = el.getAttribute("data-mevzu-gradient-fallback") || "#000";
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2, logging: false, onclone: fixGradientForCapture });
    const fullImg = canvas.toDataURL("image/png");

    const thumb = document.createElement("canvas");
    thumb.width = 300; thumb.height = 300;
    thumb.getContext("2d").drawImage(canvas, 0, 0, 300, 300);
    const thumbImg = thumb.toDataURL("image/jpeg", 0.7);

    try {
      const mevcutlar = JSON.parse(localStorage.getItem("mevzu_postlar") || "[]");
      const yeni = [{ id: Date.now(), img: thumbImg, date: new Date().toISOString() }, ...mevcutlar].slice(0, 30);
      localStorage.setItem("mevzu_postlar", JSON.stringify(yeni));
    } catch { }

    const link = document.createElement("a");
    link.download = `mevzu-surpriz-${Date.now()}.png`;
    link.href = fullImg;
    link.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: T.bg }}>
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", background: T.bg2, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, flexShrink: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>Sürpriz Kart</span>
        <span style={{ fontSize: 9, color: T.faint, textTransform: "uppercase", letterSpacing: 2 }}>1:1</span>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24, padding: "32px 20px",
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(${T.gr},.05) 0%, transparent 70%), ${T.bg}`,
      }}>
        {s
          ? <Card s={s} cardRef={cardRef} />
          : <div style={{ width: "min(500px, calc(100vw - 32px))", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", color: T.faint, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Söz aranıyor...</div>
        }

        {kalan !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 120, height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(kalan / toplam) * 100}%`, background: T.gold, transition: "width .3s ease" }} />
            </div>
            <span style={{ fontSize: 9, color: T.faint, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {kalan > 0 ? `${kalan} söz kaldı` : "tur tamamlandı ↺"}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 400 }}>
          <button onClick={karistir} disabled={!s} style={{
            flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "13px 0", cursor: s ? "pointer" : "not-allowed", color: T.gold, fontFamily: "inherit",
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: s ? 1 : 0.5,
          }}>🎲 Yeniden Karıştır</button>
          <button onClick={handleDownload} disabled={!s} style={{
            flex: 1, background: `linear-gradient(135deg, ${T.gold}, #a07830)`, color: "#1a1200",
            border: "none", borderRadius: 10, padding: "13px 0", cursor: s ? "pointer" : "not-allowed",
            fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: s ? 1 : 0.5,
          }}>⬇ İndir</button>
        </div>
      </div>
    </div>
  );
}
