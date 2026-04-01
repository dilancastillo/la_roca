export async function getConfiguratorSession(
  _env: unknown,
  saleOrderLineId: number
) {
  return {
    saleOrderLineId,
    productTemplateId: 123,
    productName: "Producto piloto",
    attributes: [],
    exclusions: [],
    graphicManifestKey: "blusa-antifluido",
    existingDesignUrl: undefined,
  };
}