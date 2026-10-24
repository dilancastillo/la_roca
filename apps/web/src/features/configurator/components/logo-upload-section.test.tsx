// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoUploadSection } from "./logo-upload-section";

function createProps() {
  return {
    placements: [{ valueId: 572, label: "Pecho izquierdo" }],
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

    expect(screen.getByText("Imágenes de logo")).toBeTruthy();
    expect(screen.getByText("0/3 imágenes cargadas")).toBeTruthy();
    expect(screen.getByText(/pecho izquierdo/i)).toBeTruthy();
    expect(screen.getByText("Editando")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /imágenes de logo/i }));
    expect(props.onExpandToggle).toHaveBeenCalledOnce();
  });

  it("muestra el archivo cargado y permite quitarlo", () => {
    const props = createProps();
    render(
      <LogoUploadSection
        {...props}
        placements={[
          {
            valueId: 572,
            label: "Pecho izquierdo",
            attachmentFilename: "logo-cliente.png",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("logo-cliente.png").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    expect(props.onRemove).toHaveBeenCalledWith(572);
  });

  it("oculta el cuerpo al contraerse", () => {
    render(<LogoUploadSection {...createProps()} expanded={false} />);

    expect(screen.queryByText(/selecciona hasta tres ubicaciones/i)).toBeNull();
    expect(screen.queryByText(/opcional. puedes cargar/i)).toBeNull();
  });

  it("limita las imágenes a tres", () => {
    const props = createProps();
    render(
      <LogoUploadSection
        {...props}
        placements={[1, 2, 3, 4].map((valueId) => ({
          valueId,
          label: `Ubicación ${valueId}`,
          ...(valueId <= 3 ? { attachmentFilename: `logo-${valueId}.png` } : {}),
        }))}
      />,
    );

    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(inputs).toHaveLength(4);
    expect(inputs[0]?.disabled).toBe(false);
    expect(inputs[3]?.disabled).toBe(true);
    expect(screen.getByText(/ya cargaste el máximo de tres imágenes/i)).toBeTruthy();
  });
});
