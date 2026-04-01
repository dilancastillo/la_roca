import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfiguratorPage } from "../pages/configurator-page";
import { NotFoundPage } from "../pages/not-found-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app/configurator/:saleOrderLineId" element={<ConfiguratorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}