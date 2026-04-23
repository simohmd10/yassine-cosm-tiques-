import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Truck, RotateCcw, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";

export default function ShippingReturns() {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container-herb max-w-3xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="py-16">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">{fr?"Sans jargon":"Plain English"}</p>
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">{fr?"Livraison & Retours":"Shipping & Returns"}</h1>
            <p className="font-body text-base text-muted-foreground">{fr?"Voici exactement comment ça fonctionne.":"Here's exactly how it works."}</p>
          </motion.div>

          <div className="space-y-8 pb-16">
            {/* Shipping */}
            <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary"/>
                </div>
                <h2 className="font-display text-xl font-semibold">{fr?"Livraison":"Delivery"}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: fr?"Livraison gratuite":"Free delivery", detail: fr?"Sur toutes les commandes":"On all orders", note: fr?"Pas de minimum":"No minimum order" },
                  { label: fr?"Cash on Delivery":"Cash on Delivery", detail: fr?"Payez à la réception":"Pay on arrival", note: fr?"Aucune carte bancaire requise":"No bank card required" },
                  { label: fr?"Délai de livraison":"Delivery time", detail: fr?"2–5 jours ouvrables":"2–5 business days", note: fr?"Expédié dans les 24h":"Shipped within 24h" },
                  { label: fr?"Suivi de commande":"Order tracking", detail: fr?"Par WhatsApp/SMS":"Via WhatsApp/SMS", note: fr?"Dès l'expédition":"As soon as shipped" },
                ].map(({ label, detail, note }) => (
                  <div key={label} className="bg-green-50 rounded-xl p-4">
                    <p className="font-body text-xs font-semibold text-foreground uppercase tracking-wide mb-1">{label}</p>
                    <p className="font-display text-base font-bold text-primary mb-1">{detail}</p>
                    <p className="font-body text-xs text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* COD box */}
            <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold mb-3">{fr?"Comment fonctionne le Cash on Delivery ?":"How does Cash on Delivery work?"}</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {fr
                  ? "Vous passez commande en ligne. On prépare et expédie. Vous payez quand le livreur arrive à votre porte — en espèces. Notre équipe vous appelle pour confirmer l'heure de livraison. Si vous manquez l'appel, on essaie deux fois avant de retourner le colis."
                  : "You order online. We prepare and ship. You pay when the delivery person arrives at your door — in cash. Our team calls to confirm the delivery time. If you miss the call, we try twice before returning the package."
                }
              </p>
            </motion.section>

            {/* Returns */}
            <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary"/>
                </div>
                <h2 className="font-display text-xl font-semibold">{fr?"Retours":"Returns"}</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {fr
                  ? "14 jours à partir de la livraison. Si quelque chose ne va pas avec votre commande, on arrange ça — sans conditions. Si vous changez d'avis sur un produit non ouvert, on le reprend. Écrivez-nous."
                  : "14 days from delivery. If something's wrong with your order, we fix it — no conditions. Changed your mind on an unopened product, we'll take it back. Write to us."
                }
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-green-500"/><span className="font-body text-sm font-semibold">{fr?"Toujours accepté":"Always accepted"}</span></div>
                  <ul className="space-y-1.5 font-body text-xs text-muted-foreground">
                    {(fr
                      ? ["Produit non ouvert","Mauvais article envoyé","Endommagé à la réception","Produit non conforme"]
                      : ["Unopened product","Wrong item sent","Damaged on arrival","Product not as described"]
                    ).map(i => <li key={i} className="flex items-start gap-2"><span className="text-green-500">✓</span>{i}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3"><XCircle className="w-4 h-4 text-destructive"/><span className="font-body text-sm font-semibold">{fr?"Non accepté":"Not accepted"}</span></div>
                  <ul className="space-y-1.5 font-body text-xs text-muted-foreground">
                    {(fr
                      ? ["Produits ouverts après 14 jours","Articles en promotion finale","Sans nous contacter d'abord"]
                      : ["Opened products after 14 days","Final sale items","Without contacting us first"]
                    ).map(i => <li key={i} className="flex items-start gap-2"><span className="text-destructive">✕</span>{i}</li>)}
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Contact */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="flex items-start gap-4 bg-muted/40 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <p className="font-body text-sm font-semibold mb-1">{fr?"Une question ?":"Have a question?"}</p>
                <p className="font-body text-sm text-muted-foreground mb-3">
                  {fr ? "Écrivez-nous à " : "Email us at "}<a href="mailto:contact@iherbyassine.ma" className="text-primary hover:underline">contact@iherbyassine.ma</a>
                </p>
                <Link to="/contact" className="font-body text-sm text-primary hover:underline">{fr?"Page de contact →":"Contact page →"}</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
