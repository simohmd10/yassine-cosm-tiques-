import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Contact() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", message:"" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container-herb max-w-4xl">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="py-16">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4">{fr?"Écrivez-nous":"Get in touch"}</p>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">{fr?"Contact":"Contact"}</h1>
            <p className="font-body text-base text-muted-foreground">{fr?"On répond à chaque message, généralement en quelques heures.":"We reply to every message, usually within a few hours."}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 pb-16">
            <div className="space-y-6">
              {[
                { icon: Mail,    label: "Email",    value: "contact@iherbyassine.ma", href:"mailto:contact@iherbyassine.ma" },
                { icon: Phone,   label: fr?"Téléphone":"Phone",   value: "+212 663 422 092", href:"tel:+212663422092" },
                { icon: MapPin,  label: fr?"Livraison":"Delivery", value: fr?"Partout au Maroc":"Across Morocco", href:null },
                { icon: MessageSquare, label:"WhatsApp", value:"+212 663 422 092", href:"https://wa.me/212663422092" },
              ].map(({ icon:Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary"/>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-0.5">{label}</p>
                    {href ? <a href={href} className="font-body text-sm font-medium text-foreground hover:text-primary transition-colors">{value}</a>
                    : <p className="font-body text-sm font-medium text-foreground">{value}</p>}
                  </div>
                </div>
              ))}
            </div>

            {sent ? (
              <div className="flex items-center justify-center bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
                <div>
                  <p className="text-3xl mb-3">✅</p>
                  <p className="font-display font-semibold text-foreground">{fr?"Message envoyé":"Message sent"}</p>
                  <p className="font-body text-sm text-muted-foreground mt-2">{fr?"On vous répond bientôt.":"We'll reply soon."}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name:"name", label:fr?"Nom":"Name", type:"text", ph:fr?"Votre nom":"Your name" },
                  { name:"email", label:"Email", type:"email", ph:"you@example.com" },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
                    <input type={f.type} placeholder={f.ph} required value={form[f.name as keyof typeof form]} onChange={e=>setForm({...form,[f.name]:e.target.value})}
                      className="h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="font-body text-xs uppercase tracking-wider text-muted-foreground">{fr?"Message":"Message"}</label>
                  <textarea rows={4} required placeholder={fr?"Votre message...":"Your message..."} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                    className="px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                  {fr?"Envoyer":"Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
