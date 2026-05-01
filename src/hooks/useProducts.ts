import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

const isDev = import.meta.env.DEV;

export interface ProductRow {
  id: string; name: string; name_fr: string;
  description: string; description_fr: string;
  price: number; original_price: number | null;
  category: string; image: string;
  rating: number; reviews: number;
  badge: string | null; badge_fr: string | null;
  is_featured: boolean; is_best_seller: boolean;
  stock: number; flavors: string[] | null; weight: string | null;
  related_products: string[] | null;
  created_at: string;
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id, name: row.name, nameFr: row.name_fr,
    description: row.description, descriptionFr: row.description_fr,
    price: row.price, originalPrice: row.original_price ?? undefined,
    category: row.category as Product["category"],
    image: row.image, rating: row.rating, reviewCount: row.reviews,
    badge: row.badge ?? undefined, badgeFr: row.badge_fr ?? undefined,
    isFeatured: row.is_featured, isBestSeller: row.is_best_seller,
    stock: row.stock ?? 0,
    flavors: row.flavors ?? undefined, weight: row.weight ?? undefined,
    relatedProducts: row.related_products ?? undefined,
  };
}

export function toRow(p: Omit<Product, "id">): Omit<ProductRow, "id" | "created_at"> {
  return {
    name: p.name, name_fr: p.nameFr,
    description: p.description, description_fr: p.descriptionFr,
    price: Number(p.price), original_price: p.originalPrice ? Number(p.originalPrice) : null,
    category: p.category, image: p.image || null,
    rating: Number(p.rating), reviews: Number(p.reviewCount),
    badge: p.badge || null, badge_fr: p.badgeFr || null,
    is_featured: Boolean(p.isFeatured), is_best_seller: Boolean(p.isBestSeller),
    stock: Number(p.stock ?? 0),
    flavors: p.flavors ?? null, weight: p.weight ?? null,
    related_products: p.relatedProducts ?? null,
  };
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) { if (isDev) console.error("[Supabase] products:", error.message); throw error; }
      return (data as ProductRow[]).map(toProduct);
    },
    retry: 1, staleTime: 30_000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["products", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) { if (isDev) console.error("[Supabase] product:", error.message); throw error; }
      return toProduct(data as ProductRow);
    },
    enabled: Boolean(id), retry: 1, staleTime: 30_000,
  });
}

export async function insertProduct(product: Omit<Product, "id">): Promise<void> {
  const { error } = await supabase.from("products").insert([toRow(product)]);
  if (error) throw new Error(error.message);
}

export async function updateProductById(id: string, patch: Partial<Product>): Promise<void> {
  const partial: Partial<Omit<ProductRow, "id" | "created_at">> = {};
  if (patch.name         !== undefined) partial.name           = patch.name;
  if (patch.nameFr       !== undefined) partial.name_fr        = patch.nameFr;
  if (patch.description  !== undefined) partial.description    = patch.description;
  if (patch.descriptionFr !== undefined) partial.description_fr = patch.descriptionFr;
  if (patch.price        !== undefined) partial.price          = Number(patch.price);
  if (patch.originalPrice !== undefined) partial.original_price = patch.originalPrice ? Number(patch.originalPrice) : null;
  if (patch.category     !== undefined) partial.category       = patch.category;
  if (patch.image        !== undefined) partial.image          = patch.image || null;
  if (patch.rating       !== undefined) partial.rating         = Number(patch.rating);
  if (patch.reviewCount  !== undefined) partial.reviews        = Number(patch.reviewCount);
  if (patch.badge        !== undefined) partial.badge          = patch.badge || null;
  if (patch.isFeatured   !== undefined) partial.is_featured    = Boolean(patch.isFeatured);
  if (patch.isBestSeller !== undefined) partial.is_best_seller = Boolean(patch.isBestSeller);
  if (patch.stock        !== undefined) partial.stock          = Number(patch.stock);
  if (patch.flavors      !== undefined) partial.flavors        = patch.flavors ?? null;
  if (patch.weight       !== undefined) partial.weight         = patch.weight ?? null;
  if (patch.relatedProducts !== undefined) partial.related_products = patch.relatedProducts ?? null;
  const { error } = await supabase.from("products").update(partial).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProductById(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seedProducts(rows: Omit<ProductRow, "id" | "created_at">[]): Promise<boolean> {
  const { error } = await supabase.from("products").insert(rows);
  if (error) { if (isDev) console.error("[Supabase] Seed failed:", error.message); return false; }
  return true;
}

export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["products"] });
}
