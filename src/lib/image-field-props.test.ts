import { describe, expect, it } from "vitest";
import type { FieldData } from "@/types";
import { resolveImageFieldPropsFromFields } from "./image-field-props";

function makeField(props: Record<string, unknown>): FieldData {
  return {
    data: null,
    disabled: false,
    filterable: false,
    help_text: "",
    key: "image",
    label: "Image",
    name: "Image",
    nullable: true,
    placeholder: "",
    props,
    read_only: false,
    required: false,
    sortable: false,
    stacked: false,
    text_align: "left",
    type: "image",
    view: "image-field-index",
  };
}

describe("resolveImageFieldPropsFromFields", () => {
  it("normalizes kebab-case style keys from field props", () => {
    const field = makeField({
      style: {
        height: "auto",
        "object-fit": "cover",
        width: "100%",
      },
    });

    const resolved = resolveImageFieldPropsFromFields(field);

    expect(resolved.style).toEqual({
      height: "auto",
      objectFit: "cover",
      width: "100%",
    });
  });

  it("applies later field props as override while keeping previous values", () => {
    const header = makeField({
      alt: "Header alt",
      className: "header-class",
      loading: "lazy",
      style: {
        width: "100%",
        "object-fit": "cover",
      },
    });

    const rowField = makeField({
      alt: "Row alt",
      className: "row-class",
      style: {
        height: "240px",
      },
    });

    const resolved = resolveImageFieldPropsFromFields(header, rowField);

    expect(resolved.alt).toBe("Row alt");
    expect(resolved.className).toBe("row-class");
    expect(resolved.loading).toBe("lazy");
    expect(resolved.style).toEqual({
      width: "100%",
      objectFit: "cover",
      height: "240px",
    });
  });
});
