import { odooCall } from "../lib/odoo-client";

export async function getConfiguratorSession(env: any, saleOrderLineId: number) {
  // Aquí se configura:
  // - la línea
  // - el producto/template
  // - atributos
  // - valores
  // - exclusiones
  // - si ya existe imagen previa

  return {
    saleOrderLineId,
    productTemplateId: 123,
    productName: "Producto piloto",
    attributes: [],
    exclusions: [],
    graphicManifestKey: "blusa-antifluido",
    existingDesignUrl: undefined
  };
}