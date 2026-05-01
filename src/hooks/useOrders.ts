import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/context/AdminDataContext";

const isDev = import.meta.env.DEV;

interface CustomerRow { id:string; name:string; email:string; phone:string; address:string; created_at:string; }
interface OrderItemRow { id:string; order_id:string; product_id:string|null; product_name:string; quantity:number; price:number; price_at_purchase:number|null; }
interface OrderRow { id:string; order_ref:string|null; customer_id:string; customer_email:string|null; idempotency_key:string|null; status:string; total:number; payment_method:string; discount_amount:number|null; coupon_code:string|null; created_at:string; customers:CustomerRow|null; order_items:OrderItemRow[]; }

function toOrder(row: OrderRow): Order {
  const c = row.customers;
  return {
    id: row.id, order_ref: row.order_ref ?? row.id.slice(0,8).toUpperCase(),
    createdAt: row.created_at,
    customer: c?.name??"", email: c?.email??row.customer_email??"", phone: c?.phone??"",
    address: c?.address??"", city:"", state:"", zip:"", country:"",
    status: row.status as Order["status"], total: row.total,
    discountAmount: row.discount_amount ?? 0,
    couponCode: row.coupon_code ?? undefined,
    items: (row.order_items??[]).map(i=>({ productId:i.product_id??undefined, name:i.product_name, quantity:i.quantity, price:i.price_at_purchase??i.price })),
    paymentMethod: row.payment_method??"cash_on_delivery",
    date: new Date(row.created_at).toLocaleDateString("fr-MA", { year:"numeric", month:"short", day:"numeric" }),
  };
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select(`
        id, order_ref, customer_id, customer_email, idempotency_key,
        status, total, payment_method, discount_amount, coupon_code, created_at,
        customers ( id, name, email, phone, address ),
        order_items ( id, order_id, product_id, product_name, quantity, price, price_at_purchase )
      `).order("created_at", { ascending: false });
      if (error) { if (isDev) console.error("[Supabase] orders:", error.message); throw error; }
      return (data as unknown as OrderRow[]).map(toOrder);
    },
    retry: 1, staleTime: 30_000,
  });
}

export interface OrderItem { productId:string; name:string; quantity:number; price:number; }

export interface InsertOrderPayload {
  id:string; order_ref:string; customer:string; email:string; phone:string;
  address:string; city:string; state:string; zip:string; country:string;
  status:Order["status"]; total:number; items:OrderItem[]; paymentMethod:string;
  idempotencyKey:string; couponCode?:string; discountAmount?:number;
}

export interface InsertOrderResult { verifiedTotal:number; orderId:string; accessToken:string; idempotent:boolean; }

export async function insertOrder(order: InsertOrderPayload): Promise<InsertOrderResult> {
  if (order.items.length === 0) throw new Error("Votre panier est vide.");
  if (!order.idempotencyKey?.trim()) throw new Error("Clé d'idempotence manquante.");
  const seenIds = new Set(order.items.map(i => i.productId));
  if (seenIds.size !== order.items.length) throw new Error("Articles dupliqués dans le panier.");
  const invalid = order.items.filter(i => !i.productId || i.quantity <= 0 || i.quantity > 999);
  if (invalid.length > 0) throw new Error("Articles invalides dans le panier.");

  const { data, error } = await supabase.rpc("place_order", {
    p_order_id:       order.id,
    p_order_ref:      order.order_ref,
    p_customer_name:  order.customer,
    p_email:          order.email,
    p_phone:          order.phone,
    p_address:        [order.address, order.city, order.country].filter(Boolean).join(", "),
    p_status:         order.status,
    p_total:          order.total,
    p_payment_method: order.paymentMethod,
    p_items:          order.items.map(i => ({ product_id: i.productId, quantity: i.quantity })),
    p_idempotency_key: order.idempotencyKey,
    p_coupon_code:    order.couponCode ?? null,
    p_discount_amount: order.discountAmount ?? 0,
  });

  if (error) { if (isDev) console.error("[Supabase] place_order:", error.message); throw new Error(parseDbError(error.message)); }

  const result = data as { verified_total:number; order_id:string; access_token:string; idempotent:boolean; };
  return { verifiedTotal: result.verified_total??order.total, orderId: result.order_id??order.id, accessToken: result.access_token??"", idempotent: result.idempotent??false };
}

export interface OrderLookupResult { order_ref:string; status:Order["status"]; total:number; payment_method:string; created_at:string; discount_amount:number; coupon_code:string|null; items:{name:string;quantity:number;price_at_purchase:number;}[]; }

export async function lookupOrder(orderRef:string, accessToken:string): Promise<OrderLookupResult|null> {
  const { data, error } = await supabase.rpc("lookup_order", { p_order_ref: orderRef.trim().toUpperCase(), p_access_token: accessToken.trim() });
  if (error) { if (isDev) console.error("[Supabase] lookup_order:", error.message); throw new Error("Impossible de récupérer la commande."); }
  return data as OrderLookupResult|null;
}

export async function validateCoupon(code:string, cartTotal:number): Promise<{valid:boolean;discount:number;type:string;message?:string}> {
  const { data, error } = await supabase.from("coupons").select("*").eq("code", code.toUpperCase()).eq("is_active", true).single();
  if (error || !data) return { valid:false, discount:0, type:"", message:"Code promo invalide" };
  const now = new Date();
  if (data.expires_at && new Date(data.expires_at) < now) return { valid:false, discount:0, type:"", message:"Code promo expiré" };
  if (data.min_order_amount && cartTotal < data.min_order_amount) return { valid:false, discount:0, type:"", message:`Commande minimum: ${new Intl.NumberFormat("fr-MA",{style:"currency",currency:"MAD",minimumFractionDigits:0}).format(data.min_order_amount)}` };
  const discount = data.discount_type === "percentage" ? (cartTotal * data.discount_value / 100) : data.discount_value;
  return { valid:true, discount: Math.min(discount, cartTotal), type: data.discount_type };
}

export async function updateOrderStatusById(id:string, status:Order["status"]): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["orders"] });
}

export interface Review { id:string; product_id:string; user_id:string|null; user_name:string; rating:number; comment:string; created_at:string; }

export async function fetchProductReviews(productId:string): Promise<Review[]> {
  const { data, error } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending:false });
  if (error) return [];
  return data as Review[];
}

export async function submitReview(review: Omit<Review,"id"|"created_at">): Promise<void> {
  const { error } = await supabase.from("reviews").insert([review]);
  if (error) throw new Error(error.message);
}

function parseDbError(raw:string): string {
  if (!raw) return "Erreur lors de la commande. Veuillez réessayer.";
  const map: Record<string,string> = {
    EMPTY_CART: "Votre panier est vide.",
    OUT_OF_STOCK: afterColon(raw),
    PRODUCT_NOT_FOUND: "Un produit n'est plus disponible.",
    INVALID_QUANTITY: "Quantité invalide.",
    DUPLICATE_PRODUCT: "Article dupliqué dans le panier.",
  };
  for (const [code, msg] of Object.entries(map)) { if (raw.includes(code)) return msg; }
  return afterColon(raw) || "Erreur lors de la commande.";
}
function afterColon(s:string): string { const i=s.indexOf(":"); return i>-1?s.slice(i+1).trim():s; }
