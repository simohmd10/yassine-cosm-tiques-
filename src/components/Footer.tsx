import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container-herb py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">iH</span>
              </div>
              <span className="font-display font-bold text-white text-lg">iherby<span className="text-primary">assine</span></span>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              {fr?"Compléments alimentaires premium. Qualité vérifiée. Livraison Cash on Delivery partout au Maroc.":"Premium dietary supplements. Verified quality. Cash on Delivery across Morocco."}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"><Instagram className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors"><Facebook className="w-4 h-4"/></a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">{fr?"Boutique":"Shop"}</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: fr?"Tous les produits":"All products", to:"/shop" },
                { label: fr?"Protéines":"Protein", to:"/shop?category=protein" },
                { label: fr?"Créatine":"Creatine", to:"/shop?category=creatine" },
                { label: fr?"Vitamines":"Vitamins", to:"/shop?category=vitamins" },
                { label: fr?"Brûleurs":"Fat burners", to:"/shop?category=fatburner" },
                { label: fr?"Pré-entraînement":"Pre-workout", to:"/shop?category=preworkout" },
              ].map(l => <li key={l.to}><Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">{fr?"Aide":"Help"}</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: fr?"Suivre ma commande":"Track my order", to:"/order-status" },
                { label: fr?"Livraison & Retours":"Shipping & Returns", to:"/shipping" },
                { label: "FAQ", to:"/faq" },
                { label: fr?"Nous contacter":"Contact us", to:"/contact" },
              ].map(l => <li key={l.to}><Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">{fr?"À propos":"About"}</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: fr?"Notre histoire":"Our story", to:"/about" },
                { label: fr?"Le Blog":"The Blog", to:"/blog" },
              ].map(l => <li key={l.to}><Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link></li>)}
              <li className="pt-2 border-t border-gray-800">
                <a href="mailto:contact@iherbyassine.ma" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Mail className="w-3 h-3"/> contact@iherbyassine.ma
                </a>
              </li>
              <li>
                <a href="tel:+212663422092" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Phone className="w-3 h-3"/> +212 663 422 092
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} iherbyassine. {fr?"Tous droits réservés.":"All rights reserved."}</span>
          <span>{fr?"Cash on Delivery · Livraison gratuite · Retours 14 jours":"Cash on Delivery · Free shipping · 14-day returns"}</span>
        </div>
      </div>
    </footer>
  );
}
