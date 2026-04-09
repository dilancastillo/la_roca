// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("AttributeSection", () => {
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
});
