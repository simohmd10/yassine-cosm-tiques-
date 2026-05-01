import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster }           from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { CartProvider }      from "@/context/CartContext";
import { WishlistProvider }  from "@/context/WishlistContext";
import { AuthProvider }      from "@/context/AuthContext";
import { LanguageProvider }  from "@/context/LanguageContext";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { ErrorBoundary }     from "@/components/ErrorBoundary";

const Index        = lazy(() => import("./pages/Index"));
const Shop         = lazy(() => import("./pages/Shop"));
const ProductDetail= lazy(() => import("./pages/ProductDetail"));
const Cart         = lazy(() => import("./pages/Cart"));
const Checkout     = lazy(() => import("./pages/Checkout"));
const OrderStatus  = lazy(() => import("./pages/OrderStatus"));
const Wishlist     = lazy(() => import("./pages/Wishlist"));
const Login        = lazy(() => import("./pages/Login"));
const Register     = lazy(() => import("./pages/Register"));
const Account      = lazy(() => import("./pages/Account"));
const About        = lazy(() => import("./pages/About"));
const Contact      = lazy(() => import("./pages/Contact"));
const ShippingRet  = lazy(() => import("./pages/ShippingReturns"));
const FAQ          = lazy(() => import("./pages/FAQ"));
const Blog         = lazy(() => import("./pages/Blog"));
const BlogPost     = lazy(() => import("./pages/BlogPost"));
const NotFound     = lazy(() => import("./pages/NotFound"));

const AdminLogin   = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard    = lazy(() => import("./pages/admin/Dashboard"));
const Products     = lazy(() => import("./pages/admin/Products"));
const ProductForm  = lazy(() => import("./pages/admin/ProductForm"));
const Orders       = lazy(() => import("./pages/admin/Orders"));
const Customers    = lazy(() => import("./pages/admin/Customers"));
const Categories   = lazy(() => import("./pages/admin/Categories"));
const Settings     = lazy(() => import("./pages/admin/Settings"));
const AuditLog     = lazy(() => import("./pages/admin/AuditLog"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminLayout  = lazy(() => import("./components/admin/AdminLayout"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry:1, staleTime:30_000 } },
});

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <Loader/>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace/>;
}

function AdminRoot() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <Loader/>;
  return isAuthenticated ? <Navigate to="/admin/dashboard" replace/> : <AdminLogin/>;
}

function AdminSection() {
  return (
    <AdminDataProvider>
      <Routes>
        <Route path="/"    element={<AdminRoot/>}/>
        <Route path="/*"   element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>
          <Route path="dashboard"         element={<Dashboard/>}/>
          <Route path="products"          element={<Products/>}/>
          <Route path="products/new"      element={<ProductForm/>}/>
          <Route path="products/:id/edit" element={<ProductForm/>}/>
          <Route path="orders"            element={<Orders/>}/>
          <Route path="customers"         element={<Customers/>}/>
          <Route path="categories"        element={<Categories/>}/>
          <Route path="audit-log"         element={<AuditLog/>}/>
          <Route path="reviews"           element={<AdminReviews/>}/>
          <Route path="settings"          element={<Settings/>}/>
        </Route>
      </Routes>
    </AdminDataProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AdminAuthProvider>
                  <TooltipProvider>
                    <Toaster/><Sonner/>
                    <BrowserRouter>
                      <Suspense fallback={<Loader/>}>
                        <Routes>
                          <Route path="/"               element={<Index/>}/>
                          <Route path="/shop"           element={<Shop/>}/>
                          <Route path="/product/:id"    element={<ProductDetail/>}/>
                          <Route path="/cart"           element={<Cart/>}/>
                          <Route path="/checkout"       element={<Checkout/>}/>
                          <Route path="/order-status"   element={<OrderStatus/>}/>
                          <Route path="/wishlist"       element={<Wishlist/>}/>
                          <Route path="/login"          element={<Login/>}/>
                          <Route path="/register"       element={<Register/>}/>
                          <Route path="/account"        element={<Account/>}/>
                          <Route path="/about"          element={<About/>}/>
                          <Route path="/contact"        element={<Contact/>}/>
                          <Route path="/shipping"       element={<ShippingRet/>}/>
                          <Route path="/faq"            element={<FAQ/>}/>
                          <Route path="/blog"           element={<Blog/>}/>
                          <Route path="/blog/:slug"     element={<BlogPost/>}/>
                          <Route path="/admin/*"        element={<AdminSection/>}/>
                          <Route path="*"               element={<NotFound/>}/>
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </TooltipProvider>
                </AdminAuthProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
