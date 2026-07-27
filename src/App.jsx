import { useState } from "react";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import EditorPage from "./components/EditorPage";
import ReelsPage from "./components/ReelsPage";
import ProfilePage from "./components/ProfilePage";
import PostlarPage from "./components/PostlarPage";

export default function App() {
  const [girisYapildi, setGirisYapildi] = useState(
    () => localStorage.getItem("mevzu_auth") === "1"
  );
  const [page, setPage] = useState("home");
  const [tema, setTema] = useState(
    () => localStorage.getItem("mevzu_tema") || "dark"
  );

  const toggleTema = () => {
    const yeni = tema === "dark" ? "light" : "dark";
    setTema(yeni);
    localStorage.setItem("mevzu_tema", yeni);
  };

  const handleCikis = () => {
    localStorage.removeItem("mevzu_auth");
    localStorage.removeItem("mevzu_user");
    setGirisYapildi(false);
    setPage("home");
  };

  if (!girisYapildi) {
    return (
      <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#f0f0f0", WebkitTapHighlightColor: "transparent" }}>
        <Login onGiris={() => setGirisYapildi(true)} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", WebkitTapHighlightColor: "transparent" }}>
      {page === "home"    && <HomePage    tema={tema} onToggleTema={toggleTema} onOpen={setPage} onCikis={handleCikis} />}
      {page === "square"  && <EditorPage  tema={tema} onBack={() => setPage("home")} />}
      {page === "reels"   && <ReelsPage   tema={tema} onBack={() => setPage("home")} />}
      {page === "profil"  && <ProfilePage tema={tema} onBack={() => setPage("home")} />}
      {page === "postlar" && <PostlarPage tema={tema} onBack={() => setPage("home")} />}
    </div>
  );
}
