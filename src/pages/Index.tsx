import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Truck, Star } from "lucide-react";
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
      <section
        className="relative overflow-hidden bg-cover bg-center text-white min-h-[480px] md:min-h-[560px]"
        style={{ backgroundImage: "url('/hero-banner.jpg')" }}
      >
        {/* Dark green gradient overlay — left heavy so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/70 to-green-900/20" />

        <div className="container-herb relative py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">

            {/* Left — text content */}
            <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                {lang === "fr" ? "Livraison rapide au Maroc" : "Fast delivery in Morocco"}
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                {t("heroTitle")}
              </h1>
              <p className="font-body text-lg text-green-100 mb-8 max-w-lg">
                {t("heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-xl font-display font-bold hover:bg-green-50 transition-colors">
                  {t("shopNow")} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/shop" className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-6 py-3 rounded-xl font-display font-semibold hover:bg-white/10 transition-colors">
                  {t("browseCategories")}
                </Link>
              </div>
            </motion.div>

            {/* Right — subtle decorative badge (desktop only) */}
            <motion.div
              className="hidden md:flex justify-center items-center"
              initial={{opacity:0, scale:0.85}}
              animate={{opacity:1, scale:1}}
              transition={{duration:0.7, delay:0.2}}
            >
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex flex-col items-center justify-center text-center shadow-xl">
                  <span className="text-4xl font-extrabold text-white leading-none">N°1</span>
                  <span className="text-xs text-green-200 font-semibold mt-1 tracking-wide">au Maroc</span>
                </div>
                <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full bg-green-400/20 backdrop-blur-sm border border-green-300/20" />
                <div className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

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
