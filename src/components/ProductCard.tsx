import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLang } from "@/context/LanguageContext";
import type { Product } from "@/data/products";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatCurrency";

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { lang, t } = useLang();

  const name    = lang === "fr" ? (product.nameFr || product.name)   : product.name;
  const badge   = lang === "fr" ? (product.badgeFr || product.badge) : product.badge;
  const inWish  = isInWishlist(product.id);
  const outOfStock = product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product, 1);
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-green-50 overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300">
        
        {/* Image */}
        <div className="relative aspect-square bg-green-50 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">💊</div>
          )}

          {badge && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-destructive bg-white px-3 py-1 rounded-full border border-destructive/30">
                {t("outOfStock")}
              </span>
            </div>
          )}

          <button onClick={e=>{ e.preventDefault(); toggleWishlist(product); }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${inWish ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary"}`}>
            <Heart className={`w-4 h-4 ${inWish ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-primary font-medium mb-1 capitalize">{product.category}</p>
          <h3 className="font-display font-semibold text-sm text-foreground mb-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>

          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-foreground">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through ml-1.5">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            <button onClick={handleAdd} disabled={outOfStock}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${outOfStock ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
