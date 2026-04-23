import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useLang } from "@/context/LanguageContext";
import { categories } from "@/data/products";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

export default function Shop() {
  const { data: products = [], isLoading } = useProducts();
  const { lang, t } = useLang();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState<SortOption>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number,number]>([0, 2000]);

  const activeCategory = params.get("category") ?? "";
  const searchQuery    = params.get("search") ?? "";

  const setCategory = (slug: string) => {
    const p = new URLSearchParams(params);
    if (slug) p.set("category", slug); else p.delete("category");
    setParams(p);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (searchQuery)    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameFr.toLowerCase().includes(searchQuery.toLowerCase())
    );
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case "price-asc":  return list.sort((a,b) => a.price - b.price);
      case "price-desc": return list.sort((a,b) => b.price - a.price);
      case "rating":     return list.sort((a,b) => b.rating - a.rating);
      default:           return list.sort((a,b) => (b.isFeatured?1:0) - (a.isFeatured?1:0));
    }
  }, [products, activeCategory, searchQuery, sort, priceRange]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured",   label: t("featured") },
    { value: "price-asc",  label: t("priceLow") },
    { value: "price-desc", label: t("priceHigh") },
    { value: "rating",     label: t("topRated") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-herb py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("allProducts")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} {lang === "fr" ? "produits" : "products"}</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-sm hover:border-primary transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              {lang === "fr" ? "Filtres" : "Filters"}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          {showFilters && (
            <aside className="w-56 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-5 space-y-6 sticky top-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">Filtres</h3>
                  <button onClick={() => setShowFilters(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    {lang === "fr" ? "Catégorie" : "Category"}
                  </h4>
                  <div className="space-y-2">
                    <button onClick={() => setCategory("")}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!activeCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}>
                      {lang === "fr" ? "Tout" : "All"}
                    </button>
                    {categories.map(cat => (
                      <button key={cat.slug} onClick={() => setCategory(cat.slug)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}>
                        <span>{cat.icon}</span>
                        {lang === "fr" ? cat.nameFr : cat.nameEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    {lang === "fr" ? "Prix (MAD)" : "Price (MAD)"}
                  </h4>
                  <div className="space-y-2">
                    <input type="range" min={0} max={2000} value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 MAD</span><span>{priceRange[1]} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Grid */}
          <div className="flex-1">
            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setCategory("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeCategory ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {lang === "fr" ? "Tout" : "All"}
              </button>
              {categories.map(cat => (
                <button key={cat.slug} onClick={() => setCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${activeCategory === cat.slug ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {cat.icon} {lang === "fr" ? cat.nameFr : cat.nameEn}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_,i) => <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse"/>)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-display font-semibold text-foreground">{t("noProducts")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
