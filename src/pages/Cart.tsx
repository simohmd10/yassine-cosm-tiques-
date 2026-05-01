import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { getCartUpsellProducts } from "@/lib/recommendations";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { lang, t } = useLang();
  const { data: allProducts = [] } = useProducts();
  const safeItems = Array.isArray(items) ? items : [];
  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  const upsellProducts = useMemo(
    () => getCartUpsellProducts(safeItems.map((i) => i.product).filter(Boolean), safeProducts, 4),
    [safeItems, safeProducts]
  );

  if (safeItems.length === 0) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-herb py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="font-display text-2xl font-semibold text-foreground mb-3">{t("emptyCart")}</h1>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          {t("continueShopping")} <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-herb py-10">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">{t("yourCart")}</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {safeItems.map(({ product, quantity }) => {
                const name = lang === "fr" ? (product.nameFr || product.name) : product.name;
                return (
                  <motion.div key={product.id} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}}
                    className="flex gap-4 bg-card border border-border rounded-2xl p-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-green-50 flex-shrink-0">
                      {product.image ? <img src={product.image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{product.category}</p>
                      <p className="font-bold text-foreground mt-1">{product.price} MAD</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors disabled:opacity-50">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">{(product.price * quantity).toFixed(0)} MAD</span>
                          <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-display font-semibold text-foreground mb-5">{lang === "fr" ? "Récapitulatif" : "Summary"}</h3>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("subtotal")}</span><span>{totalPrice.toFixed(0)} MAD</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("shipping")}</span><span className="text-primary font-medium">{t("free")}</span></div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                  <span>{t("total")}</span><span>{totalPrice.toFixed(0)} MAD</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full bg-primary text-primary-foreground text-center py-3 rounded-xl font-display font-bold hover:bg-primary/90 transition-colors">
                {t("checkout")} <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
              <Link to="/shop" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors">
                {t("continueShopping")}
              </Link>
            </div>
          </div>
        </div>

        {upsellProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold mb-6">{lang === "fr" ? "Vous aimerez aussi" : "You may also like"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {upsellProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
