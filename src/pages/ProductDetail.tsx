import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { fetchProductReviews, submitReview } from "@/hooks/useOrders";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getRelatedProducts } from "@/lib/recommendations";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [qty, setQty] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<string|null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
  const related = useMemo(
    () => (product ? getRelatedProducts(product, safeAllProducts, 6) : []),
    [product, safeAllProducts]
  );

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => fetchProductReviews(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Produit introuvable</p></div>;

  const name        = lang === "fr" ? (product.nameFr || product.name) : product.name;
  const description = lang === "fr" ? (product.descriptionFr || product.description) : product.description;
  const inWish      = isInWishlist(product.id);
  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      await submitReview({ product_id: product.id, user_id: user?.id ?? null, user_name: user?.email?.split("@")[0] ?? "Anonyme", rating: reviewRating, comment: reviewText });
      setReviewText(""); refetchReviews();
      toast.success(lang==="fr"?"Avis ajouté":"Review submitted");
    } catch { toast.error("Erreur"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4"/>{lang==="fr"?"Retour boutique":"Back to Shop"}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-green-50">
            {product.image ? <img src={product.image} alt={name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-8xl">💊</div>}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-primary font-medium capitalize mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s=><Star key={s} className={`w-4 h-4 ${s<=Math.round(product.rating)?"fill-amber-400 text-amber-400":"text-gray-200"}`}/>)}
              <span className="text-sm text-muted-foreground">({product.reviewCount} {t("reviews")})</span>
            </div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-foreground">{product.price} MAD</span>
              {product.originalPrice && <span className="text-muted-foreground line-through">{product.originalPrice} MAD</span>}
            </div>

            {/* Flavors */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">{lang==="fr"?"Parfum":"Flavor"}</p>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map(f=>(
                    <button key={f} onClick={()=>setSelectedFlavor(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedFlavor===f?"bg-primary text-white border-primary":"border-border hover:border-primary"}`}>{f}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 border border-border rounded-xl p-1">
                <button onClick={()=>setQty(Math.max(1,qty-1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted"><Minus className="w-3.5 h-3.5"/></button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button onClick={()=>setQty(Math.min(product.stock,qty+1))} disabled={qty>=product.stock} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50"><Plus className="w-3.5 h-3.5"/></button>
              </div>
              <span className="text-xs text-muted-foreground">{product.stock} {t("inStock")}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={product.stock===0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                <ShoppingCart className="w-5 h-5"/>{t("addToCart")}
              </button>
              <button onClick={()=>toggleWishlist(product)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${inWish?"bg-primary/10 border-primary text-primary":"border-border hover:border-primary"}`}>
                <Heart className={`w-5 h-5 ${inWish?"fill-current":""}`}/>
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-display font-semibold mb-2">{t("description")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              {product.weight && <p className="text-xs text-muted-foreground mt-2">Format: {product.weight}</p>}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400"/>
            {lang==="fr"?"Avis clients":"Customer Reviews"} ({reviews.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Add review */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary"/>{lang==="fr"?"Laisser un avis":"Leave a Review"}</h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setReviewRating(s)}>
                  <Star className={`w-6 h-6 cursor-pointer ${s<=reviewRating?"fill-amber-400 text-amber-400":"text-gray-200"}`}/>
                </button>)}
              </div>
              <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} rows={3}
                placeholder={lang==="fr"?"Votre commentaire...":"Your comment..."}
                className="w-full rounded-xl border border-border bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3"/>
              <button onClick={handleSubmitReview} disabled={submitting || !reviewText.trim()}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {lang==="fr"?"Publier l'avis":"Submit Review"}
              </button>
            </div>

            {/* Reviews list */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{lang==="fr"?"Aucun avis encore":"No reviews yet"}</p>
              ) : reviews.map(r=>(
                <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{r.user_name}</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} className={`w-3 h-3 ${s<=r.rating?"fill-amber-400 text-amber-400":"text-gray-200"}`}/>)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold mb-6">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </main><Footer/></div>
  );
}
