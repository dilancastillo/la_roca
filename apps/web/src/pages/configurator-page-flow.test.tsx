// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { ConfiguratorPage } from "./configurator-page";

const mocks = vi.hoisted(() => ({ session: undefined as ConfiguratorSession | undefined, save: vi.fn() }));
vi.mock("../features/auth/hooks/use-auth-session", () => ({ useAuthSession: () => ({ data: { user: { name: "Asesor", isAdmin: false } }, isLoading: false, isError: false }) }));
vi.mock("../features/configurator/hooks/use-configurator-session", () => ({ useConfiguratorSession: () => ({ data: mocks.session, isLoading: false, isFetching: false, isError: false }) }));
// Never emits a PNG: validation must guide the user even while rendering is
// pending, while a complete valid form must still refuse a stale/missing PNG.
vi.mock("../features/preview/components/design-preview-canvas", () => ({ DesignPreviewCanvas: () => <div>Vista previa pendiente</div> }));
vi.mock("../features/save-design/save-design", () => ({ saveDesign: mocks.save }));

function attribute(id: number, name: string, names: string[]) {
  return { id, name, displayType: "radio" as const, selectionMode: "single" as const, variantMode: "no_variant" as const,
    values: names.map((valueName, index) => ({ id: id * 100 + index, sourceValueId: id * 100 + index, name: valueName, attributeId: id, attributeName: name })) };
}

function freshUniform(): ConfiguratorSession {
  return {
    saleOrderLineId: 1, saleOrderId: 1, orderName: "S00001", productId: 1, productTemplateId: 7, productName: "Uniforme", graphicManifestKey: "uniforme",
    attributes: [attribute(142, "Género", ["Mujer"]), attribute(141, "Material", ["Antifluido"]), attribute(798, "Color", ["Azul prueba"]), attribute(143, "Talla de blusa", ["Ninguno", "M sin tallar"]), attribute(163, "Talla pantalón", ["Ninguno", "8"]), attribute(145, "Modelo de cuello", ["Ninguno", "CUELLO V"]), attribute(154, "Modelo bolsillo inferior", ["Sin selección", "Ninguno", "RECTANGULAR"]), attribute(160, "Tipo bota", ["Personalizado", "Original"]), attribute(161, "Largo bota", ["Original", "Largo"]), attribute(162, "Ancho bota", ["Original", "Ancho"])],
    selectedValueIds: {}, customValuesByValueId: {}, exclusions: [], visualDefinitions: [], warnings: [], existingDesignBase64: null,
    status: { canEdit: true, isLocked: false, orderState: "draft", version: 0, generatedAt: null },
  };
}

function openPage() {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={["/line/1"]}><Routes><Route path="/line/:saleOrderLineId" element={<ConfiguratorPage />} /></Routes></MemoryRouter></QueryClientProvider>);
}

