import { useState, useRef } from "react";
import { DEFAULT, FONT_PRESETS, MUSIC_LIBRARY } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import { useIsDesktop } from "../utils/hooks";
import Card from "./Card";
import Panel from "./Panel";
import { Play, Square, Download } from "lucide-react";

// Canvas renderers for video recording (maps bgAnim → canvas) — Card.jsx'teki animasyonlu arkaplanların canvas karşılığı
const BG_RENDERERS = {
  none: (cv, cx, s) => { cx.fillStyle = s.color?.bg || "#1a1208"; cx.fillRect(0, 0, cv.width, cv.height); },
  aurora: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    [["201,168,76", 0.12], ["100,200,255", 0.08], ["180,80,255", 0.07], ["80,255,180", 0.06]].forEach(([rgb, op], i) => {
      const bx = cv.width * (0.3 + i * 0.2) + Math.sin(t * 0.0008 + i) * 80;
      const by = cv.height * (0.2 + i * 0.18) + Math.cos(t * 0.0006 + i) * 60;
      const r = 180 + i * 30;
      const g = cx.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0, `rgba(${rgb},${op + Math.sin(t * 0.001 + i) * 0.03})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
    });
  },
  plasma: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    [["255,80,80", 0.1], ["80,160,255", 0.08], ["200,80,255", 0.07], ["80,255,160", 0.06], ["255,200,80", 0.08]].forEach(([rgb, op], i) => {
      const bx = cv.width * 0.5 + Math.sin(t * 0.0007 + i * 1.2) * cv.width * 0.35;
      const by = cv.height * 0.5 + Math.cos(t * 0.0005 + i * 0.9) * cv.height * 0.35;
      const g = cx.createRadialGradient(bx, by, 0, bx, by, 160);
      g.addColorStop(0, `rgba(${rgb},${op})`); g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
    });
  },
  stars: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 55; i++) {
      const sx = (i * 173.7 * cv.width / 100) % cv.width;
      const sy = (i * 97.3 * cv.height / 100) % cv.height;
      const op = 0.3 + Math.sin(t * 0.003 + i) * 0.25;
      cx.fillStyle = `rgba(201,168,76,${op})`; cx.beginPath(); cx.arc(sx, sy, i % 5 === 0 ? 2 : 1, 0, Math.PI * 2); cx.fill();
    }
  },
  rings: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 5; i++) {
      const phase = (t * 0.0008 + i * 0.2) % 1;
      const r = phase * Math.max(cv.width, cv.height) * 0.7;
      const op = (1 - phase) * 0.12;
      cx.strokeStyle = `rgba(201,168,76,${op})`; cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(cv.width / 2, cv.height / 2, r, 0, Math.PI * 2); cx.stroke();
    }
  },
  rain: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    cx.strokeStyle = "rgba(201,168,76,0.18)"; cx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const x = (i * 53 + Math.sin(i * 3.7) * 40 + t * 0.05) % cv.width;
      const y = (i * cv.height / 30 + t * 0.12) % cv.height;
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - 3, y + 14); cx.stroke();
    }
  },
  waves: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    [["30,100,255", 0.10, 0.15], ["0,210,190", 0.08, 0.35], ["120,20,255", 0.07, 0.55], ["0,160,255", 0.06, 0.75]].forEach(([rgb, op, yFrac], i) => {
      const bx = cv.width * 0.5 + Math.cos(t * 0.0004 + i) * cv.width * 0.32;
      const by = cv.height * yFrac + Math.sin(t * 0.0006 + i) * 26;
      const g = cx.createRadialGradient(bx, by, 0, bx, by, cv.width * 0.5);
      g.addColorStop(0, `rgba(${rgb},${op})`); g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
    });
  },
  fire: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    [["255,55,0", 0.16, 0.50], ["255,140,0", 0.12, 0.35], ["255,30,0", 0.11, 0.66], ["255,200,40", 0.08, 0.50], ["200,20,0", 0.10, 0.42], ["255,100,10", 0.07, 0.60]].forEach(([rgb, op, xFrac], i) => {
      const bx = cv.width * xFrac + Math.sin(t * 0.001 + i) * 18;
      const by = cv.height * (0.9 - i * 0.02) + Math.cos(t * 0.0012 + i) * 8;
      const g = cx.createRadialGradient(bx, by, 0, bx, by, cv.width * 0.32);
      g.addColorStop(0, `rgba(${rgb},${op})`); g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
    });
  },
  nebula: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    [["110,0,220", 0.11, 0.22, 0.28], ["0,80,255", 0.09, 0.76, 0.64], ["200,0,120", 0.07, 0.58, 0.18], ["0,200,220", 0.06, 0.30, 0.80], ["160,0,255", 0.07, 0.80, 0.40]].forEach(([rgb, op, xFrac, yFrac], i) => {
      const bx = cv.width * xFrac + Math.sin(t * 0.0005 + i) * 36;
      const by = cv.height * yFrac + Math.cos(t * 0.0004 + i) * 36;
      const g = cx.createRadialGradient(bx, by, 0, bx, by, 190);
      g.addColorStop(0, `rgba(${rgb},${op})`); g.addColorStop(1, "rgba(0,0,0,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, cv.width, cv.height);
    });
  },
  geo: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    const size = 44;
    const off = (t * 0.006) % size;
    cx.strokeStyle = (s.color?.text || "#c9a84c") + "1a"; cx.lineWidth = 1;
    for (let x = -size + off; x < cv.width + size; x += size) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, cv.height); cx.stroke(); }
    for (let y = -size + off * 0.6; y < cv.height + size; y += size) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(cv.width, y); cx.stroke(); }
  },
  sparks: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    const c = s.color?.text || "#c9a84c";
    for (let i = 0; i < 32; i++) {
      const seedX = (i * 61.7) % 100, seedY = 20 + ((i * 37.3) % 80);
      const dur = 1400 + ((i * 53) % 1800);
      const delay = -((i * 211) % 4000);
      const phase = (((t + delay) % dur) + dur) % dur / dur;
      const x = cv.width * seedX / 100;
      const y = cv.height * seedY / 100 - phase * 130;
      const sz = 1 + (i % 3);
      cx.globalAlpha = Math.max(0, 1 - phase);
      cx.fillStyle = c; cx.beginPath(); cx.arc(x, y, sz, 0, Math.PI * 2); cx.fill();
    }
    cx.globalAlpha = 1;
  },
};

const ease = (t, start, dur) => Math.max(0, Math.min(1, (t - start) / dur));

// Yazı Efekti (textAnim) → Card.jsx'teki CSS keyframe'lerin canvas karşılığı
function textAnimFrame(anim, tMs) {
  const cyc = (period) => (((tMs % period) + period) % period) / period;
  switch (anim) {
    case "glow": {
      const p = cyc(2500);
      return { shadowBlur: 12 + Math.abs(Math.sin(p * Math.PI * 2)) * 22 };
    }
    case "float": {
      const p = cyc(3200);
      return { dy: -5 * (1 - Math.cos(p * Math.PI * 2)) };
    }
    case "pulse": {
      const p = cyc(2000);
      return { alphaMul: 0.38 + 0.62 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)) };
    }
    case "zoom": {
      const p = cyc(3000);
      return { scale: 1 + 0.18 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)) };
    }
    case "bounce": {
      const p = cyc(2800);
      return { dy: -16 * Math.max(0, Math.sin(p * Math.PI)) ** 2 };
    }
    case "shake": {
      const p = cyc(4000);
      const dx = p < 0.35 ? Math.sin(p * 70) * 6 * (1 - p / 0.35) : 0;
      return { dx };
    }
    case "flicker": {
      const pc = cyc(5000) * 100;
      const dim = (pc >= 20 && pc < 22) || (pc >= 24 && pc < 26) || (pc >= 54 && pc < 56);
      return { alphaMul: dim ? 0.12 : 1 };
    }
    case "neon": {
      const colors = ["#c9a84c", "#4af", "#f4a", "#4fa"];
      const p = cyc(3500);
      return { shadowColor: colors[Math.min(3, Math.floor(p * 4))], shadowBlur: 16 };
    }
    case "shimmer":
      return { shimmerPhase: cyc(2500) };
    case "glitch": {
      const pc = cyc(5000) * 100;
      const active = pc >= 76 && pc < 86;
      return { glitch: active, dx: active ? Math.sin(((pc - 76) / 10) * 30) * 4 : 0 };
    }
    default:
      return {};
  }
}

function drawAnimatedText(cx, text, x, y, color, font, fontPx, anim, tMs, align, baseAlpha = 1, gradient = null, depthShadow = null) {
  if (!text) return;
  const frame = textAnimFrame(anim, tMs);
  cx.save();
  cx.font = font;
  cx.textAlign = align;
  cx.textBaseline = "alphabetic";
  cx.translate(x + (frame.dx || 0), y + (frame.dy || 0));
  if (frame.scale) cx.scale(frame.scale, frame.scale);
  cx.globalAlpha = baseAlpha * (frame.alphaMul !== undefined ? frame.alphaMul : 1);
  if (depthShadow) { cx.shadowColor = `rgba(0,0,0,${depthShadow.opacity})`; cx.shadowBlur = depthShadow.blur; cx.shadowOffsetY = depthShadow.offsetY || 0; }
  if (anim === "glow") { cx.shadowColor = color; cx.shadowBlur = frame.shadowBlur; cx.shadowOffsetY = 0; }
  else if (frame.shadowColor) { cx.shadowColor = frame.shadowColor; cx.shadowBlur = frame.shadowBlur; cx.shadowOffsetY = 0; }
  let fillStyle = color;
  if (gradient) {
    const w = cx.measureText(text).width;
    const boxX = align === "center" ? -w / 2 : align === "right" ? -w : 0;
    const grad = cx.createLinearGradient(boxX, 0, boxX + w, 0);
    grad.addColorStop(0, gradient.from);
    grad.addColorStop(1, gradient.to);
    fillStyle = grad;
  }
  cx.fillStyle = fillStyle;
  cx.fillText(text, 0, 0);
  if (anim === "glitch" && frame.glitch) {
    cx.globalCompositeOperation = "lighter";
    cx.globalAlpha = baseAlpha * 0.5;
    cx.fillStyle = "#ff3050"; cx.fillText(text, -3, 1);
    cx.fillStyle = "#30c8ff"; cx.fillText(text, 3, -1);
    cx.globalCompositeOperation = "source-over";
  }
  if (anim === "shimmer") {
    const w = cx.measureText(text).width;
    cx.save();
    cx.globalCompositeOperation = "source-atop";
    const sweepW = Math.max(30, w * 0.55);
    const totalW = w + sweepW * 2;
    const sweepX0 = -sweepW + frame.shimmerPhase * totalW;
    const grad = cx.createLinearGradient(sweepX0, 0, sweepX0 + sweepW, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.85)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    cx.fillStyle = grad;
    const boxX = align === "center" ? -w / 2 - 4 : align === "right" ? -w - 4 : -4;
    cx.fillRect(boxX, -fontPx * 0.9, w + 8, fontPx * 1.3);
    cx.restore();
  }
  cx.restore();
}

function wrapLines(cx, text, maxWidth) {
  const out = [];
  (text || "").split("\n").forEach(paragraph => {
    if (paragraph === "") { out.push(""); return; }
    const words = paragraph.split(" ");
    let cur = "";
    words.forEach(word => {
      const test = cur ? `${cur} ${word}` : word;
      if (cur && cx.measureText(test).width > maxWidth) { out.push(cur); cur = word; }
      else cur = test;
    });
    if (cur) out.push(cur);
  });
  return out;
}

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
  const lines = wrapLines(cx, s.quote, qMax);

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
  cx.save();
  cx.globalAlpha = 0.9; cx.fillStyle = textColor;
  cx.font = `700 ${Math.round(11 * SCALE)}px Georgia,serif`;
  cx.textAlign = "left"; cx.textBaseline = "top";
  cx.fillText("❝MEVZU", logoPos[0] * SCALE + dL.x, logoPos[1] * SCALE + dL.y);
  cx.restore();

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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: T.bg2, borderBottom: `1px solid ${T.border}`, flexShrink: 0, zIndex: 100, position: "sticky", top: 0 }}>
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