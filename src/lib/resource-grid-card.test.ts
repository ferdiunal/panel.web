import { describe, expect, it } from "vitest";
import type { FieldData, ResourceItem } from "@/types";
import { buildResourceGridCardModel } from "./resource-grid-card";

function makeField(key: string, view: string, data: unknown, label?: string): FieldData {
  return {
    key,
    name: label || key,
    label: label || key,
    view,
    type: "text",
    data,
    props: {},
    disabled: false,
    filterable: false,
    help_text: "",
    nullable: true,
    placeholder: "",
    read_only: false,
    required: false,
    sortable: false,
    stacked: false,
    text_align: "left",
  };
}

describe("resource-grid-card", () => {
  it("builds image/title/body in the expected order", () => {
    const headers: FieldData[] = [
      makeField("avatar", "image-field-index", null, "Avatar"),
      makeField("name", "text-field-index", null, "Name"),
      makeField("stack", "stack-field-index", null, "Stack"),
      makeField("email", "text-field-index", null, "Email"),
    ];

    const resource = {
      avatar: makeField("avatar", "image-field-index", "https://cdn.test/user.png"),
      name: makeField("name", "text-field-index", "Ferdi"),
      stack: makeField("stack", "stack-field-index", { component: "stack-field", data: [{ data: "A" }] }),
      email: makeField("email", "text-field-index", "ferdi@example.com"),
    } as unknown as ResourceItem;

    const model = buildResourceGridCardModel(resource, headers, "name");

    expect(model.imageSrc).toBe("https://cdn.test/user.png");
    expect(model.title).toBe("Ferdi");
    expect(model.bodyEntries.map((entry) => entry.header.key)).toEqual(["stack", "email"]);
  });

  it("falls back to record title helper when record_title_key is missing", () => {
    const headers: FieldData[] = [makeField("name", "text-field-index", null, "Name")];
    const resource = {
      name: makeField("name", "text-field-index", "Jane"),
    } as unknown as ResourceItem;

    const model = buildResourceGridCardModel(resource, headers, "missing_key");
    expect(model.title).toBe("Jane");
  });

  it("returns dash title when no usable title exists", () => {
    const headers: FieldData[] = [makeField("notes", "text-field-index", null, "Notes")];
    const resource = {
      notes: makeField("notes", "text-field-index", ""),
    } as unknown as ResourceItem;

    const model = buildResourceGridCardModel(resource, headers, "name");
    expect(model.title).toBe("—");
    expect(model.bodyEntries).toHaveLength(1);
  });
});