describe("flujo real de guardar una línea nueva", () => {
  beforeEach(() => {
    mocks.session = freshUniform(); mocks.save.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
    window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(0), 0);
    window.cancelAnimationFrame = window.clearTimeout;
  });
  afterEach(cleanup);

  it("al guardar vacío solicita color y después talla de blusa, sin autocompletarlas", async () => {
    openPage();
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Color" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "Azul prueba" }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Talla de blusa" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "M sin tallar" }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Talla pantalón" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "8" }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Modelo de cuello" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: /^Ninguno/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Modelo bolsillo inferior" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: /^Ninguno/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Tipo bota" antes de guardar.')).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
  }, 15000);

  it("conserva valores guardados y exige las medidas personalizadas sin inventar números", async () => {
    const session = mocks.session!;
    session.selectedValueIds = { "142": [14200], "141": [14100], "798": [79800], "143": [14301], "163": [16301], "145": [14500], "154": [15401], "160": [16000] };
    for (const id of [161, 162]) session.attributes.find((a) => a.id === id)!.values[1]!.allowsCustomValue = true;
    openPage();
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText("Faltan 2 textos personalizados obligatorios por llenar.")).toBeTruthy();
    const length = await screen.findByRole("textbox", { name: /Valor personalizado para Largo/ });
    expect((length as HTMLInputElement).value).toBe("");
    fireEvent.change(length, { target: { value: "100" } });
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Falta llenar el texto personalizado de "Ancho bota".')).toBeTruthy();
    expect((await screen.findByRole("textbox", { name: /Valor personalizado para Ancho/ }) as HTMLInputElement).value).toBe("");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("pide tallas antes del cuello con los Ninguno iniciales de una variante nueva", async () => {
    const session = mocks.session!;
    const noneIds = { "798": 3205, "143": 3121, "163": 3324, "145": 3171 };
    for (const [attributeId, noneId] of Object.entries(noneIds)) {
      const field = session.attributes.find((a) => a.id === Number(attributeId))!;
      if (attributeId === "798") field.values.unshift({ id: noneId, sourceValueId: noneId, name: "Ninguno", attributeId: Number(attributeId), attributeName: field.name });
      else field.values[0]!.id = noneId;
      session.selectedValueIds[attributeId] = [noneId];
    }
    session.exclusions.push({ sourceValueId: 14301, excludedValueId: 3171 });
    openPage();
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Color" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "Azul prueba" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Talla de blusa" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "M sin tallar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Talla pantalón" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Modelo de cuello" antes de guardar.')).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
  }, 15000);

  it("con datos completos no guarda hasta disponer del PNG actual", async () => {
    mocks.session!.selectedValueIds = { "142": [14200], "141": [14100], "798": [79800], "143": [14301], "163": [16301], "145": [14500], "154": [15401], "160": [16001] };
    openPage();
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText("La imagen aun se esta actualizando. Espera a que el preview quede en Listo y vuelve a guardar.")).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("permite elegir talla y bolsillo real antes de resolver el detalle dependiente Sin bolsillos", async () => {
    const session = mocks.session!;
    const pocket = session.attributes.find((a) => a.id === 154)!;
    pocket.values = [
      { id: 3312, sourceValueId: 3312, name: "Sin selección", attributeId: 154, attributeName: pocket.name },
      { id: 1214, sourceValueId: 1214, name: "Ninguno", attributeId: 154, attributeName: pocket.name },
      { id: 1202, sourceValueId: 594, name: "RECTANGULAR", attributeId: 154, attributeName: pocket.name },
    ];
    session.attributes.splice(session.attributes.indexOf(pocket) + 1, 0, {
      ...attribute(815, "¿Bolsillos inferiores con cremallera?", ["No", "Si"]),
    }, { ...attribute(155, "Opciones de cremallera", ["Sin bolsillos", "Cremallera central"]),
      values: [
        { id: 1224, sourceValueId: 1224, name: "Sin bolsillos", attributeId: 155, attributeName: "Opciones de cremallera" },
        { id: 1225, sourceValueId: 1225, name: "Cremallera central", attributeId: 155, attributeName: "Opciones de cremallera" },
      ],
    });
    session.selectedValueIds = { "142": [14200], "141": [14100], "798": [79800], "143": [14300], "163": [16301], "145": [14500], "155": [1224], "815": [81500] };
    session.exclusions = [
      { sourceValueId: 1224, excludedValueId: 1202 },
      { sourceValueId: 14500, excludedValueId: 14301 },
      { sourceValueId: 14301, excludedValueId: 14500 },
    ];
    openPage();
    fireEvent.click(await screen.findByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Talla de blusa" antes de guardar.')).toBeTruthy();
    const blouseSize = await screen.findByRole("button", { name: "M sin tallar" });
    expect(blouseSize.hasAttribute("disabled")).toBe(false);
    fireEvent.click(blouseSize);
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Modelo de cuello" antes de guardar.')).toBeTruthy();
    fireEvent.click(await screen.findByRole("button", { name: /CUELLO V/ }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Modelo bolsillo inferior" antes de guardar.')).toBeTruthy();
    const realPocket = await screen.findByRole("button", { name: /RECTANGULAR/ });
    expect(realPocket.hasAttribute("disabled")).toBe(false);
    fireEvent.click(realPocket);
    fireEvent.click(screen.getByRole("button", { name: "Guardar diseno" }));
    expect(await screen.findByText('Selecciona un valor para "Tipo bota" antes de guardar.')).toBeTruthy();
    expect(mocks.save).not.toHaveBeenCalled();
  }, 15000);
});
