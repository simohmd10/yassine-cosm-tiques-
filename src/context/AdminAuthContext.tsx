import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AdminAuthContextType {
  isAuthenticated:boolean; isLoading:boolean; userEmail:string|null;
  login:(email:string,password:string)=>Promise<{ok:boolean;error?:string}>;
  logout:()=>Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType|null>(null);

const SS_COUNT="sb_login_attempts"; const SS_LOCKED="sb_login_locked_until";
const RATE={maxAttempts:5,windowMs:10*60*1000};

function getCount(){ return parseInt(sessionStorage.getItem(SS_COUNT)??"0",10); }
function getLocked(){ return parseInt(sessionStorage.getItem(SS_LOCKED)??"0",10); }
function recordFail(){
  const c=getCount()+1; sessionStorage.setItem(SS_COUNT,String(c));
  if(c>=RATE.maxAttempts){ const u=Date.now()+RATE.windowMs; sessionStorage.setItem(SS_LOCKED,String(u)); sessionStorage.setItem(SS_COUNT,"0"); return "Trop de tentatives. Connexion bloquée 10 minutes."; }
  return `Email ou mot de passe invalide. ${RATE.maxAttempts-c} tentative(s) restante(s).`;
}
function resetRate(){ sessionStorage.removeItem(SS_COUNT); sessionStorage.removeItem(SS_LOCKED); }

async function fetchIsAdmin(userId:string):Promise<boolean> {
  const {data}=await supabase.from("profiles").select("role").eq("id",userId).single();
  return data?.role==="admin";
}

export function AdminAuthProvider({children}:{children:React.ReactNode}){
  const [isAuthenticated,setIsAuthenticated]=useState(false);
  const [isLoading,setIsLoading]=useState(true);
  const [userEmail,setUserEmail]=useState<string|null>(null);

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
    const now=Date.now(); const locked=getLocked();
    if(locked>now){ const m=Math.ceil((locked-now)/60_000); return{ok:false,error:`Connexion bloquée. Réessayez dans ${m} minute(s).`}; }
    const{data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error||!data.user) return{ok:false,error:recordFail()};
    if(!data.user.email_confirmed_at){await supabase.auth.signOut();return{ok:false,error:"Vérifiez votre email avant de vous connecter."};}
    const admin=await fetchIsAdmin(data.user.id);
    if(!admin){await supabase.auth.signOut();recordFail();return{ok:false,error:"Accès refusé. Ce compte n'a pas les privilèges admin."};}
    resetRate(); setIsAuthenticated(true); setUserEmail(data.user.email??null);
    return{ok:true};
  };

  const logout=async()=>{ await supabase.auth.signOut(); };

  return(
    <AdminAuthContext.Provider value={{isAuthenticated,isLoading,userEmail,login,logout}}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(){
  const ctx=useContext(AdminAuthContext);
  if(!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
