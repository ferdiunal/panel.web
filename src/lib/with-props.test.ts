import { describe, expect, it } from "vitest";
import { resolveWithProps } from "./with-props";

describe("resolveWithProps", () => {
  it("normalizes style keys and merges className", () => {
    const resolved = resolveWithProps(
      {
        className: "from-header",
        style: {
          "object-fit": "cover",
          width: "100%",
        },
      },
      {
        class: "from-field",
        style: {
          height: "240px",
        },
      }
    );

    expect(resolved.className).toBe("from-header from-field");
    expect(resolved.style).toEqual({
      objectFit: "cover",
      width: "100%",
      height: "240px",
    });
  });

  it("supports attributes and top-level data/aria keys", () => {
    const resolved = resolveWithProps({
      attributes: {
        "data-testid": "value-node",
      },
      "aria-label": "title",
    });

    expect(resolved.attributes).toEqual({
      "data-testid": "value-node",
      "aria-label": "title",
    });
  });
});
