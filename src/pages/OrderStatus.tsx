import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Package, CheckCircle2, Clock, Truck, XCircle, RotateCcw, ArrowLeft, Key } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { lookupOrder, type OrderLookupResult } from "@/hooks/useOrders";
import { useLang } from "@/context/LanguageContext";

const STATUS_CONFIG: Record<string,{label:string;labelFr:string;icon:React.ElementType;color:string;bg:string;step:number}> = {
  pending:    {label:"Order Received",labelFr:"Commande reçue",  icon:Clock,       color:"text-amber-600", bg:"bg-amber-50", step:1},
  processing: {label:"Processing",   labelFr:"En traitement",    icon:RotateCcw,   color:"text-blue-600",  bg:"bg-blue-50",  step:2},
  shipped:    {label:"Shipped",      labelFr:"Expédiée",         icon:Truck,       color:"text-purple-600",bg:"bg-purple-50",step:3},
  delivered:  {label:"Delivered",    labelFr:"Livrée",           icon:CheckCircle2,color:"text-green-600", bg:"bg-green-50", step:4},
  cancelled:  {label:"Cancelled",    labelFr:"Annulée",          icon:XCircle,     color:"text-red-600",   bg:"bg-red-50",   step:0},
};
const STEPS = ["pending","processing","shipped","delivered"];

interface Saved { orderRef:string; accessToken:string; placedAt:string; }
function getSaved():Saved[] {
  try { return Object.keys(localStorage).filter(k=>k.startsWith("order_token_")).map(k=>JSON.parse(localStorage.getItem(k)??"null")).filter(Boolean).sort((a:Saved,b:Saved)=>new Date(b.placedAt).getTime()-new Date(a.placedAt).getTime()); }
  catch { return []; }
}

export default function OrderStatus() {
  const { lang, t } = useLang();
  const [orderRef,    setOrderRef]    = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [result,      setResult]      = useState<OrderLookupResult|null>(null);
  const [notFound,    setNotFound]    = useState(false);
  const [apiError,    setApiError]    = useState<string|null>(null);
  const [loading,     setLoading]     = useState(false);
  const [saved,       setSaved]       = useState<Saved[]>([]);

  useEffect(()=>{ setSaved(getSaved()); },[]);

  const handleCheck = async(e:React.FormEvent)=>{
    e.preventDefault();
    if (!orderRef.trim() || !accessToken.trim()) return;
    setLoading(true); setResult(null); setNotFound(false); setApiError(null);
    try {
      const found = await lookupOrder(orderRef, accessToken);
      if (!found) setNotFound(true); else setResult(found);
    } catch(e) { setApiError(e instanceof Error ? e.message : "Erreur"); }
    finally { setLoading(false); }
  };

  const cfg = result ? (STATUS_CONFIG[result.status]??STATUS_CONFIG.pending) : null;

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-12 max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="w-4 h-4"/>Accueil</Link>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-primary"/></div>
          <h1 className="font-display text-2xl font-bold">{t("trackYourOrder")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{lang==="fr"?"Entrez votre référence et jeton d'accès":"Enter your order reference and access token"}</p>
        </div>

        {saved.length > 0 && !result && (
          <div className="mb-6 bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5"><Key className="w-3.5 h-3.5"/>{lang==="fr"?"Commandes récentes":"Recent orders"}</p>
            {saved.slice(0,3).map(s=>(
              <button key={s.orderRef} onClick={()=>{setOrderRef(s.orderRef);setAccessToken(s.accessToken);}}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/40 mb-2 last:mb-0 transition-colors">
                <span className="font-mono text-sm font-medium">{s.orderRef}</span>
                <span className="text-xs text-muted-foreground">{new Date(s.placedAt).toLocaleDateString("fr")}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleCheck} className="space-y-4 mb-8">
          {[{label:t("orderReference"),value:orderRef,set:setOrderRef,ph:"IH-XXXXXX",mono:true},{label:t("accessToken"),value:accessToken,set:setAccessToken,ph:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",mono:true}].map(f=>(
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
              <input value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                className={`h-11 px-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 border-border ${f.mono?"font-mono":""}`}/>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Search className="w-4 h-4"/>{t("checkStatus")}
          </button>
        </form>

        {apiError && <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-4 text-sm text-destructive">{apiError}</div>}
        {notFound && !apiError && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3"/>
            <p className="font-semibold">{lang==="fr"?"Commande introuvable":"Order not found"}</p>
          </div>
        )}
        {result && cfg && (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${cfg.bg}`}>
              <div className="flex items-center gap-2 mb-1"><cfg.icon className={`w-5 h-5 ${cfg.color}`}/><p className={`font-semibold ${cfg.color}`}>{lang==="fr"?cfg.labelFr:cfg.label}</p></div>
              <p className="font-mono text-xs text-muted-foreground">Ref: {result.order_ref}</p>
            </div>
            {result.status !== "cancelled" && (
              <div className="flex items-center gap-1">
                {STEPS.map((step,i)=>{ const done=(STATUS_CONFIG[step]?.step??0)<=(cfg.step??0); return <div key={step} className={`h-1.5 flex-1 rounded-full ${done?"bg-primary":"bg-muted"}`}/>; })}
              </div>
            )}
            <div className="bg-card border border-border rounded-xl divide-y text-sm">
              <div className="flex justify-between px-4 py-3"><span className="text-muted-foreground">{t("orderDate")}</span><span>{new Date(result.created_at).toLocaleDateString(lang==="fr"?"fr-FR":"en-US",{year:"numeric",month:"long",day:"numeric"})}</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-muted-foreground">{t("paymentMethod")}</span><span>{t("cashOnDelivery")}</span></div>
              {result.discount_amount>0&&<div className="flex justify-between px-4 py-3 text-primary"><span>{t("discount")}</span><span>-{result.discount_amount.toFixed(0)} MAD</span></div>}
              <div className="flex justify-between px-4 py-3 font-bold"><span>{t("total")}</span><span className="text-primary">{Number(result.total).toFixed(0)} MAD</span></div>
            </div>
            {result.items.length>0&&(
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("items")}</p>
                {result.items.map((item,i)=>(
                  <div key={i} className="flex justify-between text-sm mb-1.5">
                    <span>{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                    <span>{(item.price_at_purchase*item.quantity).toFixed(0)} MAD</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
