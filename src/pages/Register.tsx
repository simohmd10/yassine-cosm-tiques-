import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Register() {
  const { signUp } = useAuth();
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signUp(email, password, name);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate("/account");
  };

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-16 max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold">{t("register")}</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{lang==="fr"?"Nom complet":"Full Name"}</label>
            <input value={name} onChange={e=>setName(e.target.value)} required
              className="h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{t("email")}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">{lang==="fr"?"Mot de passe":"Password"}</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}
              className="h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading ? "..." : t("register")}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {lang==="fr"?"Déjà un compte ?":"Already have an account?"}{" "}
            <Link to="/login" className="text-primary hover:underline">{t("login")}</Link>
          </p>
        </form>
      </main><Footer/></div>
  );
}
