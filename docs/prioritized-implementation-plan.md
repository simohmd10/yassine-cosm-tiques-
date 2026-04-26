# Prioritized Implementation Plan (P0 / P1 / P2)

## Scope and non-UI constraint
- This plan focuses on security, reliability, and performance hardening.
- All listed tasks are designed to avoid visual UI/design changes. Any user-facing differences are limited to error messages/flow resilience and loading behavior, not layout, styles, colors, or component structure.

## P0 — Critical (fix immediately)

### P0-1) Add real idempotency protection for order creation
- **Issue**: checkout currently sends `p_idempotency_key: null` to `place_order`, so duplicate submissions can generate duplicate orders under retries/double-clicks.
- **Fix approach**:
  1. Generate a deterministic idempotency key on submit (UUID v4 per checkout attempt).
  2. Pass this key to `insertOrder` and then `place_order` RPC.
  3. Persist key for short retry window (sessionStorage) and clear on confirmed success.
  4. Normalize duplicate response handling (`idempotent=true`) so user receives one success state.
- **Affected files**:
  - `src/hooks/useOrders.ts`
  - `src/pages/Checkout.tsx`
  - `SUPABASE_COMPLETE.sql` (if DB function signature/policy needs update)
- **Estimated effort**: **3–5 hours**

### P0-2) Remove long-lived order access tokens from localStorage
- **Issue**: order tracking tokens are stored in localStorage and can be exfiltrated via XSS or compromised third-party script.
- **Fix approach**:
  1. Replace localStorage persistence with sessionStorage + TTL (short expiry) or in-memory state.
  2. Add one-way masking in “recent orders” helper (show only partial token metadata, never full token persisted long-term).
  3. Add cleanup routine on app boot for expired entries.
  4. Keep current order-status form UI unchanged.
- **Affected files**:
  - `src/pages/Checkout.tsx`
  - `src/pages/OrderStatus.tsx`
- **Estimated effort**: **2–4 hours**

### P0-3) Move admin login rate limiting enforcement to backend
- **Issue**: current lockout logic is client-side only (`sessionStorage`), easily bypassed.
- **Fix approach**:
  1. Keep frontend messaging, but remove trust in client-only counters.
  2. Enforce throttling server-side via Supabase auth protections / edge function / RPC gate (IP+email window).
  3. Map backend error codes to existing login error box without UI redesign.
- **Affected files**:
  - `src/context/AdminAuthContext.tsx`
  - Supabase auth configuration and/or DB/edge function files (new infra script)
- **Estimated effort**: **4–8 hours** (depends on chosen Supabase enforcement path)

## P1 — Important

### P1-1) Reduce admin first-load pressure from eager data hydration
- **Issue**: admin provider loads products, orders, customers, and categories immediately, even when not needed by current route.
- **Fix approach**:
  1. Split data fetching by route-level need (query only in relevant pages).
  2. Keep shared mutations/invalidation in context, but lazy-fetch resources.
  3. Add prefetch only for immediately adjacent screens (optional).
- **Affected files**:
  - `src/context/AdminDataContext.tsx`
  - `src/pages/admin/Dashboard.tsx`
  - `src/pages/admin/Products.tsx`
  - `src/pages/admin/Orders.tsx`
  - `src/pages/admin/Customers.tsx`
  - `src/pages/admin/Categories.tsx`
- **Estimated effort**: **5–8 hours**

### P1-2) Apply bundle chunking strategy to reduce large JS payload risk
- **Issue**: no manual chunk policy; large chunks risk parse/compile delays.
- **Fix approach**:
  1. Configure `build.rollupOptions.output.manualChunks` for vendor/admin/chart groups.
  2. Verify resulting chunk map and enforce max chunk budget in CI build check.
  3. Keep route behavior and visual output unchanged.
- **Affected files**:
  - `vite.config.ts`
  - `package.json` (optional script for size budget check)
- **Estimated effort**: **2–3 hours**

### P1-3) Add early stock validation in cart flow
- **Issue**: users can proceed to checkout then fail late due to inventory mismatch.
- **Fix approach**:
  1. Validate cart quantities against current stock during cart updates and before checkout submit.
  2. Show existing error/notification pattern (no layout change).
  3. Disable submit when known invalid, with actionable message.
- **Affected files**:
  - `src/context/CartContext.tsx`
  - `src/pages/Cart.tsx`
  - `src/pages/Checkout.tsx`
  - `src/hooks/useProducts.ts`
- **Estimated effort**: **4–6 hours**

## P2 — Improvements

### P2-1) Optimize Shop filtering for larger catalogs
- **Issue**: full-array filtering/sorting in render path scales poorly with catalog growth.
- **Fix approach**:
  1. Add query-driven filtering/pagination (server-side where possible).
  2. Debounce search parameter updates.
  3. Preserve exact UI controls and styles.
- **Affected files**:
  - `src/pages/Shop.tsx`
  - `src/hooks/useProducts.ts`
- **Estimated effort**: **4–7 hours**

### P2-2) Review and prune unused UI components
- **Issue**: unreferenced UI files increase maintenance and accidental bundle creep.
- **Fix approach**:
  1. Run import-usage audit and whitelist intentionally retained primitives.
  2. Remove clearly unused files in controlled batches.
  3. Run build + typecheck after each batch.
- **Affected files**:
  - `src/components/ui/*` (subset identified by audit)
- **Estimated effort**: **2–5 hours**

### P2-3) Improve checkout validation clarity (without redesign)
- **Issue**: mostly border-only error indication can increase form friction.
- **Fix approach**:
  1. Add concise field-level helper text using existing typography classes.
  2. Keep same spacing/layout and no new visual components.
- **Affected files**:
  - `src/pages/Checkout.tsx`
- **Estimated effort**: **2–3 hours**

## Sequencing recommendation
1. Execute **P0 only** first (as requested): P0-1 → P0-2 → P0-3.
2. Re-run build and smoke tests.
3. Share diff and validation notes for approval before P1.

## Explicit confirmation
- **Confirmed**: this plan is intentionally designed so fixes **do not change UI/design**.
- Any user-visible effect will be functional only (safer auth/order flows, better error handling/performance), while preserving current layout and styling.
