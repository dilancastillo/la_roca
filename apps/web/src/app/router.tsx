import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ConfiguratorPage } from "../pages/configurator-page";
import { AssetLabPage } from "../pages/asset-lab-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app/configurator/:saleOrderLineId" element={<ConfiguratorPage />} />
        <Route path="/tools/assets/lab" element={<AssetLabPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
