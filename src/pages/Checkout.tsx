import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, ArrowLeft, Banknote, Tag, Copy, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import { insertOrder, validateCoupon } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { COUNTRIES } from "@/data/countries";
import { formatCurrency } from "@/lib/formatCurrency";

const ORDER_SESSION_PREFIX = "order_session_";
const ORDER_TOKEN_TTL_MS = 90 * 60 * 1000; // 90 minutes

const schema = z.object({
  email:     z.string().email().max(254),
  firstName: z.string().min(2).max(50),
  lastName:  z.string().min(2).max(50),
  phone:     z.string().min(8).max(20).regex(/^[\d\s\+\-\(\)]+$/),
  address:   z.string().min(5).max(200),
  city:      z.string().min(2).max(100),
  country:   z.string().min(2).max(2),
  zip:       z.string().max(10).optional(),
});
type FormData = z.infer<typeof schema>;

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async()=>{await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
      className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>}
    </button>
  );
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { lang, t } = useLang();
  const { data: liveProducts = [] } = useProducts();
  const [placed,       setPlaced]       = useState(false);
  const [orderRef,     setOrderRef]     = useState("");
  const [accessToken,  setAccessToken]  = useState("");
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [couponCode,   setCouponCode]   = useState("");
  const [discount,     setDiscount]     = useState(0);
  const [couponMsg,    setCouponMsg]    = useState<{text:string;ok:boolean}|null>(null);
  const [orderError,   setOrderError]   = useState<string|null>(null);

  const orderId  = useState(() => crypto.randomUUID())[0];
  const ref      = useState(() => crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase())[0];

  const { register, handleSubmit, formState:{ errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues:{ country:"MA" } });

  const stockErrors: { name: string; available: number; requested: number }[] = liveProducts.length > 0
    ? items.flatMap(({ product, quantity }) => {
        const live = liveProducts.find(p => p.id === product.id);
        if (live && live.stock < quantity) return [{ name: product.name, available: live.stock, requested: quantity }];
        return [];
      })
    : [];
  const hasStockError = stockErrors.length > 0;

  const applyCoupon = async () => {
    const res = await validateCoupon(couponCode, totalPrice);
    if (!res.valid) { setCouponMsg({ text: res.message||t("invalidCoupon"), ok:false }); setDiscount(0); return; }
    setDiscount(res.discount);
    setCouponMsg({ text:`${t("couponApplied")} — -${formatCurrency(res.discount)}`, ok:true });
  };

  const finalTotal = Math.max(0, totalPrice - discount);

  const onSubmit = async (data: FormData) => {
    setOrderError(null);
    try {
      const result = await insertOrder({
        id: orderId, order_ref: ref,
        customer: `${data.firstName} ${data.lastName}`,
        email: data.email, phone: data.phone,
        address: data.address, city: data.city, state:"", zip: data.zip??"", country: data.country,
        status: "pending", total: finalTotal,
        items: items.map(i=>({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
        paymentMethod: "cash_on_delivery",
        idempotencyKey: orderId,
        couponCode: couponCode || undefined,
        discountAmount: discount,
      });
      setOrderRef(ref);
      setAccessToken(result.accessToken);
      setConfirmedTotal(result.verifiedTotal);
      if (result.accessToken) {
        const placedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + ORDER_TOKEN_TTL_MS).toISOString();
        sessionStorage.setItem(
          `${ORDER_SESSION_PREFIX}${ref}`,
          JSON.stringify({ orderRef: ref, accessToken: result.accessToken, placedAt, expiresAt })
        );
      }
      setPlaced(true);
      clearCart();
      window.scrollTo({ top:0, behavior:"smooth" });
    } catch(e) {
      setOrderError(e instanceof Error ? e.message : "Erreur lors de la commande.");
    }
  };

  if (items.length === 0 && !placed) return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-20 text-center">
        <p className="font-display text-xl text-muted-foreground">{t("emptyCart")}</p>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">{t("continueShopping")}</Link>
      </main><Footer/></div>
  );

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-10 max-w-5xl">
        <AnimatePresence mode="wait">
          {placed ? (
            <motion.div key="success" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center py-16 max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">{t("orderSuccess")}</h1>
              <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("orderRef")}</span>
                  <span className="font-mono font-bold flex items-center">{orderRef}<CopyBtn value={orderRef}/></span>
                </div>
                {accessToken && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-700 font-medium mb-1">🔑 {lang==="fr"?"Jeton d'accès — sauvegardez-le pour suivre votre commande":"Access Token — save this to track your order"}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-800 break-all">{accessToken}</span>
                      <CopyBtn value={accessToken}/>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("paymentMethod")}</span>
                  <span className="font-semibold">{t("cashOnDelivery")}</span>
                </div>
                <div className="flex items-center justify-between font-bold border-t border-border pt-3">
                  <span>{t("total")}</span>
                  <span className="text-primary">{formatCurrency(confirmedTotal)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/order-status" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">{t("trackOrder")}</Link>
                <Link to="/shop" className="border border-border px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-colors">{t("continueShopping")}</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="w-4 h-4"/> {lang==="fr"?"Retour au panier":"Back to Cart"}
              </Link>
              <h1 className="font-display text-3xl font-bold text-foreground mb-8">{t("checkout")}</h1>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 space-y-8">
                    {/* Contact */}
                    <section>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("contactInfo")}</h2>
                      <div className="space-y-4">
                        {[{name:"email",label:t("email"),type:"email",ph:"exemple@email.com"},{name:"phone",label:t("phone"),type:"tel",ph:"+212 663 422 092"}].map(f=>(
                          <div key={f.name} className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
                            <input type={f.type} placeholder={f.ph} {...register(f.name as keyof FormData)}
                              className={`h-11 px-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 transition-all ${errors[f.name as keyof FormData]?"border-destructive focus:ring-destructive/30":"border-border focus:ring-primary/30"}`}/>
                            {errors[f.name as keyof FormData] && (
                              <p className="text-xs text-destructive">{f.name==="email"?t("emailInvalid"):t("phoneTooShort")}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    {/* Shipping */}
                    <section>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("shippingAddress")}</h2>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs uppercase tracking-wider text-muted-foreground">{t("country")}</label>
                          <select {...register("country")} className="h-11 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[{name:"firstName",label:t("firstName"),ph:"Mohammed"},{name:"lastName",label:t("lastName"),ph:"Assine"}].map(f=>(
                            <div key={f.name} className="flex flex-col gap-1">
                              <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
                              <input placeholder={f.ph} {...register(f.name as keyof FormData)}
                                className={`h-11 px-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 transition-all ${errors[f.name as keyof FormData]?"border-destructive focus:ring-destructive/30":"border-border focus:ring-primary/30"}`}/>
                              {errors[f.name as keyof FormData] && (
                                <p className="text-xs text-destructive">{t("nameTooShort")}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {[{name:"city",label:t("city"),ph:"Casablanca"},{name:"address",label:t("address"),ph:"Rue, Numéro, Quartier"}].map(f=>(
                          <div key={f.name} className="flex flex-col gap-1">
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">{f.label}</label>
                            <input placeholder={f.ph} {...register(f.name as keyof FormData)}
                              className={`h-11 px-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 transition-all ${errors[f.name as keyof FormData]?"border-destructive focus:ring-destructive/30":"border-border focus:ring-primary/30"}`}/>
                            {errors[f.name as keyof FormData] && (
                              <p className="text-xs text-destructive">{f.name==="address"?t("addressTooShort"):t("fieldRequired")}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                    {/* Payment */}
                    <section>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("paymentMethod")}</h2>
                      <div className="bg-card border-2 border-primary/30 rounded-xl p-4 flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-sm">{t("cashOnDelivery")}</p>
                          <p className="text-xs text-muted-foreground">{lang==="fr"?"Payez à la livraison":"Pay when your order arrives"}</p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
                      <h3 className="font-display font-semibold mb-4">{lang==="fr"?"Récapitulatif":"Order Summary"}</h3>
                      <div className="space-y-3 mb-5">
                        {items.map(i=>{
                          const name = lang==="fr"?(i.product.nameFr||i.product.name):i.product.name;
                          return(
                            <div key={i.product.id} className="flex justify-between text-sm">
                              <span className="text-foreground truncate mr-2">{name} <span className="text-muted-foreground">×{i.quantity}</span></span>
                              <span className="font-medium flex-shrink-0">{formatCurrency(i.product.price*i.quantity)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Coupon */}
                      <div className="border-t border-border pt-4 mb-4">
                        <div className="flex gap-2">
                          <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())}
                            placeholder={t("couponCode")}
                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"/>
                          <button type="button" onClick={applyCoupon}
                            className="px-3 h-9 bg-muted hover:bg-primary/10 text-sm rounded-lg border border-border transition-colors flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5"/>{t("applyCoupon")}
                          </button>
                        </div>
                        {couponMsg && <p className={`text-xs mt-1 ${couponMsg.ok?"text-primary":"text-destructive"}`}>{couponMsg.text}</p>}
                      </div>

                      <div className="space-y-2 text-sm border-t border-border pt-4 mb-5">
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("subtotal")}</span><span>{formatCurrency(totalPrice)}</span></div>
                        {discount>0&&<div className="flex justify-between text-primary"><span>{t("discount")}</span><span>-{formatCurrency(discount)}</span></div>}
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("shipping")}</span><span className="text-primary">{t("free")}</span></div>
                        <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                          <span>{t("total")}</span><span className="text-primary">{formatCurrency(finalTotal)}</span>
                        </div>
                      </div>

                      {hasStockError && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-800 flex gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>
                          <div>
                            <p className="font-medium mb-1">{t("stockCheckFailed")}</p>
                            {stockErrors.map(e => (
                              <p key={e.name}>{e.name}: {lang==="fr"?`${e.available} disponible(s)`:`${e.available} available`}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {orderError && <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/30 text-xs text-destructive">{orderError}</div>}

                      <button type="submit" disabled={isSubmitting || hasStockError}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                            {lang==="fr"?"Confirmation...":"Processing..."}
                          </span>
                        ) : `${t("placeOrder")} · ${formatCurrency(finalTotal)}`}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer/>
    </div>
  );
}
