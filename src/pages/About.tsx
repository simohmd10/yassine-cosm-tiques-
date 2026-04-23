import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";

export default function About() {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <section className="container-herb max-w-3xl py-16">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">{fr?"Notre histoire":"Our story"}</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-8">
              {fr ? <>Nous avons commencé parce que nous en avions <span className="text-primary italic">assez de deviner</span></> : <>We started because we were <span className="text-primary italic">tired of guessing</span></>}
            </h1>
            <div className="space-y-5 font-body text-muted-foreground text-sm leading-relaxed">
              <p>{fr
                ? "En 2022, iherbyassine est née d'une frustration simple : les compléments alimentaires vendus au Maroc portaient des promesses qu'on ne pouvait pas vérifier. Des ingrédients mal dosés, des prix injustifiés, et une qualité qui variait d'une commande à l'autre."
                : "In 2022, iherbyassine was born from a simple frustration: supplements sold in Morocco came with promises that couldn't be verified. Under-dosed ingredients, unjustified prices, and quality that varied from one order to the next."
              }</p>
              <p>{fr
                ? "On a fait le travail ennuyeux. On a lu les études. On a parlé à des nutritionnistes qui étaient francs sur ce qui fonctionne vraiment. On a testé chaque produit pendant des mois avant de proposer quoi que ce soit."
                : "We did the boring work. Read the studies. Talked to nutritionists who were honest about what actually works. Tested every product for months before offering anything."
              }</p>
              <p>{fr
                ? "Aujourd'hui, chaque produit dans notre catalogue est là parce qu'il a une raison d'être là — pas parce qu'il se vend bien, ou parce qu'un influenceur en parle."
                : "Today, every product in our catalogue is there because it has a reason to be — not because it sells well, or because an influencer mentioned it."
              }</p>
            </div>
          </motion.div>
        </section>

        <section className="bg-green-50 py-12">
          <div className="container-herb">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { stat: "2022",    label: fr?"Fondée au Maroc":"Founded in Morocco" },
                { stat: "500+",    label: fr?"Commandes livrées":"Orders delivered" },
                { stat: "4.8/5",   label: fr?"Note moyenne":"Average rating" },
                { stat: "COD",     label: fr?"Paiement à la livraison":"Cash on delivery" },
              ].map(({ stat, label }) => (
                <motion.div key={label} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
                  <p className="font-display text-3xl font-bold text-primary mb-1">{stat}</p>
                  <p className="font-body text-xs text-muted-foreground">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-herb max-w-3xl py-16">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8">
            {fr ? "Ce en quoi nous croyons" : "What we believe"}
          </h2>
          <div className="space-y-8">
            {[
              {
                title: fr ? "La qualité se voit dans les ingrédients, pas dans le packaging" : "Quality shows in ingredients, not packaging",
                body: fr
                  ? "Nos protéines contiennent les doses indiquées sur l'étiquette — ni plus, ni moins. On peut dire ça parce qu'on teste nos lots en laboratoire. Ce n'est pas une norme dans l'industrie. Ça devrait l'être."
                  : "Our proteins contain the doses stated on the label — no more, no less. We can say that because we lab-test our batches. That's not an industry standard. It should be.",
              },
              {
                title: fr ? "Cash on Delivery parce que vous devriez payer ce que vous recevez" : "Cash on Delivery because you should pay for what you receive",
                body: fr
                  ? "On n'exige pas votre argent avant de vous envoyer quoi que ce soit. Vous payez quand le colis arrive à votre porte. Si vous n'êtes pas là, on réessaie. C'est la seule façon de faire qui nous semble honnête."
                  : "We don't ask for your money before sending anything. You pay when the package arrives at your door. If you're not there, we try again. That's the only approach that feels honest to us.",
              },
            ].map(({ title, body }, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }} viewport={{ once:true }} className="border-l-2 border-primary/40 pl-6">
                <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container-herb max-w-3xl py-8 text-center">
          <p className="font-body text-sm text-muted-foreground mb-6">
            {fr ? "La meilleure façon de savoir si c'est pour vous : lisez les descriptions produit. Si vous avez encore des doutes, écrivez-nous." : "The best way to know if this is for you: read the product descriptions. If you're still unsure, write to us."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              {fr ? "Voir les produits" : "Browse products"}
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
              {fr ? "Nous contacter" : "Contact us"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
