import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AdminAuthContextType {
  isAuthenticated:boolean; isLoading:boolean; userEmail:string|null;
  loginCooldown:number;
  login:(email:string,password:string)=>Promise<{ok:boolean;error?:string}>;
  logout:()=>Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType|null>(null);
const GENERIC_LOGIN_ERROR = "Email ou mot de passe invalide.";

async function fetchIsAdmin(userId:string):Promise<boolean> {
  const {data}=await supabase.from("profiles").select("role").eq("id",userId).single();
  return data?.role==="admin";
}

export function AdminAuthProvider({children}:{children:React.ReactNode}){
  const [isAuthenticated,setIsAuthenticated]=useState(false);
  const [isLoading,setIsLoading]=useState(true);
  const [userEmail,setUserEmail]=useState<string|null>(null);
  const [cooldown,setCooldown]=useState(0);

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){ const admin=await fetchIsAdmin(session.user.id); if(admin){setIsAuthenticated(true);setUserEmail(session.user.email??null);}else{await supabase.auth.signOut();} }
      setIsLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_OUT"||!session){setIsAuthenticated(false);setUserEmail(null);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const login=async(email:string,password:string)=>{
    if (cooldown > 0) return { ok:false, error:`Trop de tentatives. Réessayez dans ${cooldown}s.` };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user || !data.session) {
      // 15-second client-side cooldown after failure (server-side rate limit via Supabase Auth settings)
      setCooldown(15);
      const t = setInterval(()=>setCooldown(c=>{ if(c<=1){clearInterval(t);return 0;} return c-1; }),1000);
      return { ok:false, error:GENERIC_LOGIN_ERROR };
    }
    const admin = await fetchIsAdmin(data.user.id);
    if (!admin) { await supabase.auth.signOut(); return { ok:false, error:GENERIC_LOGIN_ERROR }; }
    setIsAuthenticated(true); setUserEmail(data.user.email??null);
    return { ok:true };
  };

  const logout=async()=>{ await supabase.auth.signOut(); };

  return(
    <AdminAuthContext.Provider value={{isAuthenticated,isLoading,userEmail,loginCooldown:cooldown,login,logout}}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(){
  const ctx=useContext(AdminAuthContext);
  if(!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
