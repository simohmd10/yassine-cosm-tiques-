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
import { formatCurrency } from "@/lib/formatCurrency";

const RATING_LABELS_FR = ["", "Très mauvais", "Mauvais", "Correct", "Bien", "Excellent"] as const;
const RATING_LABELS_EN = ["", "Very poor",    "Poor",    "Average", "Good", "Excellent"] as const;

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { lang, t } = useLang();
  const [qty, setQty] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => fetchProductReviews(id!),
    enabled: !!id,
  });

  const related = useMemo(
    () => (product ? getRelatedProducts(product, allProducts, 4) : []),
    [product, allProducts]
  );

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length,
      })),
    [reviews]
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Produit introuvable</p>
      </div>
    );

  const name        = lang === "fr" ? (product.nameFr || product.name) : product.name;
  const description = lang === "fr" ? (product.descriptionFr || product.description) : product.description;
  const inWish      = isInWishlist(product.id);

  const activeStars   = hoverRating || reviewRating;
  const ratingLabels  = lang === "fr" ? RATING_LABELS_FR : RATING_LABELS_EN;
  const ratingLabel   = ratingLabels[activeStars] ?? "";

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };

  const handleSubmitReview = async () => {
    const trimmedText = reviewText.trim();
    if (!trimmedText) return;

    const displayName = user
      ? (user.email?.split("@")[0] ?? "Client")
      : (reviewerName.trim() || "Client");

    setSubmitting(true);
    try {
      await submitReview({
        product_id: product.id,
        user_id:    user?.id ?? null,
        user_name:  displayName,
        rating:     reviewRating,
        comment:    trimmedText,
      });
      setReviewText("");
      setReviewerName("");
      setReviewRating(5);
      setHoverRating(0);
      refetchReviews();
      toast.success(lang === "fr" ? "Avis soumis — en attente de validation" : "Review submitted — pending approval");
    } catch {
      toast.error(lang === "fr" ? "Erreur lors de l'envoi" : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-herb py-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "fr" ? "Retour boutique" : "Back to Shop"}
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-green-50">
            {product.image ? (
              <img src={product.image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">💊</div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-primary font-medium capitalize mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{name}</h1>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} {t("reviews")})
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Flavors */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">{lang === "fr" ? "Parfum" : "Flavor"}</p>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFlavor(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        selectedFlavor === f
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 border border-border rounded-xl p-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {product.stock} {t("inStock")}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {t("addToCart")}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  inWish ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWish ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-display font-semibold mb-2">{t("description")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              {product.weight && (
                <p className="text-xs text-muted-foreground mt-2">Format: {product.weight}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            {lang === "fr" ? "Avis clients" : "Customer Reviews"}
            <span className="text-muted-foreground font-normal text-base">({reviews.length})</span>
          </h2>

          {/* Summary stats */}
          {reviews.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-6">
                {/* Average */}
                <div className="text-center flex-shrink-0">
                  <p className="font-display text-4xl font-bold text-foreground leading-none mb-1">
                    {avgRating.toFixed(1)}
                  </p>
                  <StarRow rating={avgRating} size="md" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {reviews.length} {lang === "fr" ? "avis" : "reviews"}
                  </p>
                </div>

                {/* Distribution bars */}
                <div className="flex-1 space-y-1.5">
                  {distribution.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-3 text-right leading-none">
                        {star}
                      </span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{
                            width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-4 text-right leading-none">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* ── Review form ── */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                {lang === "fr" ? "Laisser un avis" : "Leave a Review"}
              </h3>

              {/* Name input for guests */}
              {!user && (
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  maxLength={50}
                  placeholder={lang === "fr" ? "Votre prénom (optionnel)" : "Your name (optional)"}
                  className="w-full rounded-xl border border-border bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
                />
              )}

              {/* Interactive star selector */}
              <div
                className="flex gap-1 mb-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${s} ${lang === "fr" ? "étoile" : "star"}${s > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 cursor-pointer transition-colors ${
                        s <= activeStars ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating label */}
              <p className="text-xs text-muted-foreground mb-3 h-4">{ratingLabel}</p>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder={lang === "fr" ? "Votre commentaire..." : "Your comment..."}
                className="w-full rounded-xl border border-border bg-background text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3"
              />
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !reviewText.trim()}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting
                  ? lang === "fr" ? "Publication…" : "Submitting…"
                  : lang === "fr" ? "Publier l'avis" : "Submit Review"}
              </button>
            </div>

            {/* ── Review list ── */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Star className="w-8 h-8 text-muted-foreground/20 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {lang === "fr" ? "Aucun avis encore" : "No reviews yet"}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {lang === "fr" ? "Soyez le premier à donner votre avis" : "Be the first to leave a review"}
                  </p>
                </div>
              ) : (
                reviews.map((r) => {
                  const displayName =
                    r.user_name && r.user_name.trim() && r.user_name !== "Anonyme"
                      ? r.user_name.trim()
                      : lang === "fr" ? "Client" : "Customer";

                  const dateStr = new Date(r.created_at).toLocaleDateString("fr-MA", {
                    year:  "numeric",
                    month: "short",
                    day:   "numeric",
                  });

                  return (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground leading-tight">
                            {displayName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{dateStr}</p>
                        </div>
                        <StarRow rating={r.rating} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold mb-6">{t("relatedProducts")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
