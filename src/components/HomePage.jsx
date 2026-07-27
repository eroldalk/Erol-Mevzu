import { Globe, Smartphone, Images, LogOut, Sun, Moon } from "lucide-react";
import { TEMALAR } from "../utils/tema";
import { useIsDesktop } from "../utils/hooks";

export default function HomePage({ tema, onToggleTema, onOpen, onCikis }) {
  const T = TEMALAR[tema];
  const isDesktop = useIsDesktop();
  const kullanici = localStorage.getItem("mevzu_user") || "?";
  const isim      = localStorage.getItem("mevzu_isim") || "";
  const soyisim   = localStorage.getItem("mevzu_soyisim") || "";
  const foto      = localStorage.getItem("mevzu_foto") || "";
  const goruntu   = isim ? `${isim} ${soyisim}`.trim() : kullanici;

  const CARDS = [
    { k: "square", IC: Globe,      t: "Kare Kart",  d: "Twitter · Instagram Post",  b: "1:1 · 1080×1080"  },
    { k: "reels",  IC: Smartphone, t: "Reels Kart", d: "Instagram Reels · TikTok",  b: "9:16 · 1080×1920" },
  ];

  /* ── Desktop ─────────────────────────────────────────────────── */
  if (isDesktop) {
    const sideBtn = (onClick, children, hover) => (
      <button
        onClick={onClick}
        onMouseEnter={e => e.currentTarget.style.borderColor = hover || T.gold}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        style={{
          background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10,
          color: T.muted, fontSize: 12, padding: "10px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit",
          transition: "border-color .2s", width: "100%",
        }}
      >{children}</button>
    );

    return (
      <div style={{
        display: "flex", minHeight: "100vh",
        background: `radial-gradient(ellipse 80% 60% at 70% 40%, rgba(${T.gr},.07) 0%, transparent 65%), ${T.bg}`,
      }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: 260, flexShrink: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
          padding: "48px 24px",
          background: T.bg2, borderRight: `1px solid ${T.border}`,
          position: "sticky", top: 0, height: "100vh",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: 32, color: T.gold, lineHeight: 1 }}>'</span>
              <span style={{ fontSize: 40, fontWeight: 700, color: T.gold, lineHeight: 1 }}>#</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 7, color: T.gold }}>MEVZU</span>
            <span style={{ fontSize: 7, letterSpacing: 3, color: T.faint, textTransform: "uppercase", marginTop: 2, textAlign: "center" }}>Günün Nabzına Söz</span>
          </div>

          {/* Avatar + isim */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              onClick={() => onOpen("profil")}
              style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: `2px solid ${T.gold}`, background: `rgba(${T.gr},.12)`, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {foto
                ? <img src={foto} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 24, fontWeight: 700, color: T.gold }}>{kullanici.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{goruntu}</div>
              {isim && <div style={{ fontSize: 9, color: T.faint, letterSpacing: 1, marginTop: 2 }}>@{kullanici}</div>}
            </div>
          </div>

          {/* Butonlar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {sideBtn(onToggleTema,
              <>{tema === "dark" ? <Sun size={14} color={T.muted} /> : <Moon size={14} color={T.muted} />}
              <span>{tema === "dark" ? "Açık Tema" : "Koyu Tema"}</span></>
            )}
            {sideBtn(() => onOpen("postlar"),
              <><Images size={14} color={T.muted} /><span>Postlarım</span></>
            )}
            {sideBtn(onCikis,
              <><LogOut size={14} color={T.faint} /><span style={{ color: T.faint }}>Çıkış Yap</span></>,
              "#e07070"
            )}
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "60px 80px", gap: 48,
        }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: T.text, margin: 0, letterSpacing: -0.5 }}>Alıntı Kartı Oluştur</h1>
            <p style={{ fontSize: 13, color: T.faint, margin: "10px 0 0", letterSpacing: 1 }}>Format seç ve oluşturmaya başla</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", maxWidth: 720 }}>
            {CARDS.map((c) => (
              <div
                key={c.k}
                onClick={() => onOpen(c.k)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = T.gold;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 16px 48px rgba(${T.gr},.14)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = T.border;
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20,
                  padding: "40px 32px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                  transition: "all .2s", textAlign: "center",
                }}
              >
                <div style={{ width: 80, height: 80, borderRadius: 20, background: `rgba(${T.gr},.1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.IC size={36} color={T.gold} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{c.t}</span>
                  <span style={{ fontSize: 12, color: T.faint }}>{c.d}</span>
                  <span style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", padding: "3px 12px", borderRadius: 20, background: `rgba(${T.gr},.1)`, color: T.gold, width: "fit-content", margin: "4px auto 0" }}>{c.b}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, color: T.faint, textAlign: "center", padding: "12px 20px", border: `1px dashed ${T.border}`, borderRadius: 10, maxWidth: 420, lineHeight: 1.8 }}>
            📲 Telefona yüklemek için tarayıcı menüsünden <strong style={{ color: T.muted }}>"Ana Ekrana Ekle"</strong> seçeneğini kullan
          </div>
        </div>
      </div>
    );
  }

  /* ── Mobile ───────────────────────────────────────────────────── */
  const iconBtn = {
    width: 38, height: 38, borderRadius: 10,
    background: T.bg2, border: `1px solid ${T.border}`,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "border-color .2s",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", gap: 36, padding: "80px 24px 48px",
      background: `radial-gradient(ellipse 70% 50% at 50% 10%,rgba(${T.gr},.07) 0%,transparent 65%),${T.bg}`,
      position: "relative",
    }}>

      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{goruntu}</span>
          {isim && <span style={{ fontSize: 9, color: T.faint, letterSpacing: 1 }}>@{kullanici}</span>}
        </div>
        <div
          onClick={() => onOpen("profil")}
          style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: `2px solid ${T.gold}`, background: `rgba(${T.gr},.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          {foto
            ? <img src={foto} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 18, fontWeight: 700, color: T.gold }}>{kullanici.charAt(0).toUpperCase()}</span>
          }
        </div>
        <button onClick={onToggleTema} style={iconBtn}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          {tema === "dark" ? <Sun size={17} color={T.muted} /> : <Moon size={17} color={T.muted} />}
        </button>
        <button onClick={() => onOpen("postlar")} style={iconBtn}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          <Images size={17} color={T.muted} />
        </button>
        <button onClick={onCikis} style={iconBtn}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#e07070"}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          <LogOut size={16} color={T.faint} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 40, color: T.gold, lineHeight: 1 }}>'</span>
          <span style={{ fontSize: 48, fontWeight: 700, color: T.gold, lineHeight: 1 }}>#</span>
        </div>
        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 7, color: T.gold }}>MEVZU</span>
        <span style={{ fontSize: 9, letterSpacing: 4, color: T.faint, textTransform: "uppercase", marginTop: 2 }}>Günün Nabzına Söz</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
        {CARDS.map((c) => (
          <div key={c.k} onClick={() => onOpen(c.k)}
            style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `rgba(${T.gr},.08)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <c.IC size={24} color={T.gold} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.t}</span>
              <span style={{ fontSize: 11, color: T.faint }}>{c.d}</span>
              <span style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, background: `rgba(${T.gr},.1)`, color: T.gold, marginTop: 2, width: "fit-content" }}>{c.b}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: T.faint, textAlign: "center", padding: "12px 18px", border: `1px dashed ${T.border}`, borderRadius: 10, maxWidth: 320, lineHeight: 1.7 }}>
        📲 Telefona yüklemek için tarayıcı menüsünden<br />
        <strong style={{ color: T.muted }}>"Ana Ekrana Ekle"</strong> seçeneğini kullan
      </div>
    </div>
  );
}