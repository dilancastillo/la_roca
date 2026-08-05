import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfiguratorPage } from "../pages/configurator-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";

const AssetLabPage = lazy(async () => {
  const module = await import("../pages/asset-lab-page");
  return { default: module.AssetLabPage };
});
const VisualCatalogPage = lazy(async () => {
  const module = await import("../pages/visual-catalog-page");
  return { default: module.VisualCatalogPage };
});

function DeferredPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main className="page-state">Cargando...</main>}>
      {children}
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app/configurator/:saleOrderLineId" element={<ConfiguratorPage />} />
        <Route
          path="/tools/visual-catalog/releases/:visualReleaseId/preview/:saleOrderLineId"
          element={<ConfiguratorPage catalogPreview />}
        />
        <Route
          path="/tools/assets/lab"
          element={
            <DeferredPage>
              <AssetLabPage />
            </DeferredPage>
          }
        />
        <Route
          path="/tools/visual-catalog"
          element={
            <DeferredPage>
              <VisualCatalogPage />
            </DeferredPage>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
