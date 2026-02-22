import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ResourceDetail } from "./resource-detail"
import type { FieldData } from "@/types"

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
  }
}

describe("ResourceDetail stack field rendering", () => {
  it("applies child span values inside stack-field in detail modal", () => {
    const fields: FieldData[] = [
      makeField({
        key: "stack",
        view: "stack-field",
        type: "stack",
        label: "Stack",
        name: "Stack",
        props: {
          fields: [
            makeField({
              key: "name",
              view: "text-field",
              label: "Ad",
              name: "Ad",
              data: "Demo Urun",
              props: { span: 6 },
            }),
            makeField({
              key: "price",
              view: "text-field",
              label: "Fiyat",
              name: "Fiyat",
              data: "150",
              props: { span: 6 },
            }),
            makeField({
              key: "description",
              view: "text-field",
              label: "Aciklama",
              name: "Aciklama",
              data: "Aciklama metni",
              props: { span: 12 },
            }),
          ],
        },
      }),
    ]

    const { container } = render(
      <ResourceDetail
        resourceName="products"
        resourceId={1}
        fields={fields}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText("Demo Urun")).not.toBeNull()
    expect(screen.getByText("150")).not.toBeNull()
    expect(screen.getByText("Aciklama metni")).not.toBeNull()

    const spanContainers = Array.from(
      container.querySelectorAll('[style*="grid-column"]')
    ) as HTMLElement[]

    expect(spanContainers.length).toBe(3)
    expect(spanContainers[0]?.style.gridColumn).toBe("span 6 / span 6")
    expect(spanContainers[1]?.style.gridColumn).toBe("span 6 / span 6")
    expect(spanContainers[2]?.style.gridColumn).toBe("span 12 / span 12")
  })

  it("renders switch-field values with switch detail component", () => {
    const fields: FieldData[] = [
      makeField({
        key: "is_active",
        view: "switch-field",
        type: "switch",
        label: "Aktif",
        name: "Aktif",
        data: true,
      }),
    ]

    render(
      <ResourceDetail
        resourceName="products"
        resourceId={1}
        fields={fields}
        onClose={vi.fn()}
      />
    )

    expect(screen.getAllByText("Aktif").length).toBeGreaterThan(1)
  })

  it("renders start/end addons in detail fields", () => {
    const fields: FieldData[] = [
      makeField({
        key: "vat_rate",
        view: "number-field",
        type: "number",
        label: "KDV",
        name: "KDV",
        data: 20,
        props: {
          startAddon: "%",
          endAddon: "oran",
        },
      }),
    ]

    render(
      <ResourceDetail
        resourceName="products"
        resourceId={1}
        fields={fields}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText("%")).not.toBeNull()
    expect(screen.getByText("20")).not.toBeNull()
    expect(screen.getByText("oran")).not.toBeNull()
  })
})
