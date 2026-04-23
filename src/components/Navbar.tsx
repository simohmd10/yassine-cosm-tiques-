import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X, User, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function Navbar() {
  const { totalItems }  = useCart();
  const { count: wCount } = useWishlist();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/shop?search=${encodeURIComponent(search.trim())}`); setShowSearch(false); setSearch(""); }
  };

  const navLinks = [
    { to: "/",        label: t("home") },
    { to: "/shop",    label: t("shop") },
    { to: "/about",   label: t("about") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-green-100 shadow-sm">
      <div className="container-herb h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">iH</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">
            iherby<span className="text-primary">assine</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="h-9 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-40 md:w-52" />
              <button type="button" onClick={()=>setShowSearch(false)} className="p-2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button onClick={()=>setShowSearch(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Language */}
          <button onClick={()=>setLang(lang==="fr"?"en":"fr")}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:text-primary border border-border transition-colors">
            <Globe className="w-3 h-3" />
            {lang === "fr" ? "EN" : "FR"}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
            {wCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wCount}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{totalItems}</span>}
          </Link>

          {/* Account */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/account" className="p-2 text-muted-foreground hover:text-primary"><User className="w-5 h-5" /></Link>
              <button onClick={signOut} className="text-xs text-muted-foreground hover:text-destructive transition-colors">{t("logout")}</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {t("login")}
            </Link>
          )}

          {/* Mobile menu */}
          <button onClick={()=>setOpen(!open)} className="md:hidden p-2 text-muted-foreground">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-green-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={()=>setOpen(false)}
              className="block font-body text-sm text-foreground hover:text-primary py-1">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-border pt-3 flex items-center gap-3">
            <button onClick={()=>setLang(lang==="fr"?"en":"fr")} className="flex items-center gap-1 text-xs text-muted-foreground border border-border px-2 py-1 rounded">
              <Globe className="w-3 h-3" />{lang==="fr"?"EN":"FR"}
            </button>
            {user ? (
              <>
                <Link to="/account" onClick={()=>setOpen(false)} className="text-sm text-foreground hover:text-primary">{t("myAccount")}</Link>
                <button onClick={()=>{signOut();setOpen(false);}} className="text-sm text-destructive">{t("logout")}</button>
              </>
            ) : (
              <Link to="/login" onClick={()=>setOpen(false)} className="text-sm text-primary font-medium">{t("login")}</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
