import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import ComingSoonPage from "@/pages/ComingSoon";
import ProductsIndexPage from "@/pages/products/Index";
import NewProductPage from "@/pages/products/New";
import EditProductPage from "@/pages/products/Edit";
import ProductSetupPage from "@/pages/product-setup/Index";

function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

/** Client-side route tree — the SPA's equivalent of the Next.js app's
 * `src/app/admin/**` file-based routes. Every real feature module lands
 * under /admin; anything not built yet falls through to ComingSoonPage,
 * matching the original app's placeholder for un-built sidebar links. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/products" replace />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<ProductsIndexPage />} />
        <Route path="products/new" element={<NewProductPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="product-setup" element={<ProductSetupPage />} />
        <Route path="coming-soon/:slug" element={<ComingSoonPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/products" replace />} />
    </Routes>
  );
}
