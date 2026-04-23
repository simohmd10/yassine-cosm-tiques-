import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";

const FAQS_FR = [
  { category: "Produits", questions: [
    { q: "Les protéines whey conviennent-elles aux débutants ?", a: "Oui. La whey protéine est simplement une protéine extraite du lait de vache. Elle convient à tous les niveaux — que vous débutiez ou que vous vous entraîniez depuis des années. La différence n'est pas dans le produit, mais dans la dose et le timing. Pour un débutant, 25g après l'entraînement suffit largement." },
    { q: "La créatine est-elle sans danger ?", a: "La créatine monohydrate est l'un des compléments les plus étudiés au monde — plus de 500 études cliniques sur plusieurs décennies. Elle est généralement considérée comme sûre pour les adultes en bonne santé. Comme tout complément, si vous avez des problèmes rénaux ou une condition médicale, consultez un médecin avant." },
    { q: "Peut-on mélanger whey et créatine ?", a: "Oui, sans problème. Beaucoup de gens les mélangent dans le même shaker. Il n'y a pas d'interaction négative entre les deux. Whey pour la récupération musculaire, créatine pour la force et la performance — ils ont des rôles complémentaires." },
    { q: "Vos produits contiennent-ils des agents de remplissage ?", a: "Non. Nos protéines contiennent les doses indiquées sur l'étiquette. On teste nos lots en laboratoire. On ne dilue pas avec du maltodextrine ou d'autres charges pour améliorer les marges. C'est notre engagement de base." },
  ]},
  { category: "Commandes & Livraison", questions: [
    { q: "Comment fonctionne le paiement à la livraison ?", a: "Vous passez commande en ligne, on expédie, vous payez en espèces quand le livreur arrive. Pas de carte bancaire, pas de paiement à l'avance. Notre équipe vous appelle pour confirmer l'heure. Si vous n'êtes pas disponible, on réessaie deux fois." },
    { q: "Livrez-vous partout au Maroc ?", a: "Oui, nous livrons dans toutes les villes du Maroc. Les délais varient selon la région — 2 à 3 jours pour les grandes villes (Casablanca, Rabat, Marrakech), 3 à 5 jours pour les autres régions." },
    { q: "Ma commande n'est pas arrivée — que faire ?", a: "Contactez-nous immédiatement à contact@iherbyassine.ma ou par WhatsApp avec votre numéro de commande. On vérifie et on résout — soit on réexpédie, soit on rembourse, selon votre préférence." },
  ]},
  { category: "Conseils nutrition", questions: [
    { q: "Quand prendre sa protéine whey ?", a: "Le timing est moins critique qu'on ne le dit souvent. La fenêtre anabolique de 30 minutes après l'entraînement est un mythe relatif. Ce qui compte plus : atteindre votre apport total en protéines sur la journée. Cela dit, après l'entraînement ou le matin reste un bon moment si vous cherchez une règle simple." },
    { q: "Combien de créatine prendre par jour ?", a: "3 à 5g par jour, tous les jours — même les jours sans entraînement. La saturation musculaire prend 3 à 4 semaines. Pas besoin de phase de charge (20g/jour pendant 5 jours) — c'est plus rapide mais donne des effets secondaires digestifs chez certains. La dose quotidienne de 5g arrive au même résultat en 4 semaines." },
    { q: "Les brûleurs de graisse fonctionnent-ils vraiment ?", a: "La réponse honnête : seuls, non. Combinés à un déficit calorique et de l'exercice, ils peuvent légèrement accélérer le processus — principalement grâce à la caféine qui augmente légèrement le métabolisme. Ne les prenez pas comme substitut à une bonne alimentation." },
  ]},
];

const FAQS_EN = [
  { category: "Products", questions: [
    { q: "Is whey protein suitable for beginners?", a: "Yes. Whey protein is simply protein extracted from cow's milk. It works for all levels — whether you're starting out or training for years. The difference isn't in the product, it's in dose and timing. For a beginner, 25g after training is plenty." },
    { q: "Is creatine safe?", a: "Creatine monohydrate is one of the most studied supplements in the world — over 500 clinical studies across decades. It's generally considered safe for healthy adults. Like any supplement, if you have kidney issues or a medical condition, consult a doctor first." },
    { q: "Can I mix whey and creatine?", a: "Yes, no problem. Many people mix them in the same shaker. There's no negative interaction between the two. Whey for muscle recovery, creatine for strength and performance — they have complementary roles." },
    { q: "Do your products contain fillers?", a: "No. Our proteins contain the doses stated on the label. We lab-test our batches. We don't dilute with maltodextrin or other fillers to improve margins. That's our basic commitment." },
  ]},
  { category: "Orders & Delivery", questions: [
    { q: "How does cash on delivery work?", a: "You order online, we ship, you pay cash when the delivery person arrives. No bank card, no upfront payment. Our team calls to confirm the time. If you're unavailable, we try twice." },
    { q: "Do you deliver everywhere in Morocco?", a: "Yes, we deliver to all cities in Morocco. Timing varies by region — 2 to 3 days for major cities, 3 to 5 days for other regions." },
    { q: "My order hasn't arrived — what do I do?", a: "Contact us immediately at contact@iherbyassine.ma or via WhatsApp with your order number. We investigate and resolve — either reship or refund, your preference." },
  ]},
  { category: "Nutrition advice", questions: [
    { q: "When should I take whey protein?", a: "Timing is less critical than often said. The 30-minute anabolic window after training is a relative myth. What matters more: reaching your total daily protein intake. That said, post-training or morning is a good rule of thumb." },
    { q: "How much creatine per day?", a: "3 to 5g daily, every day — even rest days. Muscle saturation takes 3 to 4 weeks. No need for a loading phase (20g/day for 5 days) — it's faster but causes digestive issues for some. The 5g daily dose reaches the same result in 4 weeks." },
    { q: "Do fat burners actually work?", a: "Honest answer: alone, no. Combined with a calorie deficit and exercise, they can slightly accelerate the process — mainly through caffeine increasing metabolism slightly. Don't take them as a substitute for proper nutrition." },
  ]},
];

function FAQItem({ q, a }: { q:string; a:string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-5 text-left group">
        <span className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed">{q}</span>
        <span className="flex-shrink-0 mt-0.5 text-muted-foreground">{open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} className="overflow-hidden">
            <p className="font-body text-sm text-muted-foreground leading-relaxed pb-5 pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const faqs = fr ? FAQS_FR : FAQS_EN;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container-herb max-w-3xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="py-16">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">FAQ</h1>
            <p className="font-body text-base text-muted-foreground">
              {fr ? "Les questions qu'on reçoit le plus souvent. Si la vôtre n'est pas là, " : "The questions we get most often. If yours isn't here, "}
              <Link to="/contact" className="text-primary hover:underline">{fr?"écrivez-nous":"email us"}</Link>.
            </p>
          </motion.div>
          <div className="space-y-10 pb-16">
            {faqs.map((section, i) => (
              <motion.section key={section.category} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} viewport={{ once:true }}>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2 pb-3 border-b-2 border-primary/20">{section.category}</h2>
                {section.questions.map(item => <FAQItem key={item.q} q={item.q} a={item.a}/>)}
              </motion.section>
            ))}
          </div>
          <div className="text-center py-10 border-t border-border">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              {fr ? "Poser une question" : "Ask a question"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
