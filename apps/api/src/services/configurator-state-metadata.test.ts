import { describe, expect, it } from "vitest";
import {
  buildConfiguratorStateDescription,
  parseConfiguratorStateDescription,
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
});
