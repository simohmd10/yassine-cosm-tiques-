import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useLang } from "@/context/LanguageContext";
import { categories } from "@/data/products";

const CATEGORY_IMAGES: Record<string,string> = {
  protein:"💪", vitamins:"🌿", creatine:"⚡", fatburner:"🔥", preworkout:"🚀", recovery:"🧘",
};

export default function Index() {
  const { data: products = [], isLoading } = useProducts();
  const { lang, t } = useLang();

  const featured    = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-white">
        {/* Full-width banner image — no container, no rounding */}
        <img
          src="/hero-banner.jpg"
          alt="yassineiherb — N°1 en nutrition sportive au Maroc"
          className="w-full h-[220px] md:h-[420px] object-cover"
        />

        {/* Text block below the image */}
        <motion.div
          className="max-w-7xl mx-auto py-8 px-4 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            {lang === "fr" ? "Livraison rapide au Maroc" : "Fast delivery in Morocco"}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
            {t("heroTitle")}
          </h1>

          <p className="font-body text-sm md:text-base text-gray-500 max-w-2xl">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-display font-bold transition-colors w-full sm:w-auto"
            >
              {t("shopNow")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-display font-semibold transition-colors w-full sm:w-auto"
            >
              {t("browseCategories")}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/212663422092"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      {/* Trust badges */}
      <section className="border-b border-green-100 bg-green-50">
        <div className="container-herb py-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, text: lang === "fr" ? "Livraison Maroc" : "Morocco Delivery" },
              { icon: Shield, text: lang === "fr" ? "Qualité garantie" : "Quality Guaranteed" },
              { icon: Star, text: lang === "fr" ? "Produits certifiés" : "Certified Products" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center justify-center gap-2 text-center">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium text-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-herb py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          {lang === "fr" ? "Nos Catégories" : "Our Categories"}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link key={cat.slug} to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-green-100 hover:border-primary hover:shadow-md transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {CATEGORY_IMAGES[cat.slug]}
              </span>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {lang === "fr" ? cat.nameFr : cat.nameEn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-herb py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {lang === "fr" ? "Produits vedettes" : "Featured Products"}
            </h2>
            <Link to="/shop" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              {lang === "fr" ? "Voir tout" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_,i)=><div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-green-50 py-16 mt-8">
          <div className="container-herb">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {lang === "fr" ? "Meilleures ventes" : "Best Sellers"}
              </h2>
              <Link to="/shop?badge=Best Seller" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                {lang === "fr" ? "Voir tout" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-herb py-16">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {lang === "fr" ? "Commencez votre transformation aujourd'hui" : "Start your transformation today"}
          </h2>
          <p className="text-green-100 mb-6">
            {lang === "fr" ? "Livraison Cash on Delivery partout au Maroc" : "Cash on Delivery delivery everywhere in Morocco"}
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors">
            {t("shopNow")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
