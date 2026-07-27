import { useState } from "react";
import { ICON_CATS, EMOJI_CATS } from "../utils/constants";
import { TEMALAR } from "../utils/tema";

export default function IconModal({ open, tema, onClose, s, onSelect }) {
  const T = TEMALAR[tema];
  const [tab, setTab] = useState("emoji");
  const [cat, setCat] = useState("Gündem");

  if (!open) return null;

  const cats = tab === "emoji" ? EMOJI_CATS : ICON_CATS;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: T.bg2, borderRadius: "22px 22px 0 0", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: T.gold, textTransform: "uppercase" }}>Simge Seç</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.faint, fontSize: 24, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", padding: "10px 14px", gap: 8, borderBottom: `1px solid ${T.border}` }}>
          {[["emoji", "😊  Emoji"], ["svg", "✦  SVG İkon"]].map(([v, l]) => (
            <button key={v} onClick={() => { setTab(v); setCat(Object.keys(v === "emoji" ? EMOJI_CATS : ICON_CATS)[0]); }} style={{
              flex: 1, background: tab === v ? `rgba(${T.gr},.08)` : "none",
              border: `1px solid ${tab === v ? T.gold : T.border}`, borderRadius: 8,
              color: tab === v ? T.gold : T.faint, fontSize: 11, fontWeight: 600,
              padding: "9px 0", cursor: "pointer", fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>

        <div style={{ display: "flex", overflowX: "auto", padding: "8px 14px", gap: 6, borderBottom: `1px solid ${T.border}`, scrollbarWidth: "none" }}>
          {Object.keys(cats).map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{
              background: c === cat ? `rgba(${T.gr},.1)` : "none",
              border: `1px solid ${c === cat ? T.gold : T.border}`, borderRadius: 20,
              color: c === cat ? T.gold : T.faint, fontSize: 10, letterSpacing: 2,
              textTransform: "uppercase", padding: "6px 12px", cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
            }}>{c}</button>
          ))}
        </div>

        <div style={{ overflowY: "auto", padding: "12px 14px 36px" }}>
          {tab === "emoji" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 8 }}>
              {(EMOJI_CATS[cat] || []).map((em) => (
                <button key={em} onClick={() => { onSelect({ iconMode: "emoji", emoji: em }); onClose(); }} style={{
                  background: s.emoji === em && s.iconMode === "emoji" ? `rgba(${T.gr},.12)` : T.bg3,
                  border: `2px solid ${s.emoji === em && s.iconMode === "emoji" ? T.gold : T.border}`,
                  borderRadius: 8, fontSize: 20, height: 44, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{em}</button>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {(ICON_CATS[cat] || []).map(({ n, C: IC }) => (
                <button key={n} onClick={() => { onSelect({ iconMode: "svg", svgIcon: n }); onClose(); }} style={{
                  background: s.svgIcon === n && s.iconMode === "svg" ? `rgba(${T.gr},.12)` : T.bg3,
                  border: `2px solid ${s.svgIcon === n && s.iconMode === "svg" ? T.gold : T.border}`,
                  borderRadius: 8, height: 60, cursor: "pointer", display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: 4,
                }}>
                  <IC size={24} color={s.svgIcon === n && s.iconMode === "svg" ? T.gold : T.faint} strokeWidth={1.5} />
                  <span style={{ fontSize: 7, color: T.fainter, letterSpacing: 1, textTransform: "uppercase" }}>{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
