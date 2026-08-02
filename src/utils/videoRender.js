// Canvas video-kayıt render yardımcıları — Card.jsx'teki CSS animasyonlarının/efektlerinin
// MediaRecorder ile kaydedilebilen Canvas 2D karşılığı. ReelsPage ve SurprizPage'in
// otomatik video modu bunları paylaşıyor.

import { FONT_PRESETS } from "./constants";

export function hexRgb(hex) {
  const h = (hex || "#c9a84c").replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function hexToRgbArr(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpColor(a, b, t) {
  const [ar, ag, ab] = hexToRgbArr(a);
  const [br, bg, bb] = hexToRgbArr(b);
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
}

export const ease = (t, start, dur) => Math.max(0, Math.min(1, (t - start) / dur));

// Canvas renderers for video recording (maps bgAnim → canvas) — Card.jsx'teki animasyonlu arkaplanların canvas karşılığı
export const BG_RENDERERS = {
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
    const { r, g, b } = hexRgb(s.color?.text);
    for (let i = 0; i < 55; i++) {
      const sx = (i * 173.7 * cv.width / 100) % cv.width;
      const sy = (i * 97.3 * cv.height / 100) % cv.height;
      const op = 0.3 + Math.sin(t * 0.003 + i) * 0.25;
      cx.fillStyle = `rgba(${r},${g},${b},${op})`; cx.beginPath(); cx.arc(sx, sy, i % 5 === 0 ? 2 : 1, 0, Math.PI * 2); cx.fill();
    }
  },
  rings: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    const ringColor = s.color?.text || "#c9a84c";
    for (let i = 0; i < 5; i++) {
      const phase = (t * 0.0008 + i * 0.2) % 1;
      const r = phase * Math.max(cv.width, cv.height) * 0.7;
      const op = (1 - phase) * 0.12;
      const alphaHex = Math.round(op * 255).toString(16).padStart(2, "0");
      cx.strokeStyle = ringColor + alphaHex; cx.lineWidth = 1.5;
      cx.beginPath(); cx.arc(cv.width / 2, cv.height / 2, r, 0, Math.PI * 2); cx.stroke();
    }
  },
  rain: (cv, cx, s, t) => {
    cx.fillStyle = s.color?.bg || "#141414"; cx.fillRect(0, 0, cv.width, cv.height);
    const { r, g, b } = hexRgb(s.color?.text);
    cx.strokeStyle = `rgba(${r},${g},${b},0.18)`; cx.lineWidth = 1;
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

// Yazı Efekti (textAnim) → Card.jsx'teki CSS keyframe'lerin canvas karşılığı
export function textAnimFrame(anim, tMs) {
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
      // CSS'teki keyframe'ler renkler arasında sürekli geçiş yapıyor (ör. altın→mavi
      // yumuşakça karışıyor) — burada da ayrık zıplama yerine iki durak arasında
      // enterpolasyon yapıyoruz, sondan başa (yeşil→altın) dönüş de dahil.
      const colors = ["#c9a84c", "#4af", "#f4a", "#4fa"];
      const p = cyc(3500) * colors.length;
      const i = Math.floor(p) % colors.length;
      const frac = p - Math.floor(p);
      return { shadowColor: lerpColor(colors[i], colors[(i + 1) % colors.length], frac), shadowBlur: 16 };
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

export function drawAnimatedText(cx, text, x, y, color, font, fontPx, anim, tMs, align, baseAlpha = 1, gradient = null, depthShadow = null) {
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
  const glowColor = anim === "glow" ? color : frame.shadowColor;
  let fillStyle = color;
  if (gradient) {
    const w = cx.measureText(text).width;
    const boxX = align === "center" ? -w / 2 : align === "right" ? -w : 0;
    const grad = cx.createLinearGradient(boxX, 0, boxX + w, 0);
    grad.addColorStop(0, gradient.from);
    grad.addColorStop(1, gradient.to);
    fillStyle = grad;
  }
  if (glowColor) {
    // CSS'teki üst üste yığılmış text-shadow katmanlarına yakın durması için canvas'ta
    // da tek pas yerine gittikçe daralan blur ile 2 ek katman çiziyoruz — tek katman
    // videoda CSS'e göre fark edilmeyecek kadar soluk kalıyordu.
    cx.shadowColor = glowColor; cx.shadowOffsetY = 0;
    cx.fillStyle = fillStyle;
    cx.shadowBlur = frame.shadowBlur * 1.8;
    cx.fillText(text, 0, 0);
    cx.shadowBlur = frame.shadowBlur;
    cx.fillText(text, 0, 0);
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

// Sürpriz Kart'ın "Otomatik Video" modu için: kart düzenlerinden (a/b/c) bağımsız,
// tek tip ortalanmış bir kompozisyon — söz satır satır (kelime kelime değil, wrapLines'ın
// ürettiği görsel satırlar halinde) sırayla beliriyor, düzenli bir ritimde. Tamamı
// göründükten sonra kartın seçili yazı efekti (glow/neon/shimmer vb.) devreye giriyor —
// beliriş sırasında efekt yok, sade ve okunaklı kalsın diye.
export function renderAutoQuoteFrame(cv, cx, s, elapsed) {
  const SCALE = cv.width / 320;
  const textColor = s.color?.text || "#f0f0f0";
  const anim = s.textAnim || "none";
  const fontPx = (s.fontSize || 28) * SCALE;
  const lineHeight = fontPx * 1.5;
  const qMax = cv.width * 0.78;
  const fontPreset = FONT_PRESETS[s.fontStyle] || FONT_PRESETS["serif-italic"];
  const quoteFont = `${fontPreset.style === "italic" ? "italic " : ""}${fontPreset.weight} ${fontPx}px ${fontPreset.family}`;
  const authorFontPx = 11 * SCALE;
  const authorFont = `300 ${Math.round(authorFontPx)}px sans-serif`;
  const textGradient = (s.textGradient?.enabled && anim !== "shimmer")
    ? { from: s.textGradient.from, to: s.textGradient.to } : null;
  const depthShadow = s.textShadow?.enabled ? {
    blur: 4 + (s.textShadow.intensity / 100) * 20,
    offsetY: 2 + (s.textShadow.intensity / 100) * 6,
    opacity: (0.15 + (s.textShadow.intensity / 100) * 0.45).toFixed(2),
  } : null;

  cx.font = quoteFont;
  const lines = wrapLinesCached(cx, s, s.quote, qMax);

  // Zamanlama: 10sn'lik videoya sığacak şekilde satır başına süre otomatik ölçekleniyor
  // (kısa söz hızlı belirip uzun süre sabit kalıyor, uzun söz daha hızlı art arda geliyor).
  const introEnd = 800;
  const authorFadeDur = 500;
  const pauseAfterQuote = 300;
  const holdTail = 700;
  const budget = Math.max(1200, 9500 - introEnd - authorFadeDur - pauseAfterQuote - holdTail);
  const perLine = Math.min(1300, Math.max(450, budget / Math.max(1, lines.length)));
  const lineFadeDur = 320;
  const quoteDoneAt = introEnd + lines.length * perLine;
  const authorStart = quoteDoneAt + pauseAfterQuote;
  const activeAnim = elapsed >= quoteDoneAt ? anim : "none";

  drawLogo(cx, 26 * SCALE, 24 * SCALE, textColor, SCALE);

  // Üst etiket (kategori)
  const tagFade = ease(elapsed, 300, 500);
  if (s.tag && tagFade > 0) {
    cx.save();
    cx.globalAlpha = tagFade * 0.4; cx.fillStyle = textColor;
    cx.font = `700 ${Math.round(9 * SCALE)}px sans-serif`;
    cx.textAlign = "right"; cx.textBaseline = "top";
    cx.fillText(s.tag.toUpperCase(), cv.width - 26 * SCALE, 26 * SCALE);
    cx.restore();
  }

  // İkon — Canvas'ta SVG ikon çizemiyoruz; buildState kategoriye uygun bir emoji'yi
  // iconMode ne olursa olsun her zaman dolduruyor, o yüzden burada iconMode'a bakmadan
  // emoji'yi kullanıyoruz. Aksi halde SVG modu seçildiğinde videoda ikon (ve onunla
  // birlikte arkaplanın büyük bölümü) hiç görünmüyordu.
  if (!s.iconHidden && s.emoji) {
    cx.save();
    cx.globalAlpha = (s.iconOpacity ?? 0.14) * ease(elapsed, 200, 600);
    cx.font = `${(s.iconSize || 150) * SCALE * 0.9}px sans-serif`;
    cx.textAlign = "center"; cx.textBaseline = "middle";
    cx.fillText(s.emoji, cv.width / 2, cv.height / 2);
    cx.restore();
  }

  // Söz + yazar bloğu, dikeyde ortalanmış
  const authorRowH = authorFontPx * 1.6;
  const gap = 22 * SCALE;
  const blockH = lines.length * lineHeight + gap + authorRowH;
  const startY = (cv.height - blockH) / 2;
  const cxCenter = cv.width / 2;

  // Hold aşamasında (tüm satırlar göründükten sonra) glow/neon aktifse satırları toplu
  // basıyoruz — maliyet satır sayısından bağımsız, sabit kalıyor. Gradyan metinle nadir
  // rastlanan kombinasyonda (ikisi aynı anda seçilirse) eski, satır satır yola düşüyoruz.
  const frame = textAnimFrame(activeAnim, elapsed);
  const glowColor = activeAnim === "glow" ? textColor : frame.shadowColor;
  const canBatch = glowColor && !textGradient;

  if (canBatch) {
    const jobs = [];
    lines.forEach((line, i) => {
      const f = ease(elapsed, introEnd + i * perLine, lineFadeDur);
      if (f <= 0) return;
      jobs.push({ text: line, x: cxCenter, y: startY + i * lineHeight + fontPx, font: quoteFont, align: "center", fillStyle: textColor });
    });
    if (jobs.length) drawGlowBatch(cv, cx, s, jobs, glowColor, frame.shadowBlur);
  } else {
    const revealStyle = getRevealStyle(s);
    lines.forEach((line, i) => {
      const f = ease(elapsed, introEnd + i * perLine, lineFadeDur);
      if (f <= 0) return;
      const { dx, dy } = revealOffset(revealStyle, f, 12 * SCALE);
      drawAnimatedText(cx, line, cxCenter + dx, startY + i * lineHeight + fontPx + dy, textColor, quoteFont, fontPx, activeAnim, elapsed, "center", f, textGradient, depthShadow);
    });
  }

  const authorFade = ease(elapsed, authorStart, authorFadeDur);
  if (authorFade > 0 && s.author) {
    const authorY = startY + lines.length * lineHeight + gap + authorFontPx;
    const authText = s.author.toUpperCase();
    cx.save();
    cx.font = authorFont;
    const aw = cx.measureText(authText).width;
    const lw = 26 * SCALE, gapW = 10 * SCALE;
    cx.strokeStyle = textColor; cx.globalAlpha = authorFade * 0.25; cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(cxCenter - aw / 2 - gapW - lw, authorY - authorFontPx * 0.35);
    cx.lineTo(cxCenter - aw / 2 - gapW, authorY - authorFontPx * 0.35);
    cx.moveTo(cxCenter + aw / 2 + gapW, authorY - authorFontPx * 0.35);
    cx.lineTo(cxCenter + aw / 2 + gapW + lw, authorY - authorFontPx * 0.35);
    cx.stroke();
    cx.restore();
    drawAnimatedText(cx, authText, cxCenter, authorY, textColor, authorFont, authorFontPx, activeAnim, elapsed, "center", authorFade * 0.85, textGradient, depthShadow);
  }
}

// Logo.jsx bileşeninin ("'#" üstte yan yana, altında küçük "MEVZU") canvas karşılığı —
// video render'larda tek satır "❝MEVZU" yazılıyordu, gerçek logoyla uyuşmuyordu.
export function drawLogo(cx, x, y, color, scale) {
  cx.save();
  cx.globalAlpha = 0.9;
  cx.fillStyle = color;
  cx.textBaseline = "alphabetic";
  const apFont = `400 ${Math.round(16 * scale)}px Georgia,serif`;
  const hashFont = `700 ${Math.round(21 * scale)}px sans-serif`;
  cx.font = apFont;
  const apW = cx.measureText("'").width;
  const rowBaseline = y + 21 * scale;
  cx.textAlign = "left";
  cx.fillText("'", x, rowBaseline - 2 * scale);
  cx.font = hashFont;
  cx.fillText("#", x + apW + 1 * scale, rowBaseline);
  const hashW = cx.measureText("#").width;
  const rowW = apW + 1 * scale + hashW;

  cx.font = `700 ${Math.round(10 * scale)}px sans-serif`;
  cx.letterSpacing = `${3.5 * scale}px`;
  const label = "MEVZU";
  const labelW = cx.measureText(label).width;
  cx.fillText(label, x + rowW / 2 - labelW / 2, rowBaseline + 4 * scale + 10 * scale);
  cx.letterSpacing = "0px";
  cx.restore();
}

// glow/neon aktifken her satır kendi shadowBlur pasosunu ayrı ayrı çiziyordu — maliyet
// satır sayısıyla orantılı büyüyüp uzun sözlerde (çok satırlı kartlarda) video kaydını
// yavaşlatıyordu. Bunun yerine satırları önce görünmez bir katmana düz renkle çiziyor,
// sonra o katmanı SABİT sayıda (satır sayısından bağımsız) shadowBlur pasosuyla ana
// canvas'a basıyoruz.
const glowCanvasCache = new WeakMap();
function getGlowCanvas(s, w, h) {
  let entry = glowCanvasCache.get(s);
  if (!entry || entry.w !== w || entry.h !== h) {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    entry = { canvas, ctx: canvas.getContext("2d"), w, h };
    glowCanvasCache.set(s, entry);
  }
  return entry;
}

export function drawGlowBatch(cv, cx, s, jobs, glowColor, shadowBlur) {
  const { canvas: gc, ctx: gcx } = getGlowCanvas(s, cv.width, cv.height);
  gcx.clearRect(0, 0, cv.width, cv.height);
  jobs.forEach(({ text, x, y, font, align, fillStyle }) => {
    gcx.font = font; gcx.textAlign = align; gcx.textBaseline = "alphabetic";
    gcx.fillStyle = fillStyle;
    gcx.fillText(text, x, y);
  });
  cx.save();
  cx.shadowOffsetY = 0;
  cx.shadowColor = glowColor;
  cx.shadowBlur = shadowBlur * 1.8;
  cx.drawImage(gc, 0, 0);
  cx.shadowBlur = shadowBlur;
  cx.drawImage(gc, 0, 0);
  cx.shadowBlur = 0;
  cx.drawImage(gc, 0, 0);
  cx.restore();
}

// Otomatik video her seferinde aynı "yukarıdan aşağı süzülme" ile belirmesin diye
// giriş yönünü video başına bir kere rastgele seçip (aynı state için tüm karelerde
// sabit kalsın diye) önbelleğe alıyoruz.
const revealStyleCache = new WeakMap();
const REVEAL_STYLES = ["fromTop", "fromBottom", "fromLeft", "fromRight", "fade"];
export function getRevealStyle(s) {
  let style = revealStyleCache.get(s);
  if (!style) {
    style = REVEAL_STYLES[Math.floor(Math.random() * REVEAL_STYLES.length)];
    revealStyleCache.set(s, style);
  }
  return style;
}
export function revealOffset(style, f, dist) {
  const amt = (1 - f) * dist;
  switch (style) {
    case "fromTop": return { dx: 0, dy: -amt };
    case "fromBottom": return { dx: 0, dy: amt };
    case "fromLeft": return { dx: -amt, dy: 0 };
    case "fromRight": return { dx: amt, dy: 0 };
    default: return { dx: 0, dy: 0 };
  }
}

export function wrapLines(cx, text, maxWidth) {
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

// wrapLines her satırı ölçmek için birden çok measureText çağırıyor — bunu video
// kaydının rAF döngüsünde (saniyede ~30 kez) yeniden hesaplamak gereksiz CPU yükü
// yaratıp kare düşürüyordu (izlerken takılma). Aynı state nesnesi + font + genişlik
// için sonucu bir kere hesaplayıp önbelleğe alıyoruz.
const linesCache = new WeakMap();
export function wrapLinesCached(cx, s, text, maxWidth) {
  const key = `${text}|${cx.font}|${maxWidth}`;
  const hit = linesCache.get(s);
  if (hit && hit.key === key) return hit.value;
  const value = wrapLines(cx, text, maxWidth);
  linesCache.set(s, { key, value });
  return value;
}
