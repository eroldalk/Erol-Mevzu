import { useState, useRef } from "react";
import { DEFAULT, FONT_PRESETS, MUSIC_LIBRARY } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import { useIsDesktop } from "../utils/hooks";
import { BG_RENDERERS, ease, textAnimFrame, drawAnimatedText, wrapLinesCached, drawLogo } from "../utils/videoRender";
import Card from "./Card";
import Panel from "./Panel";
import { Play, Square, Download } from "lucide-react";

// Card.jsx'teki gerçek karta (layout a/b/c, ikon, kategori, yazı efekti) sadık canvas render
function renderCardFrame(cv, cx, s, elapsed, drag) {
  const SCALE = cv.width / 260;
  // Önizlemede sürüklenen söz/yazar/ikon konumları (Card.jsx'teki DragBox ile aynı koordinat uzayı: 260px referans kart)
  const dQ = { x: (drag?.quote?.x || 0) * SCALE, y: (drag?.quote?.y || 0) * SCALE };
  const dA = { x: (drag?.author?.x || 0) * SCALE, y: (drag?.author?.y || 0) * SCALE };
  const dI = { x: (drag?.icon?.x || 0) * SCALE, y: (drag?.icon?.y || 0) * SCALE };
  const dL = { x: (drag?.logo?.x || 0) * SCALE, y: (drag?.logo?.y || 0) * SCALE };
  const textColor = s.color?.text || "#f0f0f0";
  const layout = s.layout || "b";
  const anim = s.textAnim || "none";
  const hasAnim = anim !== "none";
  const fontPx = (s.fontSize || 28) * SCALE;
  const lineHeight = fontPx * 1.55;
  const qMax = 200 * SCALE;
  const fontPreset = FONT_PRESETS[s.fontStyle] || FONT_PRESETS["serif-italic"];
  const quoteFont = `${fontPreset.style === "italic" ? "italic " : ""}${fontPreset.weight} ${fontPx}px ${fontPreset.family}`;
  const authorFontPx = 10 * SCALE;
  const authorFont = `300 ${Math.round(authorFontPx)}px sans-serif`;
  // Gradient metin rengi ve gölge/blur derinlik efekti — Card.jsx ile aynı mantık
  const textGradient = (s.textGradient?.enabled && anim !== "shimmer")
    ? { from: s.textGradient.from, to: s.textGradient.to } : null;
  const depthShadow = s.textShadow?.enabled ? {
    blur: 4 + (s.textShadow.intensity / 100) * 20,
    offsetY: 2 + (s.textShadow.intensity / 100) * 6,
    opacity: (0.15 + (s.textShadow.intensity / 100) * 0.45).toFixed(2),
  } : null;

  cx.font = quoteFont;
  const lines = wrapLinesCached(cx, s, s.quote, qMax);

  const tagFade = ease(elapsed, 300, 500);
  const quoteFade = ease(elapsed, 700, 650);
  const authorFade = ease(elapsed, 1450, 650);

  // İkon (yalnızca emoji — SVG ikonlar video kaydında desteklenmiyor)
  if (!s.iconHidden && s.iconMode === "emoji" && s.emoji) {
    cx.save();
    cx.globalAlpha = s.iconOpacity ?? 0.14;
    cx.font = `${(s.iconSize || 150) * SCALE}px sans-serif`;
    cx.textAlign = "right"; cx.textBaseline = "bottom";
    cx.fillText(s.emoji, cv.width - 10 * SCALE + dI.x, cv.height - 80 * SCALE + dI.y);
    cx.restore();
  }

  // Logo işareti
  const logoPos = layout === "c" ? [22, 28] : layout === "a" ? [28, 24] : [36, 28];
  drawLogo(cx, logoPos[0] * SCALE + dL.x, logoPos[1] * SCALE + dL.y, textColor, SCALE);

  // Üst etiket
  if (s.tag && tagFade > 0) {
    const inset = layout === "a" ? 28 : layout === "c" ? 28 : 32;
    const top = layout === "a" ? 28 : 32;
    cx.save();
    cx.globalAlpha = tagFade * 0.35; cx.fillStyle = textColor;
    cx.font = `700 ${Math.round(8 * SCALE)}px sans-serif`;
    cx.textAlign = "right"; cx.textBaseline = "top";
    cx.fillText(s.tag.toUpperCase(), cv.width - inset * SCALE, top * SCALE);
    cx.restore();
  }

  if (layout === "a") {
    // Layout A'da tek bir sürükleme kutusu söz+yazarı birlikte taşır (bkz. Card.jsx)
    const authorRowH = authorFontPx * 1.4;
    const gap = 18 * SCALE;
    const blockH = lines.length * lineHeight + gap + authorRowH;
    const cy = (cv.height - blockH) / 2 + dQ.y;
    const cxCenter = cv.width / 2 + dQ.x;

    if (quoteFade > 0) {
      lines.forEach((line, i) => {
        drawAnimatedText(cx, line, cxCenter, cy + i * lineHeight + fontPx, textColor, quoteFont, fontPx, hasAnim ? anim : "none", elapsed, "center", quoteFade, textGradient, depthShadow);
      });
    }

    const authorY = cy + lines.length * lineHeight + gap + authorFontPx;
    if (authorFade > 0 && s.author) {
      const authText = s.author.toUpperCase();
      cx.save();
      cx.font = authorFont;
      const aw = cx.measureText(authText).width;
      const lw = 24 * SCALE, gapW = 10 * SCALE;
      cx.strokeStyle = textColor; cx.globalAlpha = authorFade * 0.2; cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(cxCenter - aw / 2 - gapW - lw, authorY - authorFontPx * 0.35);
      cx.lineTo(cxCenter - aw / 2 - gapW, authorY - authorFontPx * 0.35);
      cx.moveTo(cxCenter + aw / 2 + gapW, authorY - authorFontPx * 0.35);
      cx.lineTo(cxCenter + aw / 2 + gapW + lw, authorY - authorFontPx * 0.35);
      cx.stroke();
      cx.restore();
      drawAnimatedText(cx, authText, cxCenter, authorY, textColor, authorFont, authorFontPx, hasAnim ? anim : "none", elapsed, "center", authorFade * (hasAnim ? 1 : 0.5), textGradient, depthShadow);
    }
  } else {
    // Layout B/C'de söz ve yazar bağımsız sürüklenebilir (Card.jsx'te ayrı DragBox'lar)
    const leftX = (layout === "c" ? 22 : 36) * SCALE;
    const quoteX = leftX + dQ.x;
    let quoteTopY = (layout === "c" ? 90 : 80) * SCALE + dQ.y;

    if (layout === "c" && s.cat) {
      cx.save();
      cx.globalAlpha = tagFade * 0.45; cx.fillStyle = textColor;
      const dotR = 2 * SCALE;
      cx.beginPath(); cx.arc(quoteX + dotR, quoteTopY + dotR, dotR, 0, Math.PI * 2); cx.fill();
      cx.font = `700 ${Math.round(8 * SCALE)}px sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText(s.cat.toUpperCase(), quoteX + dotR * 2 + 8 * SCALE, quoteTopY + dotR);
      cx.restore();
      quoteTopY += 24 * SCALE;
    }

    if (quoteFade > 0) {
      lines.forEach((line, i) => {
        drawAnimatedText(cx, line, quoteX, quoteTopY + i * lineHeight + fontPx * 0.85, textColor, quoteFont, fontPx, hasAnim ? anim : "none", elapsed, "left", quoteFade, textGradient, depthShadow);
      });
    }

    if (authorFade > 0 && s.author) {
      const bottomInset = (layout === "c" ? 32 : 36) * SCALE;
      const authorX = leftX + dA.x;
      const authorBaseY = cv.height - bottomInset + dA.y;
      const lineW = (layout === "c" ? 20 : 32) * SCALE;
      const gapH = 12 * SCALE;
      cx.save();
      cx.strokeStyle = textColor; cx.globalAlpha = authorFade * 0.2; cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(authorX, authorBaseY - authorFontPx - gapH);
      cx.lineTo(authorX + lineW, authorBaseY - authorFontPx - gapH);
      cx.stroke();
      cx.restore();
      drawAnimatedText(cx, s.author.toUpperCase(), authorX, authorBaseY, textColor, authorFont, authorFontPx, hasAnim ? anim : "none", elapsed, "left", authorFade * (hasAnim ? 1 : 0.5), textGradient, depthShadow);
    }
  }
}

function VideoRecorder({ s, duration, T, bgMedia, bgMediaType, bgAudio, dragPos }) {
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioWarning, setAudioWarning] = useState(null);
  const recRef = useRef(null);
  const chunks = useRef([]);
  const rafRef = useRef(null);

  const start = async () => {
    setAudioWarning(null);
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = 568;
    const cx = cv.getContext("2d");
    const snap = { ...s };

    // Hazırlık: arkaplan video/görsel
    let bgVideoEl = null;
    let bgImgEl = null;
    if (bgMedia) {
      if (bgMediaType === "video") {
        bgVideoEl = document.createElement("video");
        bgVideoEl.src = bgMedia; bgVideoEl.loop = true; bgVideoEl.muted = true;
        await bgVideoEl.play().catch(() => {});
      } else {
        bgImgEl = new Image();
        bgImgEl.crossOrigin = "anonymous";
        await new Promise(r => { bgImgEl.onload = r; bgImgEl.onerror = r; bgImgEl.src = bgMedia; });
      }
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const canvasStream = cv.captureStream(30);

      // Ses akışı ekle
      let finalStream = canvasStream;
      let audioEl = null;
      if (bgAudio) {
        try {
          audioEl = document.createElement("audio");
          audioEl.crossOrigin = "anonymous";
          audioEl.addEventListener("error", () => {
            setAudioWarning("Ses dosyası yüklenemedi (bağlantı geçersiz olabilir) — video sessiz kaydedildi.");
          });
          audioEl.src = bgAudio; audioEl.loop = true;
          const audioCtx = new AudioContext();
          const src = audioCtx.createMediaElementSource(audioEl);
          const dest = audioCtx.createMediaStreamDestination();
          src.connect(dest);
          finalStream = new MediaStream([...canvasStream.getTracks(), ...dest.stream.getTracks()]);
        } catch { setAudioWarning("Ses motoru başlatılamadı — video sessiz kaydedildi."); }
      }

      recRef.current = new MediaRecorder(finalStream, { mimeType });
      chunks.current = [];
      recRef.current.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data); };
      recRef.current.onstop = () => {
        cancelAnimationFrame(rafRef.current);
        if (audioEl) audioEl.pause();
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setStatus("done");
      };

      setStatus("countdown"); setCountdown(3);
      let c = 3;
      const cd = setInterval(() => {
        c--; setCountdown(c);
        if (c <= 0) {
          clearInterval(cd);
          setStatus("recording"); setProgress(0);
          recRef.current.start();
          if (audioEl) audioEl.play().catch(() => {});
          const dur = duration * 1000;
          let rafStart = null;
          const bgRender = BG_RENDERERS[snap.bgAnim || "none"] || BG_RENDERERS.none;
          const loop = ts => {
            if (!rafStart) rafStart = ts;
            const e = ts - rafStart;
            // Arkaplan çiz
            if (bgVideoEl) {
              cx.drawImage(bgVideoEl, 0, 0, cv.width, cv.height);
              cx.fillStyle = "rgba(0,0,0,0.38)"; cx.fillRect(0, 0, cv.width, cv.height);
            } else if (bgImgEl) {
              cx.drawImage(bgImgEl, 0, 0, cv.width, cv.height);
              cx.fillStyle = "rgba(0,0,0,0.38)"; cx.fillRect(0, 0, cv.width, cv.height);
            } else {
              bgRender(cv, cx, snap, e);
            }
            renderCardFrame(cv, cx, snap, e, dragPos);
            setProgress(Math.min((e / dur) * 100, 100));
            if (e >= dur) { recRef.current.stop(); return; }
            rafRef.current = requestAnimationFrame(loop);
          };
          rafRef.current = requestAnimationFrame(loop);
        }
      }, 1000);
    } catch (err) {
      alert("Kayıt başlatılamadı. Chrome tarayıcı gereklidir.\n" + err.message);
      setStatus("idle");
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    if (recRef.current?.state === "recording") recRef.current.stop();
  };

  const dl = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl; a.download = `mevzu-reels-${Date.now()}.webm`; a.click();
  };

  const reset = () => { setStatus("idle"); setVideoUrl(null); setProgress(0); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {status === "recording" && (
        <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: T.gold, width: `${progress}%`, transition: "width .1s linear" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {status === "idle" && (
          <button onClick={start} style={{ flex: 1, background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 0", cursor: "pointer", color: T.muted, fontFamily: "inherit", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Play size={13} /> Video Kaydet
          </button>
        )}
        {status === "countdown" && (
          <div style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 0", textAlign: "center", color: T.gold, fontSize: 22, fontWeight: 700 }}>{countdown}</div>
        )}
        {status === "recording" && (
          <button onClick={stop} style={{ flex: 1, background: "#e53e3e", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Square size={13} /> Durdur
          </button>
        )}
        {status === "done" && <>
          <button onClick={dl} style={{ flex: 3, background: T.gold, color: "#1a1200", border: "none", borderRadius: 10, padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Download size={13} /> İndir (.webm)
          </button>
          <button onClick={reset} style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
        </>}
      </div>
      <div style={{ fontSize: 9, color: T.faint, textAlign: "center" }}>
        {status === "idle" && `Chrome gerekli${bgMedia ? " · Video arkaplan" : ""}${bgAudio ? " · Ses" : ""} kaydedilir`}
        {status === "countdown" && `Hazırlan... ${countdown}`}
        {status === "recording" && `Kaydediliyor — ${duration}sn`}
        {status === "done" && "Hazır! İndir ve paylaş."}
      </div>
      {audioWarning && (
        <div style={{ fontSize: 9, color: "#e0a050", textAlign: "center" }}>⚠ {audioWarning}</div>
      )}
    </div>
  );
}

export default function ReelsPage({ tema, onBack }) {
  const T = TEMALAR[tema];
  const isDesktop = useIsDesktop();
  const [s, setS] = useState({ ...DEFAULT });
  const [duration, setDuration] = useState(7);
  const [bgMedia, setBgMedia] = useState(null);
  const [bgMediaType, setBgMediaType] = useState(null);
  const [bgMediaName, setBgMediaName] = useState(null);
  const [bgAudio, setBgAudio] = useState(null);
  const [bgAudioName, setBgAudioName] = useState(null);
  const [audioMode, setAudioMode] = useState("kutuphane");
  const [audioUrlInput, setAudioUrlInput] = useState("");
  const [zoom, setZoom] = useState(1.5);
  const [dragPos, setDragPos] = useState({ quote: { x: 0, y: 0 }, author: { x: 0, y: 0 }, icon: { x: 0, y: 0 }, logo: { x: 0, y: 0 } });
  const outerRef = useRef(null);
  const mediaFileRef = useRef(null);
  const audioFileRef = useRef(null);

  const handleDragMove = (key, pos) => setDragPos((p) => ({ ...p, [key]: pos }));

  const handleMediaFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    setBgMedia(URL.createObjectURL(file));
    setBgMediaType(file.type.startsWith("video") ? "video" : "image");
    setBgMediaName(file.name);
    e.target.value = "";
  };

  const handleAudioFile = e => {
    const file = e.target.files?.[0]; if (!file) return;
    setBgAudio(URL.createObjectURL(file));
    setBgAudioName(file.name);
    e.target.value = "";
  };

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
    if (!outerRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(outerRef.current, { useCORS: true, scale: 2, logging: false, onclone: fixGradientForCapture });
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch { alert("Kopyalanamadı. Chrome veya Edge kullan."); }
    }, "image/png");
  };

  const handleDownload = async () => {
    if (!outerRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(outerRef.current, { useCORS: true, scale: 2, logging: false, onclone: fixGradientForCapture });
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
    link.download = `mevzu-reels-${Date.now()}.png`;
    link.href = fullImg;
    link.click();
  };

  /* Kart + arkaplan */
  const cardPreview = (
    <div ref={outerRef} style={{ position: "relative", lineHeight: 0, flexShrink: 0 }}>
      {bgMedia && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          {bgMediaType === "video"
            ? <video src={bgMedia} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <img src={bgMedia} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Card s={bgMedia ? { ...s, color: { ...s.color, bg: "rgba(0,0,0,0)" } } : s} portrait dragPos={dragPos} onDragMove={handleDragMove} />
      </div>
    </div>
  );

  /* Arkaplan & Ses yükleme */
  const mediaUpload = (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>Arkaplan & Ses</div>
      <div style={{ display: "flex", gap: 8 }}>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <input ref={mediaFileRef} type="file" accept="image/*,video/*" onChange={handleMediaFile} style={{ display: "none" }} />
          {bgMedia ? (
            <div style={{ position: "relative", height: 88, borderRadius: 8, overflow: "hidden" }}>
              {bgMediaType === "video"
                ? <video src={bgMedia} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                : <img src={bgMedia} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              <button onClick={() => { setBgMedia(null); setBgMediaType(null); setBgMediaName(null); }}
                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,.65)", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          ) : (
            <button onClick={() => mediaFileRef.current?.click()} style={{ height: 88, background: T.bg3, border: `1px dashed ${T.border}`, borderRadius: 8, cursor: "pointer", color: T.faint, fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 20 }}>🎬</span>
              <span style={{ fontSize: 9, letterSpacing: 1 }}>Video / Görsel</span>
            </button>
          )}
          {bgMediaName && <span style={{ fontSize: 8, color: T.fainter, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bgMediaName}</span>}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <input ref={audioFileRef} type="file" accept="audio/*" onChange={handleAudioFile} style={{ display: "none" }} />
          {bgAudio ? (
            <div style={{ borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, padding: "10px 12px", position: "relative", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎵</span>
                <span style={{ fontSize: 9, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{bgAudioName}</span>
                <button onClick={() => { setBgAudio(null); setBgAudioName(null); }}
                  style={{ background: "rgba(0,0,0,.4)", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
              </div>
              <audio src={bgAudio} controls style={{ width: "100%", height: 32, opacity: 0.7 }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {/* Mod sekmeleri */}
              <div style={{ display: "flex", gap: 4 }}>
                {[["dosya","📁 Dosya"],["url","🔗 URL"],["kutuphane","🎵 Kütüphane"]].map(([m, lbl]) => (
                  <button key={m} onClick={() => setAudioMode(m)} style={{
                    flex: 1, padding: "6px 2px", fontSize: 8,
                    background: audioMode === m ? `rgba(${T.gr},.08)` : T.bg3,
                    border: `1px solid ${audioMode === m ? T.gold : T.border}`,
                    borderRadius: 6, color: audioMode === m ? T.gold : T.faint,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>{lbl}</button>
                ))}
              </div>

              {/* Dosya */}
              {audioMode === "dosya" && (
                <button onClick={() => audioFileRef.current?.click()} style={{ height: 68, background: T.bg3, border: `1px dashed ${T.border}`, borderRadius: 8, cursor: "pointer", color: T.faint, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🎵</span>
                  <span style={{ fontSize: 9, letterSpacing: 1 }}>Ses dosyası seç</span>
                </button>
              )}

              {/* URL */}
              {audioMode === "url" && (
                <div style={{ display: "flex", gap: 5 }}>
                  <input
                    value={audioUrlInput}
                    onChange={e => setAudioUrlInput(e.target.value)}
                    placeholder=".mp3 linkini yapıştır…"
                    onKeyDown={e => {
                      if (e.key !== "Enter" || !audioUrlInput.trim()) return;
                      setBgAudio(audioUrlInput.trim());
                      setBgAudioName(decodeURIComponent(audioUrlInput.split("/").pop()) || "URL Sesi");
                      setAudioUrlInput("");
                    }}
                    style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 10, padding: "0 10px", height: 68, outline: "none", fontFamily: "inherit" }}
                  />
                  <button
                    onClick={() => {
                      if (!audioUrlInput.trim()) return;
                      setBgAudio(audioUrlInput.trim());
                      setBgAudioName(decodeURIComponent(audioUrlInput.split("/").pop()) || "URL Sesi");
                      setAudioUrlInput("");
                    }}
                    style={{ width: 68, height: 68, background: `rgba(${T.gr},.08)`, border: `1px solid ${T.gold}`, borderRadius: 8, color: T.gold, cursor: "pointer", fontSize: 18, flexShrink: 0 }}
                  >✓</button>
                </div>
              )}

              {/* Kütüphane */}
              {audioMode === "kutuphane" && (
                <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
                  {MUSIC_LIBRARY.map((track, i) => (
                    <button key={i}
                      onClick={() => { setBgAudio(track.url); setBgAudioName(track.name); }}
                      onMouseEnter={e => e.currentTarget.style.background = `rgba(${T.gr},.06)`}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      style={{
                        width: "100%", background: "transparent", border: "none",
                        borderBottom: i < MUSIC_LIBRARY.length - 1 ? `1px solid ${T.border}` : "none",
                        padding: "9px 12px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                        <span style={{ fontSize: 10, color: T.text, fontWeight: 600 }}>{track.name}</span>
                        <span style={{ fontSize: 7, color: T.faint, letterSpacing: 1, textTransform: "uppercase" }}>{track.genre}</span>
                      </div>
                      <span style={{ fontSize: 10, color: T.gold }}>▶</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {bgAudio && <div style={{ fontSize: 9, color: T.faint, textAlign: "center" }}>Ses sadece video kaydına eklenir · önizlemede çalmaz</div>}
    </div>
  );

  /* Video çıktı */
  const videoOutput = (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint, marginBottom: 10 }}>Video Çıktı</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[3, 5, 7, 10, 15].map(v => (
          <button key={v} onClick={() => setDuration(v)} style={{ flex: 1, background: T.bg2, border: `1px solid ${duration === v ? T.gold : T.border}`, borderRadius: 8, color: duration === v ? T.gold : T.faint, fontSize: 10, padding: "7px 2px", cursor: "pointer", fontFamily: "inherit" }}>{v}s</button>
        ))}
      </div>
      <VideoRecorder s={s} duration={duration} T={T} bgMedia={bgMedia} bgMediaType={bgMediaType} bgAudio={bgAudio} dragPos={dragPos} />
    </div>
  );

  const topBar = (
    <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: T.bg2, borderBottom: `1px solid ${T.border}`, flexShrink: 0, zIndex: 100, position: "sticky", top: 0 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>Reels Kart</span>
      <span style={{ fontSize: 9, color: T.faint, textTransform: "uppercase", letterSpacing: 2 }}>9:16</span>
    </div>
  );

  const dragHint = (
    <div style={{ fontSize: 10, color: T.faint, textAlign: "center", padding: "8px 14px", border: `1px dashed ${T.border}`, borderRadius: 8 }}>
      ✦ Yazıyı, yazarı, simgeyi ve logoyu sürükleyerek taşıyabilirsin
    </div>
  );

  /* ── Desktop ────────────────────────────────────────────────── */
  const CW = 260, CH = Math.round(260 * 16 / 9); // doğal: 260 × 462px

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

          {/* Sol: kart önizleme (kaydırılabilir) */}
          <div style={{
            width: 500, flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            display: "flex", flexDirection: "column",
            background: `radial-gradient(ellipse 70% 50% at 50% 30%, rgba(${T.gr},.06) 0%, transparent 70%), ${T.bg}`,
          }}>
            {/* Zoom kontrol çubuğu */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
              flexShrink: 0, background: T.bg2,
            }}>
              {zoomBtn("−", () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2))))}
              <span style={{ fontSize: 11, color: T.faint, width: 44, textAlign: "center", letterSpacing: 1 }}>{Math.round(zoom * 100)}%</span>
              {zoomBtn("+", () => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2))))}
              <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px" }} />
              {zoomBtn("↺", () => setZoom(1.5))}
              <span style={{ fontSize: 9, color: T.fainter, letterSpacing: 1 }}>sıfırla</span>
            </div>

            {/* Kaydırılabilir kart alanı */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 20px" }}>
              <div style={{ width: CW * zoom, height: CH * zoom, position: "relative", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${zoom})` }}>
                  {cardPreview}
                </div>
              </div>
            </div>

            {/* Alt: ipucu */}
            <div style={{ flexShrink: 0, padding: "0 16px 20px", borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.faint, textAlign: "center", padding: "10px 0 4px" }}>
                ✦ Yazıyı, yazarı, simgeyi ve logoyu sürükleyerek taşıyabilirsin
              </div>
            </div>
          </div>

          {/* Sağ: video + panel */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 60px", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: "100%", maxWidth: 900 }}>{videoOutput}</div>
            <Panel s={s} setS={setS} tema={tema} showAnim afterDownload={mediaUpload} splitFields onDownload={handleDownload} onCopy={handleCopy} />
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
        {cardPreview}
      </div>

      <div style={{ maxWidth: 520, width: "100%", padding: "10px 16px 0" }}>{dragHint}</div>

      <div style={{ maxWidth: 520, width: "100%", padding: "12px 16px 0" }}>{mediaUpload}</div>

      <div style={{ maxWidth: 520, width: "100%", padding: "12px 16px 0" }}>{videoOutput}</div>

      <div style={{ maxWidth: 520, width: "100%", padding: "16px 16px 0" }}>
        <Panel s={s} setS={setS} tema={tema} showAnim onDownload={handleDownload} onCopy={handleCopy} />
      </div>
    </div>
  );
}