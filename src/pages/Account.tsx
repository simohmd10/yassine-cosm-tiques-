import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { User, Package, LogOut, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/formatCurrency";

interface MyOrder { id:string; order_ref:string; total:number; status:string; created_at:string; }

export default function Account() {
  const { user, signOut, loading } = useAuth();
  const { lang, t } = useLang();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [tab, setTab] = useState<"orders"|"profile">("orders");

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id,order_ref,total,status,created_at").eq("customer_email", user.email?.toLowerCase()).order("created_at",{ascending:false}).then(({data})=>{ if(data) setOrders(data as MyOrder[]); });
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return <Navigate to="/login" replace />;

  const STATUS_COLORS: Record<string,string> = { pending:"bg-amber-100 text-amber-700", processing:"bg-blue-100 text-blue-700", shipped:"bg-purple-100 text-purple-700", delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-background"><Navbar/>
      <main className="container-herb py-10 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary"/>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{t("myAccount")}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={signOut} className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4"/>{t("logout")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{key:"orders",label:t("myOrders"),icon:Package},{key:"profile",label:t("myProfile"),icon:User}].map(tab_=>( 
            <button key={tab_.key} onClick={()=>setTab(tab_.key as "orders"|"profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab===tab_.key?"bg-primary text-white":"bg-muted text-muted-foreground hover:text-foreground"}`}>
              <tab_.icon className="w-4 h-4"/>{tab_.label}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30"/>
                <p>{lang==="fr"?"Aucune commande trouvée":"No orders found"}</p>
              </div>
            ) : orders.map(order=>(
              <div key={order.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono font-semibold text-sm">{order.order_ref}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString(lang==="fr"?"fr-FR":"en-US")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]??""}`}>{order.status}</span>
                  <span className="font-bold text-sm">{formatCurrency(order.total)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4">{t("myProfile")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t("email")}</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">{lang==="fr"?"Membre depuis":"Member since"}</span>
                <span className="font-medium">{new Date(user.created_at).toLocaleDateString(lang==="fr"?"fr-FR":"en-US")}</span>
              </div>
            </div>
          </div>
        )}
      </main><Footer/></div>
  );
}
