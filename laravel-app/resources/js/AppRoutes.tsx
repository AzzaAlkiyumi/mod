import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";
import ComingSoonPage from "@/pages/ComingSoon";
import ProductsIndexPage from "@/pages/products/Index";
import NewProductPage from "@/pages/products/New";
import EditProductPage from "@/pages/products/Edit";
import ProductSetupPage from "@/pages/product-setup/Index";
import TaxComponentsPage from "@/pages/tax-management/Components";
import TaxClassificationsPage from "@/pages/tax-management/Classifications";
import TaxGroupsPage from "@/pages/tax-management/Groups";
import DrugSchedulesPage from "@/pages/DrugSchedules";
import QuotationsIndexPage from "@/pages/quotations/Index";
import NewQuotationPage from "@/pages/quotations/New";
import QuotationDetailPage from "@/pages/quotations/Detail";
import QuotationPreviewPage from "@/pages/QuotationPreview";
import POSPage from "@/pages/POS";
import RolesIndexPage from "@/pages/roles/Index";
import NewRolePage from "@/pages/roles/New";
import EditRolePage from "@/pages/roles/Edit";
import SettingsIndexPage from "@/pages/settings/Index";
import CurrencySettingsPage from "@/pages/settings/Currency";

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
      <Route path="/" element={<Navigate to="/admin/pos" replace />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Navigate to="/admin/pos" replace />} />
        <Route path="products" element={<ProductsIndexPage />} />
        <Route path="products/new" element={<NewProductPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="product-setup" element={<ProductSetupPage />} />
        <Route path="tax-management/components" element={<TaxComponentsPage />} />
        <Route path="tax-management/classifications" element={<TaxClassificationsPage />} />
        <Route path="tax-management/groups" element={<TaxGroupsPage />} />
        <Route path="drug-schedules" element={<DrugSchedulesPage />} />
        <Route path="quotations" element={<QuotationsIndexPage />} />
        <Route path="quotations/new" element={<NewQuotationPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="roles" element={<RolesIndexPage />} />
        <Route path="roles/new" element={<NewRolePage />} />
        <Route path="roles/:id/edit" element={<EditRolePage />} />
        <Route path="settings" element={<SettingsIndexPage />} />
        <Route path="settings/currency" element={<CurrencySettingsPage />} />
        <Route path="coming-soon/:slug" element={<ComingSoonPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
      {/* Deliberately outside AdminShell — the printable quotation document
          renders with no sidebar/header chrome, closest to true print output. */}
      <Route path="/quotation-preview/:id" element={<QuotationPreviewPage />} />
      <Route path="*" element={<Navigate to="/admin/pos" replace />} />
    </Routes>
  );
}
