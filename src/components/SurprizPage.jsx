import { useState, useRef, useEffect } from "react";
import { DEFAULT, COLORS, ICON_CATS, EMOJI_CATS, FONT_PRESETS, MUSIC_LIBRARY, CAT_MUSIC_GENRE } from "../utils/constants";
import { TEMALAR } from "../utils/tema";
import { getRandomQuote, getQuoteHistory, markQuoteUsed } from "../utils/quotes";
import { BG_RENDERERS, renderAutoQuoteFrame } from "../utils/videoRender";
import Card from "./Card";

const LAYOUTS = ["a", "b", "c"];
const BG_ANIMS = ["none", "aurora", "plasma", "stars", "rings", "rain", "waves", "fire", "nebula", "geo", "sparks"];
const TEXT_ANIMS = ["none", "glow", "float", "shimmer", "glitch", "pulse", "neon", "shake", "bounce", "flicker", "zoom"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

function buildState(q) {
  const emojiPool = EMOJI_CATS[q.cat] || EMOJI_CATS.Sembol;
  const iconPool = ICON_CATS[q.cat] || ICON_CATS.Sembol;
  const useEmoji = Math.random() < 0.5;

  return {
    ...DEFAULT,
    layout: rand(LAYOUTS),
    color: rand(COLORS),
    iconMode: useEmoji ? "emoji" : "svg",
    emoji: rand(emojiPool),
    svgIcon: rand(iconPool).n,
    iconSize: 120 + Math.floor(Math.random() * 80),
    iconOpacity: +(0.08 + Math.random() * 0.14).toFixed(2),
    quote: q.quote,
    author: q.author,
    tag: q.cat,
    cat: q.cat,
    fontSize: rand([22, 26, 28, 32]),
    fontStyle: rand(Object.keys(FONT_PRESETS)),
    bgAnim: rand(BG_ANIMS),
    textAnim: rand(TEXT_ANIMS),
  };
}

export default function SurprizPage({ tema, onBack }) {
  const T = TEMALAR[tema];
  const [s, setS] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [kalan, setKalan] = useState(null);
  const [toplam, setToplam] = useState(null);
  const [gecmisAcik, setGecmisAcik] = useState(false);
  const [gecmis, setGecmis] = useState([]);
  const [boyut, setBoyut] = useState("kare");
  const [videoStatus, setVideoStatus] = useState("idle");
  const [videoCountdown, setVideoCountdown] = useState(3);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const cardRef = useRef(null);
  const videoRafRef = useRef(null);
  const portrait = boyut === "story";

  const karistir = async () => {
    setS(null);
    const q = await getRandomQuote();
    setCurrentQuote(q);
    setS(buildState(q));
    setKalan(q.poolRemaining);
    setToplam(q.poolTotal);
    if (gecmisAcik) setGecmis(getQuoteHistory());
  };

  const gecmisiAcKapat = () => {
    if (!gecmisAcik) setGecmis(getQuoteHistory());
    setGecmisAcik((v) => !v);
  };

  useEffect(() => { karistir(); }, []);

  const fixGradientForCapture = (doc) => {
    doc.querySelectorAll("[data-mevzu-gradient]").forEach((el) => {
      el.style.background = "none";
      el.style.webkitTextFillColor = "";
      el.style.color = el.getAttribute("data-mevzu-gradient-fallback") || "#000";
    });
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
    link.download = `mevzu-surpriz-${boyut}-${Date.now()}.png`;
    link.href = fullImg;
    link.click();

    if (currentQuote) {
      markQuoteUsed(currentQuote);
      setKalan((k) => (k !== null ? Math.max(0, k - 1) : k));
      if (gecmisAcik) setGecmis(getQuoteHistory());
    }
  };

  // Sözün kategorisine uygun tür(ler)den rastgele bir parça seçer — havuzda eşleşme
  // yoksa tüm kütüphaneden seçer.
  const pickMusicTrack = (cat) => {
    const genres = CAT_MUSIC_GENRE[cat];
    const pool = genres ? MUSIC_LIBRARY.filter((m) => genres.includes(m.genre)) : MUSIC_LIBRARY;
    return rand(pool.length ? pool : MUSIC_LIBRARY);
  };

  const videoSifirla = () => { setVideoStatus("idle"); setVideoUrl(null); setVideoProgress(0); };

  const videoOlustur = async () => {
    setVideoUrl(null);
    const q = await getRandomQuote();
    const state = buildState(q);
    const track = pickMusicTrack(q.cat);

    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = portrait ? 568 : 320;
    const cx = cv.getContext("2d");

    // Parçanın rastgele bir 10sn'lik bölümünü kullan — baştan başlaması şart değil
    const audioEl = document.createElement("audio");
    audioEl.crossOrigin = "anonymous";
    audioEl.src = track.url;
    let startOffset = 0;
    try {
      await new Promise((resolve, reject) => {
        audioEl.addEventListener("loadedmetadata", resolve, { once: true });
        audioEl.addEventListener("error", reject, { once: true });
        setTimeout(reject, 6000);
      });
      if (isFinite(audioEl.duration) && audioEl.duration > 13) {
        startOffset = 3 + Math.random() * (audioEl.duration - 13);
      }
    } catch { /* metadata alınamazsa parça baştan çalınır */ }

    setVideoStatus("countdown"); setVideoCountdown(3);
    await new Promise((resolve) => {
      let c = 3;
      const cd = setInterval(() => {
        c--; setVideoCountdown(c);
        if (c <= 0) { clearInterval(cd); resolve(); }
      }, 1000);
    });

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const canvasStream = cv.captureStream(30);
      let finalStream = canvasStream;
      try {
        audioEl.currentTime = startOffset;
        const audioCtx = new AudioContext();
        const src = audioCtx.createMediaElementSource(audioEl);
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);
        finalStream = new MediaStream([...canvasStream.getTracks(), ...dest.stream.getTracks()]);
      } catch { /* ses eklenemezse sessiz video */ }

      const rec = new MediaRecorder(finalStream, { mimeType });
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      const stopped = new Promise((resolve) => {
        rec.onstop = () => {
          cancelAnimationFrame(videoRafRef.current);
          audioEl.pause();
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      });

      setVideoStatus("recording"); setVideoProgress(0);
      rec.start();
      audioEl.play().catch(() => {});
      const DURATION = 10000;
      let rafStart = null;
      const bgRender = BG_RENDERERS[state.bgAnim || "none"] || BG_RENDERERS.none;
      const loop = (ts) => {
        if (!rafStart) rafStart = ts;
        const e = ts - rafStart;
        bgRender(cv, cx, state, e);
        renderAutoQuoteFrame(cv, cx, state, e);
        setVideoProgress(Math.min((e / DURATION) * 100, 100));
        if (e >= DURATION) { rec.stop(); return; }
        videoRafRef.current = requestAnimationFrame(loop);
      };
      videoRafRef.current = requestAnimationFrame(loop);

      const blob = await stopped;
      setVideoUrl(URL.createObjectURL(blob));
      setVideoStatus("done");

      try {
        const thumbCv = document.createElement("canvas");
        thumbCv.width = 300; thumbCv.height = 300;
        thumbCv.getContext("2d").drawImage(cv, 0, 0, 300, 300);
        const thumbImg = thumbCv.toDataURL("image/jpeg", 0.7);
        const mevcutlar = JSON.parse(localStorage.getItem("mevzu_postlar") || "[]");
        const yeni = [{ id: Date.now(), img: thumbImg, date: new Date().toISOString() }, ...mevcutlar].slice(0, 30);
        localStorage.setItem("mevzu_postlar", JSON.stringify(yeni));
      } catch { }

      markQuoteUsed(q);
      if (gecmisAcik) setGecmis(getQuoteHistory());
    } catch (err) {
      alert("Video oluşturulamadı. Chrome tarayıcı gereklidir.\n" + err.message);
      setVideoStatus("idle");
    }
  };

  const videoIndir = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl; a.download = `mevzu-otomatik-${boyut}-${Date.now()}.webm`; a.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: T.bg }}>
      <div style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", background: T.bg2, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, flexShrink: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.faint, fontSize: 22, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: T.gold }}>Sürpriz Kart</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[["kare", "1:1"], ["story", "9:16"]].map(([v, lbl]) => (
            <button key={v} onClick={() => setBoyut(v)} style={{
              background: boyut === v ? `rgba(${T.gr},.12)` : "none",
              border: `1px solid ${boyut === v ? T.gold : "transparent"}`, borderRadius: 6,
              padding: "3px 8px", cursor: "pointer", fontFamily: "inherit",
              fontSize: 9, color: boyut === v ? T.gold : T.faint, textTransform: "uppercase", letterSpacing: 2,
            }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24, padding: "32px 20px",
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(${T.gr},.05) 0%, transparent 70%), ${T.bg}`,
      }}>
        {s
          ? <Card s={s} cardRef={cardRef} portrait={portrait} />
          : <div style={{
              width: portrait ? "min(260px, calc(100vw - 40px))" : "min(500px, calc(100vw - 32px))",
              aspectRatio: portrait ? "9/16" : "1",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: T.faint, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            }}>Söz aranıyor...</div>
        }

        {kalan !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 120, height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(kalan / toplam) * 100}%`, background: T.gold, transition: "width .3s ease" }} />
            </div>
            <span style={{ fontSize: 9, color: T.faint, letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {kalan > 0 ? `${kalan} söz kaldı` : "tur tamamlandı ↺"}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 400 }}>
          <button onClick={karistir} disabled={!s} style={{
            flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10,
            padding: "13px 0", cursor: s ? "pointer" : "not-allowed", color: T.gold, fontFamily: "inherit",
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: s ? 1 : 0.5,
          }}>🎲 Yeniden Karıştır</button>
          <button onClick={handleDownload} disabled={!s} style={{
            flex: 1, background: `linear-gradient(135deg, ${T.gold}, #a07830)`, color: "#1a1200",
            border: "none", borderRadius: 10, padding: "13px 0", cursor: s ? "pointer" : "not-allowed",
            fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: s ? 1 : 0.5,
          }}>⬇ İndir</button>
        </div>

        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 8 }}>
          {videoStatus === "recording" && (
            <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: T.gold, width: `${videoProgress}%`, transition: "width .1s linear" }} />
            </div>
          )}
          {videoStatus === "idle" && (
            <button onClick={videoOlustur} disabled={!s} style={{
              background: "transparent", border: `1px solid ${T.gold}`, borderRadius: 10,
              padding: "13px 0", cursor: s ? "pointer" : "not-allowed", color: T.gold, fontFamily: "inherit",
              fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: s ? 1 : 0.5,
            }}>🎬 Otomatik Video Oluştur (10sn)</button>
          )}
          {videoStatus === "countdown" && (
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "11px 0", textAlign: "center", color: T.gold, fontSize: 22, fontWeight: 700 }}>{videoCountdown}</div>
          )}
          {videoStatus === "recording" && (
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 0", textAlign: "center", color: T.muted, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>
              Video oluşturuluyor — %{Math.round(videoProgress)}
            </div>
          )}
          {videoStatus === "done" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={videoIndir} style={{
                flex: 3, background: T.gold, color: "#1a1200", border: "none", borderRadius: 10,
                padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase",
              }}>⬇ Videoyu İndir</button>
              <button onClick={videoSifirla} style={{
                flex: 1, background: T.bg2, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10,
                padding: "11px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600,
              }}>↺</button>
            </div>
          )}
          {videoStatus === "idle" && (
            <div style={{ fontSize: 9, color: T.faint, textAlign: "center" }}>Chrome gerekli · söz, görsel efekt ve müzik otomatik seçilir</div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={gecmisiAcKapat} style={{
            background: "none", border: "none", cursor: "pointer", color: T.faint, fontFamily: "inherit",
            fontSize: 10, letterSpacing: 2, textTransform: "uppercase", padding: "4px 0",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            📜 Geçmiş Sözler {gecmisAcik ? "▲" : "▼"}
          </button>

          {gecmisAcik && (
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              {gecmis.length === 0 ? (
                <div style={{ padding: "18px 14px", textAlign: "center", fontSize: 10, color: T.faint, letterSpacing: 1 }}>
                  Henüz geçmiş yok
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {gecmis.map((g, i) => (
                    <div key={`${g.id}-${g.date}-${i}`} style={{
                      padding: "10px 14px",
                      borderBottom: i < gecmis.length - 1 ? `1px solid ${T.border}` : "none",
                      display: "flex", flexDirection: "column", gap: 3,
                    }}>
                      <span style={{ fontSize: 11, color: T.text, fontStyle: "italic" }}>
                        {g.quote.split("\n")[0]}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 9, color: T.faint, letterSpacing: 1 }}>{g.author}</span>
                        <span style={{ fontSize: 8, color: T.fainter, letterSpacing: 1 }}>
                          {new Date(g.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
