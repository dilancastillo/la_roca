// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttributeSection } from "./attribute-section";

function createProps() {
  return {
    group: {
      attributeId: 10,
      label: "Modelo de cuello",
      helpText: "Selecciona una variante de cuello.",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [
        { id: 1, name: "Modelo 1" },
        { id: 2, name: "Modelo 2" },
      ],
    },
    selectedValueIds: [1],
    disabledValueIds: new Set<number>(),
    onSelect: vi.fn(),
    onToggle: vi.fn(),
    onExpandToggle: vi.fn(),
    selectionLabel: "Modelo 1",
  };
}

function createColorProps() {
  return {
    ...createProps(),
    group: {
      attributeId: 20,
      label: "Color",
      helpText: "Usa los colores exactos configurados en Odoo.",
      controlType: "color" as const,
      selectionMode: "single" as const,
      options: [
        { id: 1, name: "110601 - Blanco", colorHex: "#f8fafc" },
        { id: 2, name: "146305 - Azul Aruba", colorHex: "#7bb6d6" },
        { id: 3, name: "154225 - Rojo intenso", colorHex: "#c1121f" },
      ],
    },
    selectedValueIds: [1],
    selectionLabel: "110601 - Blanco",
  };
}

function createImageProps() {
  return {
    ...createProps(),
    group: {
      attributeId: 30,
      label: "Modelo bolsillo inferior",
      helpText: "Selecciona el modelo del bolsillo.",
      controlType: "image" as const,
      selectionMode: "single" as const,
      options: [
        { id: 1, name: "Modelo 1", imageSrc: "/modelo-1.svg" },
        { id: 2, name: "Modelo 2", imageSrc: "/modelo-2.svg" },
      ],
    },
    selectionLabel: "Modelo 1",
  };
}

describe("AttributeSection", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra resumen visible cuando está colapsado", () => {
    const baseProps = createProps();
    render(<AttributeSection {...baseProps} expanded={false} />);

    expect(screen.getByRole("button", { name: /modelo de cuello/i })).toBeTruthy();
    expect(screen.getByText("Modelo 1")).toBeTruthy();
    expect(screen.queryByText("Selecciona una variante de cuello.")).toBeNull();
  });

  it("muestra opciones e informa el toggle cuando se expande", () => {
    const baseProps = createProps();
    render(<AttributeSection {...baseProps} expanded />);

    expect(screen.getByText("Selecciona una variante de cuello.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /modelo 2/i }));
    expect(baseProps.onSelect).toHaveBeenCalledWith(2);
  });

  it("oculta opciones excluidas en controles de botones", () => {
    const baseProps = createProps();
    render(
      <AttributeSection
        {...baseProps}
        disabledValueIds={new Set([2])}
        expanded
      />,
    );

    const optionList = screen.getByRole("list");
    expect(
      within(optionList).getByRole("button", { name: /modelo 1/i }),
    ).toBeTruthy();
    expect(
      within(optionList).queryByRole("button", { name: /modelo 2/i }),
    ).toBeNull();
  });

  it("filtra colores por codigo de cliente o nombre", () => {
    const baseProps = createColorProps();
    render(<AttributeSection {...baseProps} expanded />);

    fireEvent.click(screen.getByRole("button", { name: /buscar en color/i }));
    const searchInput = screen.getByLabelText(/buscar codigo o color en color/i);

    fireEvent.change(searchInput, { target: { value: "146305" } });
    let swatchGrid = screen.getByRole("list");
    expect(
      within(swatchGrid).getByRole("button", { name: /146305 - azul aruba/i }),
    ).toBeTruthy();
    expect(
      within(swatchGrid).queryByRole("button", { name: /110601 - blanco/i }),
    ).toBeNull();

    fireEvent.change(searchInput, { target: { value: "rojo" } });
    swatchGrid = screen.getByRole("list");
    expect(
      within(swatchGrid).getByRole("button", { name: /154225 - rojo intenso/i }),
    ).toBeTruthy();
    expect(
      within(swatchGrid).queryByRole("button", { name: /146305 - azul aruba/i }),
    ).toBeNull();
  });

  it("oculta colores excluidos antes de aplicar la busqueda", () => {
    const baseProps = createColorProps();
    render(
      <AttributeSection
        {...baseProps}
        disabledValueIds={new Set([2])}
        expanded
      />,
    );

    const swatchGrid = screen.getByRole("list");
    expect(
      within(swatchGrid).getByRole("button", { name: /110601 - blanco/i }),
    ).toBeTruthy();
    expect(
      within(swatchGrid).queryByRole("button", { name: /146305 - azul aruba/i }),
    ).toBeNull();
  });

  it("oculta opciones excluidas en controles de imagen", () => {
    const baseProps = createImageProps();
    render(
      <AttributeSection
        {...baseProps}
        disabledValueIds={new Set([2])}
        expanded
      />,
    );

    const optionList = screen.getByRole("list");
    expect(
      within(optionList).getByRole("button", { name: /modelo 1/i }),
    ).toBeTruthy();
    expect(
      within(optionList).queryByRole("button", { name: /modelo 2/i }),
    ).toBeNull();
  });

  it("permite limpiar la busqueda de color", () => {
    const baseProps = createColorProps();
    render(<AttributeSection {...baseProps} expanded />);

    fireEvent.click(screen.getByRole("button", { name: /buscar en color/i }));
    const searchInput = screen.getByLabelText(/buscar codigo o color en color/i);

    fireEvent.change(searchInput, { target: { value: "146305" } });
    fireEvent.click(screen.getByRole("button", { name: /limpiar busqueda de color/i }));

    expect((searchInput as HTMLInputElement).value).toBe("");
    const swatchGrid = screen.getByRole("list");
    expect(
      within(swatchGrid).getByRole("button", { name: /110601 - blanco/i }),
    ).toBeTruthy();
    expect(
      within(swatchGrid).getByRole("button", { name: /146305 - azul aruba/i }),
    ).toBeTruthy();
  });
});
