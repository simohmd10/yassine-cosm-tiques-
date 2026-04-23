import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useLang } from "@/context/LanguageContext";

export default function Wishlist() {
  const { items } = useWishlist();
  const { lang } = useLang();
  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-10">
        <h1 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary"/>{lang==="fr"?"Ma liste de souhaits":"My Wishlist"}
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"/>
            <p className="font-display text-lg text-muted-foreground mb-4">{lang==="fr"?"Votre liste est vide":"Your wishlist is empty"}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90">
              <ShoppingCart className="w-4 h-4"/>{lang==="fr"?"Voir les produits":"Shop Now"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </main><Footer/></div>
  );
}
