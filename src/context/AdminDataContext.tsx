import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts, insertProduct, updateProductById, deleteProductById } from "@/hooks/useProducts";
import { useOrders, updateOrderStatusById } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { fetchCategories, saveCategory, deleteCategoryById, type Category } from "@/lib/category-service";

export type { Category };

export interface Order {
  id:string; order_ref:string; createdAt:string;
  customer:string; email:string; phone:string; address:string;
  city:string; state:string; zip:string; country:string; date:string;
  status: "pending"|"processing"|"shipped"|"delivered"|"cancelled";
  total:number; discountAmount:number; couponCode?:string;
  items:{ productId?:string; name:string; quantity:number; price:number; }[];
  paymentMethod:string;
}

export interface Customer { id:string; name:string; email:string; phone:string; joinDate:string; totalOrders:number; totalSpent:number; }

interface AdminDataContextType {
  products:Product[]; productsLoading:boolean;
  addProduct:(p:Omit<Product,"id">)=>Promise<void>;
  updateProduct:(id:string,d:Partial<Product>)=>Promise<void>;
  deleteProduct:(id:string)=>Promise<void>;
  orders:Order[]; ordersLoading:boolean;
  updateOrderStatus:(id:string,s:Order["status"])=>Promise<void>;
  customers:Customer[];
  categories:Category[]; categoriesLoading:boolean;
  addCategory:(c:Omit<Category,"id">)=>Promise<void>;
  updateCategory:(id:string,d:Partial<Category>)=>Promise<void>;
  deleteCategory:(id:string)=>Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType|null>(null);

export function AdminDataProvider({ children }:{ children:React.ReactNode }) {
  const qc = useQueryClient();
  const { data:products=[], isLoading:productsLoading } = useProducts();

  useEffect(() => {
    localStorage.removeItem("admin_orders"); localStorage.removeItem("admin_products");
  }, []);

  const addProduct    = async(p:Omit<Product,"id">)=>{ await insertProduct(p); qc.invalidateQueries({queryKey:["products"]}); };
  const updateProduct = async(id:string,d:Partial<Product>)=>{ await updateProductById(id,d); qc.invalidateQueries({queryKey:["products"]}); };
  const deleteProduct = async(id:string)=>{ await deleteProductById(id); qc.invalidateQueries({queryKey:["products"]}); };

  const { data:orders=[], isLoading:ordersLoading } = useOrders();
  const updateOrderStatus = async(id:string,s:Order["status"])=>{ await updateOrderStatusById(id,s); qc.invalidateQueries({queryKey:["orders"]}); };
  const { data:customers=[] } = useCustomers();

  const [categories,setCategories]=useState<Category[]>([]);
  const [categoriesLoading,setCategoriesLoading]=useState(true);

  const loadCategories = useCallback(async()=>{
    setCategoriesLoading(true);
    try {
      const data = await fetchCategories();
      if (data.length===0) {
        const init:Category[] = [
          {id:crypto.randomUUID(),name:"Protein",slug:"protein",description:"Whey, casein, plant protein"},
          {id:crypto.randomUUID(),name:"Vitamins",slug:"vitamins",description:"Essential vitamins & minerals"},
          {id:crypto.randomUUID(),name:"Creatine",slug:"creatine",description:"Creatine monohydrate"},
          {id:crypto.randomUUID(),name:"Fat Burner",slug:"fatburner",description:"Thermogenic supplements"},
          {id:crypto.randomUUID(),name:"Pre-Workout",slug:"preworkout",description:"Energy & focus"},
          {id:crypto.randomUUID(),name:"Recovery",slug:"recovery",description:"BCAA, glutamine"},
        ];
        for(const c of init) await saveCategory(c,"add");
        setCategories(init); qc.invalidateQueries({queryKey:["categories"]});
      } else { setCategories(data); }
    } catch(e){ console.error(e); } finally { setCategoriesLoading(false); }
  },[qc]);

  useEffect(()=>{ loadCategories(); },[loadCategories]);

  const addCategory = async(c:Omit<Category,"id">)=>{ const n={...c,id:crypto.randomUUID()}; await saveCategory(n,"add"); await loadCategories(); qc.invalidateQueries({queryKey:["categories"]}); };
  const updateCategory = async(id:string,d:Partial<Category>)=>{ const ex=categories.find(c=>c.id===id); if(!ex)return; await saveCategory({...ex,...d},"edit"); await loadCategories(); qc.invalidateQueries({queryKey:["categories"]}); };
  const deleteCategory = async(id:string)=>{ await deleteCategoryById(id); await loadCategories(); qc.invalidateQueries({queryKey:["categories"]}); };

  return (
    <AdminDataContext.Provider value={{
      products,productsLoading,addProduct,updateProduct,deleteProduct,
      orders,ordersLoading,updateOrderStatus,customers,
      categories,categoriesLoading,addCategory,updateCategory,deleteCategory,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
