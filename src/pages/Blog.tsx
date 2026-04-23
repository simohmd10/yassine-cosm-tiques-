import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LanguageContext";

export const BLOG_POSTS = [
  {
    slug: "whey-vs-proteines-vegetales",
    titleFr: "Whey vs Protéines végétales : laquelle choisir selon vos objectifs",
    titleEn: "Whey vs Plant Protein: Which to Choose Based on Your Goals",
    excerptFr: "La whey est plus efficace pour la prise de masse. Les protéines végétales sont souvent mieux tolérées digestivement. Ce n'est pas si simple — voici la vraie différence.",
    excerptEn: "Whey is more effective for muscle gain. Plant proteins are often better tolerated digestively. It's not that simple — here's the real difference.",
    readTime: "5 min", date: "Janvier 2025", category: "Protéines / Protein",
    contentFr: `## Ce que dit la recherche

La whey protéine a un score PDCAAS (mesure de la qualité protéique) de 1.0 — le maximum possible. Elle contient tous les acides aminés essentiels, avec une concentration élevée en leucine, l'acide aminé qui déclenche la synthèse protéique musculaire.

Les protéines végétales — soja, pois, riz — ont des scores légèrement inférieurs pour la plupart, bien que le soja approche la whey sur ce point. L'exception : les mélanges de protéines végétales (pois + riz, par exemple) qui combinrent les profils aminés pour atteindre des scores comparables.

**Ce que ça signifie en pratique :** si vous prenez 30g de whey vs 30g de protéine de pois, la whey déclenchera une réponse anabolique légèrement plus forte. Mais si vous prenez 35g de pois pour compenser, la différence s'estompe.

## La question de la digestion

C'est là où les protéines végétales gagnent souvent. La whey contient du lactose (moins dans l'isolat que le concentré), ce qui cause des problèmes digestifs chez les personnes intolérantes. Les protéines végétales n'ont pas ce problème.

Si vous avez des ballonnements ou des inconforts après votre shake, essayez d'abord l'isolat de whey (moins de lactose que le concentré). Si ça persiste, passez aux protéines végétales.

## Notre recommandation

- **Pour la prise de masse rapide :** Whey Gold (isolat ou concentré selon tolérance)
- **Pour l'intolérance au lactose ou le régime végétalien :** mélange pois + riz
- **Pour la récupération après l'entraînement :** whey (absorption plus rapide)
- **Pour les collations ou le petit-déjeuner :** les deux conviennent`,
    contentEn: `## What the research says

Whey protein has a PDCAAS score (protein quality measure) of 1.0 — the maximum possible. It contains all essential amino acids, with high leucine concentration, the amino acid that triggers muscle protein synthesis.

Plant proteins — soy, pea, rice — have slightly lower scores for most, though soy approaches whey on this point. The exception: plant protein blends (pea + rice, for example) that combine amino acid profiles to reach comparable scores.

**What this means practically:** if you take 30g of whey vs 30g of pea protein, the whey will trigger a slightly stronger anabolic response. But if you take 35g of pea to compensate, the difference fades.

## The digestion question

This is where plant proteins often win. Whey contains lactose (less in isolate than concentrate), which causes digestive problems for intolerant people. Plant proteins don't have this issue.

If you experience bloating or discomfort after your shake, try whey isolate first (less lactose than concentrate). If it persists, switch to plant proteins.

## Our recommendation

- **For rapid muscle gain:** Whey Gold (isolate or concentrate based on tolerance)
- **For lactose intolerance or vegan diet:** pea + rice blend
- **For post-workout recovery:** whey (faster absorption)
- **For snacks or breakfast:** either works`,
  },
  {
    slug: "creatine-guide-complet",
    titleFr: "Guide complet de la créatine : dosage, timing, effets réels",
    titleEn: "Complete Creatine Guide: Dosage, Timing, Real Effects",
    excerptFr: "La créatine est le complément le plus étudié au monde. Voici ce qu'on sait vraiment — sans exagération marketing.",
    excerptEn: "Creatine is the most studied supplement in the world. Here's what we actually know — without marketing exaggeration.",
    readTime: "6 min", date: "Février 2025", category: "Créatine / Creatine",
    contentFr: `## Ce que la créatine fait réellement

La créatine n'est pas une hormone. Ce n'est pas un stéroïde. C'est un composé naturellement présent dans votre corps (et dans la viande rouge) qui aide à régénérer l'ATP — la source d'énergie immédiate de vos muscles.

Concrètement : elle améliore les performances sur les efforts courts et intenses (sprints, séries de musculation, entraînement interval). Elle permet de faire 1 à 2 répétitions de plus sur vos séries, ce qui, cumulé sur des mois, représente un volume d'entraînement significatif.

**Ce qu'elle ne fait pas :** elle ne brûle pas les graisses, n'augmente pas la testostérone, et n't améliore pas l'endurance de longue durée.

## Dosage

3 à 5g par jour, tous les jours — y compris les jours sans entraînement. La saturation musculaire prend 3 à 4 semaines à cette dose.

La phase de charge (20g/jour pendant 5 jours) atteint la saturation plus vite mais cause fréquemment des problèmes digestifs. Pour la plupart des gens, 5g/jour est préférable.

## Avec quoi la mélanger

Avec n'importe quoi — eau, jus de fruit, shaker de whey. Le mythe selon lequel il faut la prendre avec du sucre pour l'absorption est largement dépassé. Prenez-la quand ça vous convient le mieux dans la journée.

## L'eau et la rétention

La créatine attire l'eau dans les cellules musculaires — pas sous la peau. Vous prendrez 0,5 à 1 kg en quelques semaines, qui est de l'eau intracellulaire (pas de la graisse, pas de la rétention sous-cutanée). C'est normal et bénéfique pour les performances.`,
    contentEn: `## What creatine actually does

Creatine isn't a hormone. It's not a steroid. It's a compound naturally present in your body (and in red meat) that helps regenerate ATP — your muscles' immediate energy source.

Practically: it improves performance on short, intense efforts (sprints, weightlifting sets, interval training). It lets you do 1 to 2 more reps per set, which, accumulated over months, represents significant training volume.

**What it doesn't do:** it doesn't burn fat, doesn't increase testosterone, and doesn't improve long-duration endurance.

## Dosage

3 to 5g daily, every day — including rest days. Muscle saturation takes 3 to 4 weeks at this dose.

The loading phase (20g/day for 5 days) reaches saturation faster but frequently causes digestive issues. For most people, 5g/day is preferable.

## What to mix it with

Anything — water, juice, whey shake. The myth that you need to take it with sugar for absorption is largely outdated. Take it whenever works best for you during the day.

## Water and retention

Creatine draws water into muscle cells — not under the skin. You'll gain 0.5 to 1kg in a few weeks, which is intracellular water (not fat, not subcutaneous retention). This is normal and beneficial for performance.`,
  },
  {
    slug: "perdre-gras-garder-muscle",
    titleFr: "Comment perdre de la graisse sans perdre du muscle : le guide pratique",
    titleEn: "How to Lose Fat Without Losing Muscle: The Practical Guide",
    excerptFr: "La plupart des régimes font perdre muscle autant que graisse. Voici comment éviter ça avec l'alimentation et les bons compléments.",
    excerptEn: "Most diets lose muscle as much as fat. Here's how to avoid that with nutrition and the right supplements.",
    readTime: "7 min", date: "Mars 2025", category: "Nutrition",
    contentFr: `## Le vrai problème d'un déficit calorique

Quand vous mangez moins de calories que vous n'en dépensez, votre corps puise dans ses réserves. Idéalement, ces réserves sont la graisse. En pratique, sans précautions, il utilise aussi le muscle.

C'est le problème central de tous les régimes : la perte de muscle réduit le métabolisme, ce qui rend la perte de graisse de plus en plus difficile, et le corps moins tonique même à poids équivalent.

## Les deux variables qui font la différence

**1. Les protéines**

Un apport protéique élevé pendant un déficit calorique est le facteur le plus important pour préserver le muscle. La recherche suggère 1,6 à 2,2g de protéines par kg de poids de corps par jour — nettement plus que les recommandations générales.

Si vous pesez 80kg, ça représente 128 à 176g de protéines par jour. C'est difficile à atteindre uniquement par l'alimentation pour la plupart des gens — c'est là où la whey devient utile, pas comme substitut mais comme complément à une alimentation protéinée.

**2. L'entraînement en résistance**

Le muscle se maintient parce qu'il est sollicité. Même en déficit calorique, si vous soulevez des charges, votre corps a une raison de conserver le muscle. Si vous ne faites que du cardio, la perte musculaire est presque inévitable.

## Le rôle des compléments

- **Whey :** pour atteindre l'apport protéique journalier
- **Créatine :** maintient les performances à la salle même en déficit (moins de force = moins de signal pour garder le muscle)
- **BCAA :** utile si vous vous entraînez à jeun, moins nécessaire si votre apport protéique total est suffisant`,
    contentEn: `## The real problem with a calorie deficit

When you eat fewer calories than you burn, your body draws from its reserves. Ideally, those reserves are fat. In practice, without precautions, it uses muscle too.

This is the central problem with all diets: muscle loss reduces metabolism, making fat loss progressively harder, and the body less toned even at the same weight.

## The two variables that make the difference

**1. Protein**

High protein intake during a calorie deficit is the most important factor for preserving muscle. Research suggests 1.6 to 2.2g of protein per kg of bodyweight per day — significantly more than general recommendations.

If you weigh 80kg, that's 128 to 176g of protein per day. That's hard to reach through food alone for most people — that's where whey becomes useful, not as a substitute but as a complement to a protein-rich diet.

**2. Resistance training**

Muscle is maintained because it's used. Even in a calorie deficit, if you lift weights, your body has a reason to keep the muscle. If you only do cardio, muscle loss is almost inevitable.

## The role of supplements

- **Whey:** to reach daily protein intake
- **Creatine:** maintains gym performance even in deficit (less strength = less signal to keep muscle)
- **BCAA:** useful if you train fasted, less necessary if total protein intake is sufficient`,
  },
];

export default function Blog() {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container-herb max-w-4xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="py-16">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">
              {fr?"Nutrition & Performance":"Nutrition & Performance"}
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {fr?"Le Blog":"The Blog"}
            </h1>
            <p className="font-body text-base text-muted-foreground max-w-lg">
              {fr
                ? "Des guides basés sur la recherche, pas sur le marketing. Rédigés par des gens qui utilisent les produits."
                : "Research-based guides, not marketing. Written by people who use the products."
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 pb-16">
            {BLOG_POSTS.map((post, i) => (
              <motion.article key={post.slug} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} viewport={{ once:true }}>
                <Link to={`/blog/${post.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-body text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">{post.category}</span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Clock className="w-3 h-3"/>{post.readTime}</span>
                    </div>
                    <h2 className="font-display text-lg font-semibold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                      {fr ? post.titleFr : post.titleEn}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                      {fr ? post.excerptFr : post.excerptEn}
                    </p>
                    <span className="inline-flex items-center gap-1.5 font-body text-sm text-primary font-medium">
                      {fr?"Lire la suite":"Read more"} <ArrowRight className="w-3.5 h-3.5"/>
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
