import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { FieldData } from "@/types";
import { renderResourceFieldValue } from "./resource-field-render";

function makeField(overrides: Partial<FieldData> & Pick<FieldData, "key" | "view">): FieldData {
  return {
    data: null,
    disabled: false,
    filterable: false,
    help_text: "",
    key: overrides.key,
    label: overrides.label ?? overrides.key,
    name: overrides.name ?? overrides.key,
    nullable: false,
    placeholder: "",
    props: {},
    read_only: false,
    required: false,
    sortable: false,
    stacked: false,
    text_align: "left",
    type: "text",
    view: overrides.view,
    ...overrides,
  };
}

describe("renderResourceFieldValue", () => {
  it("renders stack child field values from props.fields", () => {
    const stackField = makeField({
      key: "stack",
      view: "stack-field-index",
      type: "stack",
      props: {
        fields: [
          makeField({
            key: "name",
            view: "text-field",
            label: "Name",
            data: "John Doe",
            props: { span: 6 },
          }),
          makeField({
            key: "price",
            view: "number-field",
            label: "Price",
            data: 250,
            props: { span: 6 },
          }),
        ],
      },
    });

    const rendered = renderResourceFieldValue(stackField, stackField, { stack: stackField });
    render(<div>{rendered}</div>);

    expect(screen.getByText("John Doe")).not.toBeNull();
    expect(screen.getByText("250")).not.toBeNull();
  });

  it("applies generic WithProps class/style/attributes to rendered value", () => {
    const textField = makeField({
      key: "title",
      view: "text-field-index",
      data: "Hello",
      props: {
        className: "custom-value-class",
        style: {
          "text-transform": "uppercase",
          color: "rgb(255, 0, 0)",
        },
        attributes: {
          "data-testid": "custom-value",
          "aria-label": "custom-title",
        },
      },
    });

    const rendered = renderResourceFieldValue(textField, textField, { title: textField });
    render(<div>{rendered}</div>);

    const element = screen.getByTestId("custom-value");
    expect(element).not.toBeNull();
    expect(element.className.includes("custom-value-class")).toBe(true);
    expect(element.getAttribute("aria-label")).toBe("custom-title");
    expect((element as HTMLElement).style.textTransform).toBe("uppercase");
    expect((element as HTMLElement).style.color).toBe("rgb(255, 0, 0)");
  });
});
