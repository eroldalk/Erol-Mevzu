import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { COLORS, ICON_CATS, FONT_PRESETS } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import IconModal from "./IconModal";

function F({ label, children, faint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: faint }}>{label}</label>
      {children}
    </div>
  );
}

function IconPreview({ s }) {
  if (s.iconMode === "emoji") return <span style={{ fontSize: 22 }}>{s.emoji}</span>;
  const all = Object.values(ICON_CATS).flat();
  const f = all.find((i) => i.n === s.svgIcon);
  if (!f) return null;
  const IC = f.C;
  return <IC size={22} color={s.iconColor || s.color.text} strokeWidth={1.5} />;
}

export default function Panel({ s, setS, tema, showAnim = false, afterDownload = null, splitFields = false, onDownload, onCopy }) {
  const T = TEMALAR[tema];
  const [iconOpen, setIconOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!onCopy) return;
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [rgb, setRgb] = useState({ r: 247, g: 243, b: 236 });
  const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  const rgbBg = `rgb(${rgb.r},${rgb.g},${rgb.b})`;

  const inp = {
    background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8,
    color: T.text, fontSize: 13, padding: "10px 12px", outline: "none",
    width: "100%", fontFamily: "inherit",
  };

  const activeBtn = (active) => ({
    flex: 1,
    background: active ? `rgba(${T.gr},.06)` : T.bg2,
    border: `1px solid ${active ? T.gold : T.border}`,
    borderRadius: 10,
    color: active ? T.gold : T.faint,
    fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
    padding: "10px 4px", cursor: "pointer", fontFamily: "inherit",
  });

  const sizeBtn = (active) => ({
    flex: 1,
    background: T.bg2,
    border: `1px solid ${active ? T.gold : T.border}`,
    borderRadius: 8,
    color: active ? T.gold : T.faint,
    fontSize: 10, padding: "8px 2px", cursor: "pointer", fontFamily: "inherit",
  });

  const toggleBtn = (active) => ({
    width: "100%",
    background: active ? `rgba(${T.gr},.08)` : T.bg2,
    border: `1px solid ${active ? T.gold : T.border}`,
    borderRadius: 8,
    color: active ? T.gold : T.faint,
    fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
    padding: "9px 0", cursor: "pointer", fontFamily: "inherit",
  });

  const downloadRow = (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={onDownload}
        style={{
          flex: 3, padding: "13px 0", borderRadius: 12, cursor: "pointer",
          background: `linear-gradient(135deg,${T.gold},#a07830)`,
          border: "none", color: "#fff", fontSize: 12, fontWeight: 700,
          letterSpacing: 3, textTransform: "uppercase", fontFamily: "inherit",
          boxShadow: `0 2px 12px rgba(${T.gr},.25)`,
        }}
      >
        ↓ Kartı İndir
      </button>
      {onCopy && (
        <button
          onClick={handleCopy}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 12, cursor: "pointer",
            background: copied ? "#2d6a4f" : T.bg3,
            border: `1px solid ${copied ? "#52b788" : T.border}`,
            color: copied ? "#b7e4c7" : T.muted,
            fontSize: 11, fontWeight: 700, fontFamily: "inherit",
            transition: "all .2s",
          }}
        >
          {copied ? "✓" : "⎘"}
        </button>
      )}
    </div>
  );

  const fieldsLeft = (
    <>
      <F label="Düzen" faint={T.faint}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["a", "A · Minimal"], ["b", "B · Klasik"], ["c", "C · Magazin"]].map(([l, n]) => (
            <button key={l} onClick={() => setS((p) => ({ ...p, layout: l }))} style={activeBtn(s.layout === l)}>{n}</button>
          ))}
        </div>
      </F>

      <F label="Söz" faint={T.faint}>
        <textarea value={s.quote} rows={3} onChange={(e) => setS((p) => ({ ...p, quote: e.target.value }))} style={{ ...inp, resize: "none" }} />
      </F>

      <F label="Yazar" faint={T.faint}>
        <input value={s.author} onChange={(e) => setS((p) => ({ ...p, author: e.target.value }))} style={inp} />
      </F>

      <F label="Yazı Boyutu" faint={T.faint}>
        <div style={{ display: "flex", gap: 6 }}>
          {[[16, "XS"], [20, "S"], [26, "M"], [32, "L"], [38, "XL"]].map(([v, n]) => (
            <button key={v} onClick={() => setS((p) => ({ ...p, fontSize: v }))} style={sizeBtn(s.fontSize === v)}>{n}</button>
          ))}
        </div>
      </F>

      <F label="Yazı Fontu" faint={T.faint}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {Object.entries(FONT_PRESETS).map(([key, f]) => {
            const active = (s.fontStyle || "serif-italic") === key;
            return (
              <button key={key} onClick={() => setS((p) => ({ ...p, fontStyle: key }))} style={{
                background: active ? `rgba(${T.gr},.08)` : T.bg2,
                border: `1px solid ${active ? T.gold : T.border}`,
                borderRadius: 8, color: active ? T.gold : T.faint,
                fontSize: 10, fontFamily: f.family, fontStyle: f.style, fontWeight: f.weight,
                padding: "10px 4px", cursor: "pointer",
              }}>{f.label}</button>
            );
          })}
        </div>
      </F>

      <F label="Üst Etiket (boş = gizli)" faint={T.faint}>
        <input value={s.tag} placeholder="Günün Sözü..." onChange={(e) => setS((p) => ({ ...p, tag: e.target.value }))} style={inp} />
      </F>

      {s.layout === "c" && (
        <F label="Kategori" faint={T.faint}>
          <input value={s.cat} placeholder="Eğitim, Ekonomi..." onChange={(e) => setS((p) => ({ ...p, cat: e.target.value }))} style={inp} />
        </F>
      )}
    </>
  );

  const fieldsRight = (
    <>
      <F label="Gradient Metin Rengi" faint={T.faint}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setS((p) => ({ ...p, textGradient: { ...p.textGradient, enabled: !p.textGradient?.enabled } }))}
            style={toggleBtn(s.textGradient?.enabled)}
          >
            {s.textGradient?.enabled ? "✦ Gradient Açık" : "· Gradient Kapalı"}
          </button>
          {s.textGradient?.enabled && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={s.textGradient.from} onChange={(e) => setS((p) => ({ ...p, textGradient: { ...p.textGradient, from: e.target.value } }))}
                style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg2, cursor: "pointer", padding: 3 }} />
              <span style={{ fontSize: 10, color: T.faint }}>→</span>
              <input type="color" value={s.textGradient.to} onChange={(e) => setS((p) => ({ ...p, textGradient: { ...p.textGradient, to: e.target.value } }))}
                style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg2, cursor: "pointer", padding: 3 }} />
            </div>
          )}
        </div>
      </F>

      <F label="Gölge & Derinlik" faint={T.faint}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => setS((p) => ({ ...p, textShadow: { ...p.textShadow, enabled: !p.textShadow?.enabled } }))}
            style={toggleBtn(s.textShadow?.enabled)}
          >
            {s.textShadow?.enabled ? "✦ Gölge Açık" : "· Gölge Kapalı"}
          </button>
          {s.textShadow?.enabled && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min={0} max={100} value={s.textShadow.intensity} onChange={(e) => setS((p) => ({ ...p, textShadow: { ...p.textShadow, intensity: +e.target.value } }))} style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: T.faint, width: 28, textAlign: "right" }}>{s.textShadow.intensity}</span>
            </div>
          )}
        </div>
      </F>

      <F label="Arka Plan — Hazır" faint={T.faint}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => setS((p) => ({ ...p, color: c }))} style={{
              height: 34, borderRadius: 8, background: c.bg, cursor: "pointer",
              border: `2px solid ${s.color.bg === c.bg ? T.gold : c.dark ? "#333" : "transparent"}`,
              transform: s.color.bg === c.bg ? "scale(1.08)" : "scale(1)", transition: "all .15s", position: "relative",
            }}>
              {s.color.bg === c.bg && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(0,0,0,.35)", fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </F>

      <F label="Özel RGB" faint={T.faint}>
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: rgbBg, border: `1px solid ${T.border}`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: T.faint }}>Kaydır → Uygula</span>
          </div>
          {[["R", "#ff6b6b", "r"], ["G", "#6bff8a", "g"], ["B", "#6b9fff", "b"]].map(([l, c, k]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: c, width: 12 }}>{l}</span>
              <input type="range" min={0} max={255} value={rgb[k]} onChange={(e) => setRgb((p) => ({ ...p, [k]: +e.target.value }))} style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: T.faint, width: 28, textAlign: "right" }}>{rgb[k]}</span>
            </div>
          ))}
          <button
            onClick={() => setS((p) => ({ ...p, color: { bg: rgbBg, text: lum > 140 ? "#1a1208" : "#f5f0e8", dark: lum <= 140 } }))}
            style={{ background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 8, color: T.gold, fontSize: 10, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", padding: 9, cursor: "pointer", fontFamily: "inherit" }}
          >✦ Uygula</button>
        </div>
      </F>

      <F label="Simge" faint={T.faint}>
        <button onClick={() => setIconOpen(true)} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconPreview s={s} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 11, color: T.muted }}>{s.iconMode === "emoji" ? "Emoji" : "SVG İkon"} · seç veya değiştir</span>
              <span style={{ fontSize: 9, color: T.faint, letterSpacing: 1 }}>{s.iconMode === "emoji" ? s.emoji : s.svgIcon}</span>
            </div>
          </div>
          <ChevronRight size={16} color={T.faint} />
        </button>
        <button
          onClick={() => setS((p) => ({ ...p, iconHidden: !p.iconHidden }))}
          style={{
            background: s.iconHidden ? `rgba(${T.gr},.08)` : T.bg2,
            border: `1px solid ${s.iconHidden ? T.gold : T.border}`,
            borderRadius: 8, color: s.iconHidden ? T.gold : T.muted,
            fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
            padding: "8px 0", cursor: "pointer", fontFamily: "inherit", width: "100%",
          }}
        >
          {s.iconHidden ? "✦ Simgeyi Göster" : "✕ Simgeyi Kaldır"}
        </button>
      </F>

      {s.iconMode === "svg" && !s.iconHidden && (
        <F label="SVG İkon Rengi" faint={T.faint}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={s.iconColor || s.color.text} onChange={(e) => setS((p) => ({ ...p, iconColor: e.target.value }))}
              style={{ flex: 1, height: 40, borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg2, cursor: "pointer", padding: 3 }} />
            <button onClick={() => setS((p) => ({ ...p, iconColor: "" }))}
              style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.muted, fontSize: 10, padding: "0 14px", height: 40, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Otomatik
            </button>
          </div>
        </F>
      )}

      {!s.iconHidden && <>
        <F label={`Simge Boyutu — ${s.iconSize}px`} faint={T.faint}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="range" min={60} max={300} value={s.iconSize} onChange={(e) => setS((p) => ({ ...p, iconSize: +e.target.value }))} style={{ flex: 1 }} />
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setS((p) => ({ ...p, iconSize: Math.max(60, p.iconSize - 10) }))} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <button onClick={() => setS((p) => ({ ...p, iconSize: Math.min(300, p.iconSize + 10) }))} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        </F>

        <F label={`Simge Opaklığı — %${Math.round(s.iconOpacity * 100)}`} faint={T.faint}>
          <input type="range" min={5} max={60} value={Math.round(s.iconOpacity * 100)} onChange={(e) => setS((p) => ({ ...p, iconOpacity: +e.target.value / 100 }))} style={{ width: "100%" }} />
        </F>
      </>}
    </>
  );

  const animBlock = showAnim && (
    <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <span style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>Animasyon</span>

        <F label="Arka Plan" faint={T.faint}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              ["none",   "· Yok"],
              ["aurora", "≈ Aurora"],
              ["plasma", "◎ Plazma"],
              ["stars",  "✦ Yıldız"],
              ["rings",  "○ Halka"],
              ["rain",   "║ Yağmur"],
              ["waves",  "≋ Dalga"],
              ["fire",   "△ Kor"],
              ["nebula", "✧ Nebula"],
              ["geo",    "⊞ Izgara"],
              ["sparks", "✸ Kıvılcım"],
            ].map(([v, label]) => (
              <button key={v} onClick={() => setS(p => ({ ...p, bgAnim: v }))} style={{
                background: (s.bgAnim||"none") === v ? `rgba(${T.gr},.08)` : T.bg2,
                border: `1px solid ${(s.bgAnim||"none") === v ? T.gold : T.border}`,
                borderRadius: 8, color: (s.bgAnim||"none") === v ? T.gold : T.faint,
                fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                padding: "9px 4px", cursor: "pointer", fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
        </F>

        <F label="Yazı Efekti" faint={T.faint}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              ["none",    "· Yok"],
              ["glow",    "☼ Işıltı"],
              ["float",   "↑ Süzülme"],
              ["shimmer", "✷ Parıltı"],
              ["glitch",  "▒ Bozulma"],
              ["pulse",   "◉ Nabız"],
              ["neon",    "⚡ Neon"],
              ["shake",   "≀ Sarsıntı"],
              ["bounce",  "● Zıplama"],
              ["flicker", "⊘ Titreme"],
              ["zoom",    "⊕ Büyüme"],
            ].map(([v, label]) => (
              <button key={v} onClick={() => setS(p => ({ ...p, textAnim: v }))} style={{
                background: (s.textAnim||"none") === v ? `rgba(${T.gr},.08)` : T.bg2,
                border: `1px solid ${(s.textAnim||"none") === v ? T.gold : T.border}`,
                borderRadius: 8, color: (s.textAnim||"none") === v ? T.gold : T.faint,
                fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                padding: "9px 4px", cursor: "pointer", fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
        </F>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: splitFields ? 900 : 520, display: "flex", flexDirection: "column", gap: 14 }}>
      {downloadRow}
      {afterDownload}
      {splitFields ? (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>{fieldsLeft}</div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>{fieldsRight}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fieldsLeft}
          {fieldsRight}
        </div>
      )}
      {animBlock}
      <IconModal open={iconOpen} tema={tema} onClose={() => setIconOpen(false)} s={s} onSelect={(sel) => setS((p) => ({ ...p, ...sel, iconHidden: false }))} />
    </div>
  );
}
