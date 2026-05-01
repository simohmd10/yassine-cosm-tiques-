import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AdminAuthContextType {
  isAuthenticated:boolean; isLoading:boolean; userEmail:string|null;
  login:(email:string,password:string)=>Promise<{ok:boolean;error?:string}>;
  logout:()=>Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType|null>(null);
const GENERIC_LOGIN_ERROR = "Email ou mot de passe invalide.";
function getDeviceFingerprint() {
  if (typeof navigator === "undefined") return "unknown";
  return navigator.userAgent.slice(0, 180);
}

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
    const { data, error } = await supabase.functions.invoke<{
      ok:boolean;
      session?:{ access_token:string; refresh_token:string; };
      error?:string;
    }>("admin-login", {
      body: { email, password, deviceFingerprint: getDeviceFingerprint() },
    });
    if (error || !data?.ok || !data.session) return { ok:false, error:GENERIC_LOGIN_ERROR };
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (setSessionError) return { ok:false, error:GENERIC_LOGIN_ERROR };
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { ok:false, error:GENERIC_LOGIN_ERROR };
    const admin=await fetchIsAdmin(userData.user.id);
    if(!admin){ await supabase.auth.signOut(); return { ok:false, error:GENERIC_LOGIN_ERROR }; }
    setIsAuthenticated(true); setUserEmail(userData.user.email??null);
    return { ok:true };
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
