import type { Product } from "@/data/products";

const MAX_RELATED = 6;
const MAX_UPSELL = 4;

export function getRelatedProducts(current: Product, allProducts: Product[], max = MAX_RELATED): Product[] {
  const safeMax = Math.min(Math.max(max, 1), MAX_RELATED);
  const byId = new Map(allProducts.map((p) => [p.id, p]));

  const manual = (current.relatedProducts ?? [])
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p) && p.id !== current.id);

  if (manual.length > 0) return manual.slice(0, safeMax);

  return allProducts
    .filter((p) => p.id !== current.id && p.category === current.category)
    .slice(0, safeMax);
}

export function getCartUpsellProducts(cartProducts: Product[], allProducts: Product[], max = MAX_UPSELL): Product[] {
  const safeMax = Math.min(Math.max(max, 1), MAX_UPSELL);
  const cartIds = new Set(cartProducts.map((p) => p.id));
  const cartCategories = new Set(cartProducts.map((p) => p.category));

  const categoryBased = allProducts.filter((p) => !cartIds.has(p.id) && cartCategories.has(p.category));
  if (categoryBased.length >= safeMax) return categoryBased.slice(0, safeMax);

  const bestSellerFallback = allProducts.filter((p) => !cartIds.has(p.id) && p.isBestSeller);
  const combined = [...categoryBased];
  for (const p of bestSellerFallback) {
    if (combined.some((c) => c.id === p.id)) continue;
    combined.push(p);
    if (combined.length >= safeMax) break;
  }
  return combined.slice(0, safeMax);
}
