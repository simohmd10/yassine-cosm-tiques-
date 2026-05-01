import type { Product } from "@/data/products";

const MAX_RELATED = 4;
const MAX_UPSELL = 3;

export function getRelatedProducts(current: Product, allProducts: Product[], max = MAX_RELATED): Product[] {
  const safe = Array.isArray(allProducts) ? allProducts : [];
  const safeMax = Math.min(Math.max(max, 1), MAX_RELATED);
  const others = safe.filter((p) => p.id !== current.id);
  const byId = new Map(safe.map((p) => [p.id, p]));

  // Level 1: manual related IDs
  const manual = (Array.isArray(current.relatedProducts) ? current.relatedProducts : [])
    .map((id) => byId.get(id))
    .filter((p): p is Product => p !== undefined && p.id !== current.id);

  const combined: Product[] = [...manual];

  // Level 2: same category
  for (const p of others) {
    if (combined.length >= safeMax) break;
    if (combined.some((c) => c.id === p.id)) continue;
    if (p.category === current.category) combined.push(p);
  }

  // Level 3: any remaining product
  for (const p of others) {
    if (combined.length >= safeMax) break;
    if (combined.some((c) => c.id === p.id)) continue;
    combined.push(p);
  }

  return combined.slice(0, safeMax);
}

export function getCartUpsellProducts(cartProducts: Product[], allProducts: Product[], max = MAX_UPSELL): Product[] {
  const safeCart = Array.isArray(cartProducts) ? cartProducts : [];
  const safe = Array.isArray(allProducts) ? allProducts : [];
  const safeMax = Math.min(Math.max(max, 1), MAX_UPSELL);

  const cartIds = new Set(safeCart.map((p) => p.id));
  const cartCategories = new Set(safeCart.map((p) => p.category));
  const nonCart = safe.filter((p) => !cartIds.has(p.id));

  const combined: Product[] = [];

  // Level 1: same category as cart items
  for (const p of nonCart) {
    if (combined.length >= safeMax) break;
    if (cartCategories.has(p.category)) combined.push(p);
  }

  // Level 2: best sellers not already included
  for (const p of nonCart) {
    if (combined.length >= safeMax) break;
    if (combined.some((c) => c.id === p.id)) continue;
    if (p.isBestSeller) combined.push(p);
  }

  // Level 3: any product not in cart
  for (const p of nonCart) {
    if (combined.length >= safeMax) break;
    if (combined.some((c) => c.id === p.id)) continue;
    combined.push(p);
  }

  return combined.slice(0, safeMax);
}
