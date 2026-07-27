import { useState, useRef } from "react";
import { DEFAULT } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import { useIsDesktop } from "../utils/hooks";
import Card from "./Card";
import Panel from "./Panel";

export default function EditorPage({ tema, isReels, onBack }) {
  const T = TEMALAR[tema];
  const isDesktop = useIsDesktop();
  const [zoom, setZoom] = useState(1);
  const [s, setS] = useState({ ...DEFAULT });
  const cardRef = useRef(null);

  // html2canvas `background-clip:text` (gradient metin) desteklemiyor — çekim öncesi
  // klonda gradient metinleri düz renge (gradient başlangıcı) düşürüyoruz.
  const fixGradientForCapture = (doc) => {
    doc.querySelectorAll("[data-mevzu-gradient]").forEach((el) => {
      el.style.background = "none";
      el.style.webkitTextFillColor = "";
      el.style.color = el.getAttribute("data-mevzu-gradient-fallback") || "#000";
    });
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2, logging: false, onclone: fixGradientForCapture });
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch { alert("Kopyalanamadı. Chrome veya Edge kullan."); }
    }, "image/png");
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
    link.download = `mevzu-kart-${Date.now()}.png`;
    link.href = fullImg;
    link.click();
  };

  const topBar = (
    <div style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 20px", background: T.bg2, borderBottom: `1px solid ${T.border}`,
      position: "sticky", top: 0, flexShrink: 0, zIndex: 100,
    }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>
        {isReels ? "Reels Kart" : "Kare Kart"}
      </span>
      <span style={{ fontSize: 9, color: T.faint, textTransform: "uppercase", letterSpacing: 2 }}>
        {isReels ? "9:16" : "1:1"}
      </span>
    </div>
  );

  const dragHint = (
    <div style={{ fontSize: 10, color: T.faint, textAlign: "center", padding: "8px 14px", border: `1px dashed ${T.border}`, borderRadius: 8 }}>
      ✦ Yazıyı, yazarı, simgeyi ve logoyu sürükleyerek taşıyabilirsin
    </div>
  );

  /* ── Desktop ────────────────────────────────────────────────── */
  const CARD_SZ = 500; // kare kartın masaüstünde sabit boyutu

  const zoomBtn = (label, onClick) => (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
      background: T.bg3, color: T.muted, fontSize: 16, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "inherit", fontWeight: 600, flexShrink: 0,
    }}>{label}</button>
  );

  if (isDesktop) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg }}>
        {topBar}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sol: kart önizleme */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(${T.gr},.05) 0%, transparent 70%), ${T.bg}`,
          }}>
            {/* Zoom kontrol çubuğu */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
              flexShrink: 0, background: T.bg2,
            }}>
              {zoomBtn("−", () => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2))))}
              <span style={{ fontSize: 11, color: T.faint, width: 44, textAlign: "center", letterSpacing: 1 }}>{Math.round(zoom * 100)}%</span>
              {zoomBtn("+", () => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2))))}
              <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
              {zoomBtn("↺", () => setZoom(1))}
              <span style={{ fontSize: 9, color: T.fainter, letterSpacing: 1 }}>sıfırla</span>
            </div>

            {/* Kaydırılabilir kart alanı */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 24px" }}>
              <div style={{ width: CARD_SZ * zoom, height: CARD_SZ * zoom, position: "relative", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${zoom})` }}>
                  <Card s={s} cardRef={cardRef} />
                </div>
              </div>
            </div>

            {/* İpucu */}
            <div style={{ flexShrink: 0, padding: "12px 24px 16px", borderTop: `1px solid ${T.border}` }}>
              {dragHint}
            </div>
          </div>

          {/* Sağ: panel */}
          <div style={{
            width: 420, flexShrink: 0,
            borderLeft: `1px solid ${T.border}`,
            overflowY: "auto",
            padding: "20px 20px 60px",
            background: T.bg,
          }}>
            <Panel s={s} setS={setS} tema={tema} showAnim onDownload={handleDownload} onCopy={handleCopy} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Mobile ─────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", paddingBottom: 60, background: T.bg }}>
      {topBar}

      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 0", width: "100%" }}>
        <Card s={s} cardRef={cardRef} />
      </div>

      <div style={{ maxWidth: 520, width: "100%", padding: "10px 16px 0" }}>
        {dragHint}
      </div>

      <div style={{ maxWidth: 520, width: "100%", padding: "16px 16px 0" }}>
        <Panel s={s} setS={setS} tema={tema} showAnim onDownload={handleDownload} onCopy={handleCopy} />
      </div>
    </div>
  );
}