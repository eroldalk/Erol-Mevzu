import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { TEMALAR } from "../utils/tema";

export default function ProfilePage({ tema, onBack }) {
  const T = TEMALAR[tema];
  const kullanici = localStorage.getItem("mevzu_user") || "?";
  const [isim,     setIsim]     = useState(localStorage.getItem("mevzu_isim")    || "");
  const [soyisim,  setSoyisim]  = useState(localStorage.getItem("mevzu_soyisim") || "");
  const [eposta,   setEposta]   = useState(localStorage.getItem("mevzu_eposta")  || "");
  const [foto,     setFoto]     = useState(localStorage.getItem("mevzu_foto")    || "");
  const [kaydedildi, setKaydedildi] = useState(false);
  const fileRef = useRef(null);

  const fotoSec = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const kaydet = () => {
    localStorage.setItem("mevzu_isim",    isim);
    localStorage.setItem("mevzu_soyisim", soyisim);
    localStorage.setItem("mevzu_eposta",  eposta);
    localStorage.setItem("mevzu_foto",    foto);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  const inp = {
    background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10,
    color: T.text, fontSize: 14, padding: "12px 14px", outline: "none",
    width: "100%", fontFamily: "inherit", transition: "border-color .2s",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 60 }}>

      {/* Üst bar */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: T.bg2, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>Profil Düzenle</span>
      </div>

      <div style={{ width: "100%", maxWidth: 440, padding: "32px 20px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.gold}`, background: `rgba(${T.gr},.1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {foto
                ? <img src={foto} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 36, fontWeight: 700, color: T.gold }}>{kullanici.charAt(0).toUpperCase()}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", background: T.gold, border: `2px solid ${T.bg}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={14} color={tema === "dark" ? "#141414" : "#fff"} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={fotoSec} style={{ display: "none" }} />

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text }}>
              {isim ? `${isim} ${soyisim}`.trim() : kullanici}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: T.faint, letterSpacing: 1 }}>@{kullanici}</p>
          </div>

          {foto && (
            <button onClick={() => setFoto("")} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, color: T.faint, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", padding: "5px 14px" }}>
              Fotoğrafı Kaldır
            </button>
          )}
        </div>

        {/* Ayırıcı */}
        <div style={{ borderTop: `1px solid ${T.border}` }} />

        {/* Form alanları */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>İsim</label>
              <input value={isim} onChange={e => setIsim(e.target.value)} placeholder="İsminiz" style={inp}
                onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>Soyisim</label>
              <input value={soyisim} onChange={e => setSoyisim(e.target.value)} placeholder="Soyisminiz" style={inp}
                onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>E-posta Adresi</label>
            <input type="email" value={eposta} onChange={e => setEposta(e.target.value)} placeholder="ornek@email.com" style={inp}
              onFocus={e => e.target.style.borderColor = T.gold} onBlur={e => e.target.style.borderColor = T.border} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: T.faint }}>Kullanıcı Adı</label>
            <input value={kullanici} disabled style={{ ...inp, color: T.faint, cursor: "not-allowed" }} />
          </div>
        </div>

        {/* Kaydet */}
        <button onClick={kaydet} style={{
          padding: "14px 0", borderRadius: 12, cursor: "pointer",
          background: kaydedildi ? "transparent" : `linear-gradient(135deg,${T.gold},#a07830)`,
          border: `1px solid ${kaydedildi ? "#4a8a4a" : "transparent"}`,
          color: kaydedildi ? "#6ac96a" : "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
          fontFamily: "inherit", transition: "all .3s",
          boxShadow: kaydedildi ? "none" : `0 2px 14px rgba(${T.gr},.22)`,
        }}>
          {kaydedildi ? "✓ Kaydedildi" : "✦ Kaydet"}
        </button>

      </div>
    </div>
  );
}
