// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoUploadSection } from "./logo-upload-section";

function createProps() {
  return {
    placementLabel: "Pecho izquierdo",
    accept: "image/png,image/jpeg",
    expanded: true,
    onExpandToggle: vi.fn(),
    onFileChange: vi.fn(),
    onRemove: vi.fn(),
  };
}

describe("LogoUploadSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("se comporta como un atributo expandible pendiente", () => {
    const props = createProps();
    render(<LogoUploadSection {...props} isActive />);

    expect(screen.getByText("Imagen de logo")).toBeTruthy();
    expect(screen.getByText("Pendiente de cargar")).toBeTruthy();
    expect(screen.getByText(/pecho izquierdo/i)).toBeTruthy();
    expect(screen.getByText("Editando")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /imagen de logo/i }));
    expect(props.onExpandToggle).toHaveBeenCalledOnce();
  });

  it("muestra el archivo cargado y permite quitarlo", () => {
    const props = createProps();
    render(
      <LogoUploadSection
        {...props}
        attachmentFilename="logo-cliente.png"
      />,
    );

    expect(screen.getAllByText("logo-cliente.png").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(props.onRemove).toHaveBeenCalledOnce();
  });

  it("oculta el cuerpo al contraerse", () => {
    render(<LogoUploadSection {...createProps()} expanded={false} />);

    expect(screen.queryByText(/adjunta la imagen/i)).toBeNull();
    expect(screen.queryByText(/obligatorio para poder guardar/i)).toBeNull();
  });
});
