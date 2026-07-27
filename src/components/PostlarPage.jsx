import { useState } from "react";
import { Download, Trash2, ImageOff } from "lucide-react";
import { TEMALAR } from "../utils/tema";

export default function PostlarPage({ tema, onBack }) {
  const T = TEMALAR[tema];
  const [postlar, setPostlar] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mevzu_postlar") || "[]"); }
    catch { return []; }
  });

  const sil = (id) => {
    const yeni = postlar.filter(p => p.id !== id);
    setPostlar(yeni);
    localStorage.setItem("mevzu_postlar", JSON.stringify(yeni));
  };

  const indir = (p) => {
    const link = document.createElement("a");
    link.download = `mevzu-${p.id}.png`;
    link.href = p.img;
    link.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Üst bar */}
      <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>Postlarım</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: T.fainter, letterSpacing: 2, textTransform: "uppercase" }}>{postlar.length} post</span>
      </div>

      {postlar.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "65vh", gap: 14 }}>
          <ImageOff size={52} color={T.border} strokeWidth={1.2} />
          <p style={{ fontSize: 13, color: T.faint, margin: 0 }}>Henüz indirilmiş post yok</p>
          <p style={{ fontSize: 10, color: T.fainter, margin: 0, letterSpacing: 1 }}>Kart oluştur ve "Kartı İndir" e bas</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12, padding: 16 }}>
          {postlar.map(p => (
            <div key={p.id} style={{ borderRadius: 14, overflow: "hidden", background: T.bg2, border: `1px solid ${T.border}` }}>
              <img src={p.img} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              <div style={{ padding: "8px 10px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: T.faint, letterSpacing: 1 }}>
                  {new Date(p.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => indir(p)} style={{ background: "none", border: "none", cursor: "pointer", color: T.gold, display: "flex" }}>
                    <Download size={15} />
                  </button>
                  <button onClick={() => sil(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.fainter, display: "flex" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
