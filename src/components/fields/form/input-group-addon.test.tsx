import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddonAwareInput } from "./input-group-addon";
import { resolveFieldInputAddons } from "./input-group-addon-utils";

describe("resolveFieldInputAddons", () => {
  it("reads prefix/suffix aliases from field props", () => {
    const resolved = resolveFieldInputAddons({
      prefix: "₺",
      suffix: "/ay",
    });

    expect(resolved.startAddon).toBe("₺");
    expect(resolved.endAddon).toBe("/ay");
  });

  it("prioritizes explicit overrides over field props", () => {
    const resolved = resolveFieldInputAddons(
      {
        prefix: "$",
        suffix: "USD",
      },
      {
        startAddon: "TRY",
      }
    );

    expect(resolved.startAddon).toBe("TRY");
    expect(resolved.endAddon).toBe("USD");
  });
});

describe("AddonAwareInput", () => {
  it("renders a plain input when addons are missing", () => {
    render(
      <AddonAwareInput
        aria-label="plain-input"
        value="test"
        onChange={() => {}}
      />
    );

    const input = screen.getByLabelText("plain-input");
    expect(input.getAttribute("data-slot")).toBe("input");
  });

  it("renders input-group control when addons are provided", () => {
    render(
      <AddonAwareInput
        aria-label="grouped-input"
        value="10"
        onChange={() => {}}
        startAddon="$"
        endAddon="USD"
      />
    );

    const input = screen.getByLabelText("grouped-input");
    expect(input.getAttribute("data-slot")).toBe("input-group-control");
    expect(screen.getByText("$")).not.toBeNull();
    expect(screen.getByText("USD")).not.toBeNull();
  });
});
