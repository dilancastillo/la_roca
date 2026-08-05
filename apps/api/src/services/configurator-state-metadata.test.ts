import { describe, expect, it } from "vitest";
import {
  buildConfiguratorStateDescription,
  parseConfiguratorStateDescription,
  parseVisualDefinitionVersionIds,
} from "./configurator-state-metadata.js";

describe("configurator state metadata", () => {
  it("serializa y recupera selecciones y valores personalizados", () => {
    const description = buildConfiguratorStateDescription({
      selectedValueIds: {
        "90": [9001, 9001],
        "91": [9101],
      },
      customValuesByValueId: {
        "9201": "LA ROCA",
      },
    });

    expect(parseConfiguratorStateDescription(description)).toEqual({
      selectedValueIds: {
        "90": [9001],
        "91": [9101],
      },
      customValuesByValueId: {
        "9201": "LA ROCA",
      },
    });
  });

  it("ignora descripciones sin metadata valida", () => {
    expect(parseConfiguratorStateDescription("sin metadata")).toBeUndefined();
    expect(
      parseConfiguratorStateDescription("la-roca-configurator-state:{mal json"),
    ).toBeUndefined();
  });

  it("conserva las versiones visuales fijadas al pedido", () => {
    const visualDefinitionVersionIds = [
      "d930cfb3-acd9-45d1-8599-0bfbfc367f7e",
      "68e4fefd-9797-4618-aa51-3a47d3df4102",
    ];
    const description = buildConfiguratorStateDescription({
      selectedValueIds: { "63": [334] },
      customValuesByValueId: {},
      visualDefinitionVersionIds,
    });

    expect(parseVisualDefinitionVersionIds(description)).toEqual(
      visualDefinitionVersionIds,
    );
    expect(
      parseConfiguratorStateDescription(description)
        ?.visualDefinitionVersionIds,
    ).toEqual(visualDefinitionVersionIds);
  });

  it("distingue metadata antigua de una lista visual vacia fijada", () => {
    const legacyDescription =
      'la-roca-configurator-state:{"version":1,"selectedValueIds":{"63":[334]},"customValuesByValueId":{}}';
    const currentDescription = buildConfiguratorStateDescription({
      selectedValueIds: { "63": [334] },
      customValuesByValueId: {},
    });

    expect(parseVisualDefinitionVersionIds(legacyDescription)).toBeUndefined();
    expect(parseVisualDefinitionVersionIds(currentDescription)).toEqual([]);
  });
});
