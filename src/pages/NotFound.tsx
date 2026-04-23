import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  const { lang } = useLang();
  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-24 text-center">
        <p className="text-8xl mb-6">🔍</p>
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-8">{lang==="fr"?"Cette page n'existe pas.":"This page doesn't exist."}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90">
          {lang==="fr"?"Retour à l'accueil":"Back to Home"}
        </Link>
      </main><Footer/></div>
  );
}
