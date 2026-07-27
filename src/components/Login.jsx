import { useState } from "react";

const KULLANICILAR = [
  { ad: "mevzu",   sifre: "123456" },
  { ad: "erol",   sifre: "123456" },
  { ad: "olacak", sifre: "123456" },
];

export default function Login({ onGiris }) {
  const [ad, setAd] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleGonder = (e) => {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    setTimeout(() => {
      if (KULLANICILAR.some(k => k.ad === ad && k.sifre === sifre)) {
        localStorage.setItem("mevzu_auth", "1");
        localStorage.setItem("mevzu_user", ad);
        onGiris();
      } else {
        setHata("Kullanıcı adı veya şifre hatalı.");
        setYukleniyor(false);
      }
    }, 600);
  };

  const inp = {
    background: "#1c1c1c", border: "1px solid #282828", borderRadius: 10,
    color: "#f0f0f0", fontSize: 14, padding: "12px 14px", outline: "none",
    width: "100%", fontFamily: "inherit", transition: "border .2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse 70% 50% at 50% 10%,rgba(201,168,76,.07) 0%,transparent 65%),#141414",
      padding: "24px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 38, color: "#c9a84c", lineHeight: 1 }}>'</span>
          <span style={{ fontSize: 46, fontWeight: 700, color: "#c9a84c", lineHeight: 1 }}>#</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 7, color: "#c9a84c" }}>MEVZU</span>
        <span style={{ fontSize: 9, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginTop: 2 }}>Günün Nabzına Söz</span>
      </div>

      {/* Form */}
      <form onSubmit={handleGonder} style={{
        width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14,
        background: "#1a1a1a", border: "1px solid #242424", borderRadius: 18, padding: "28px 24px",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#c9a84c", textTransform: "uppercase", textAlign: "center", margin: 0 }}>
          Giriş Yap
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#555" }}>Kullanıcı Adı</label>
          <input
            value={ad} onChange={e => setAd(e.target.value)}
            placeholder="kullanıcı adı"
            autoComplete="username"
            style={inp}
            onFocus={e => e.target.style.borderColor = "#c9a84c"}
            onBlur={e => e.target.style.borderColor = "#282828"}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#555" }}>Şifre</label>
          <input
            type="password" value={sifre} onChange={e => setSifre(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={inp}
            onFocus={e => e.target.style.borderColor = "#c9a84c"}
            onBlur={e => e.target.style.borderColor = "#282828"}
          />
        </div>

        {hata && (
          <p style={{ fontSize: 11, color: "#e07070", textAlign: "center", margin: 0 }}>{hata}</p>
        )}

        <button type="submit" disabled={yukleniyor} style={{
          marginTop: 4, padding: "13px 0", borderRadius: 10, cursor: yukleniyor ? "not-allowed" : "pointer",
          background: yukleniyor ? "#2a2418" : "linear-gradient(135deg,#c9a84c,#a07830)",
          border: "none", color: yukleniyor ? "#c9a84c" : "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
          fontFamily: "inherit", transition: "all .2s",
          boxShadow: yukleniyor ? "none" : "0 2px 12px rgba(201,168,76,.2)",
        }}>
          {yukleniyor ? "Giriş yapılıyor..." : "✦ Giriş"}
        </button>
      </form>
    </div>
  );
}
