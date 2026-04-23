import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "./Blog";
import { useLang } from "@/context/LanguageContext";

function renderContent(text: string) {
  return text.trim().split(/\n\n+/).map((block, i) => {
    const t = block.trim();
    if (t.startsWith("## ")) return <h2 key={i} className="font-display text-xl font-semibold text-foreground mt-10 mb-4">{t.slice(3)}</h2>;
    const parts = t.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="font-body text-base text-muted-foreground leading-relaxed mb-0">{parts.map((p,j) => j%2===1 ? <strong key={j} className="font-semibold text-foreground">{p}</strong> : p)}</p>;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const { lang } = useLang();
  const fr = lang === "fr";
  const post = BLOG_POSTS.find(p => p.slug === slug);

  useEffect(() => {
    if (!post) return;
    const title = fr ? post.titleFr : post.titleEn;
    document.title = `${title} | iherbyassine`;
    const schemaId = "article-schema-ld";
    document.getElementById(schemaId)?.remove();
    const s = document.createElement("script");
    s.id = schemaId; s.type = "application/ld+json";
    s.text = JSON.stringify({ "@context":"https://schema.org","@type":"Article","headline":title,"author":{"@type":"Organization","name":"iherbyassine"},"publisher":{"@type":"Organization","name":"iherbyassine"},"datePublished":post.date });
    document.head.appendChild(s);
    return () => { document.getElementById(schemaId)?.remove(); document.title = "iherbyassine — Compléments Alimentaires Premium"; };
  }, [post, lang]);

  if (!post) return <Navigate to="/blog" replace />;

  const title   = fr ? post.titleFr   : post.titleEn;
  const content = fr ? post.contentFr : post.contentEn;
  const related = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0,2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container-herb max-w-2xl">
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="py-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4"/> {fr?"Retour au blog":"Back to blog"}
            </Link>
          </motion.div>

          <motion.header initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-body text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">{post.category}</span>
              <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Clock className="w-3 h-3"/>{post.readTime}</span>
              <span className="font-body text-xs text-muted-foreground">{post.date}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-snug mb-5">{title}</h1>
            <p className="font-body text-base text-muted-foreground italic border-l-2 border-primary/30 pl-4">
              {fr ? post.excerptFr : post.excerptEn}
            </p>
          </motion.header>

          <motion.article initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="space-y-5 mb-16">
            {renderContent(content)}
          </motion.article>

          {/* Internal links to products */}
          <div className="bg-green-50 rounded-2xl p-6 mb-12">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {fr?"Produits recommandés":"Recommended products"}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: fr?"Whey Gold":"Whey Gold",       to:"/shop?category=protein" },
                { label: fr?"Créatine":"Creatine",          to:"/shop?category=creatine" },
                { label: fr?"BCAA 2:1:1":"BCAA 2:1:1",     to:"/shop?category=recovery" },
                { label: fr?"Voir tous":"All products",     to:"/shop" },
              ].map(p => (
                <Link key={p.to} to={p.to} className="font-body text-sm text-primary bg-white px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors">
                  {p.label} →
                </Link>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className="border-t border-border pt-12">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">{fr?"Autres articles":"More articles"}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map(p => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all">
                    <span className="font-body text-xs text-primary mb-2 block">{p.category}</span>
                    <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {fr ? p.titleFr : p.titleEn}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
