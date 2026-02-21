import type { FieldData, ResourceItem } from "@/types";
import { extractRecordTitleFromItem } from "@/lib/record-reference";
import { isImageFieldHeader } from "@/lib/resource-field-render";

export interface GridCardEntry {
  header: FieldData;
  field: FieldData;
}

export interface GridCardModel {
  title: string;
  imageSrc?: string;
  imageEntry?: GridCardEntry;
  titleFieldEntry?: GridCardEntry;
  bodyEntries: GridCardEntry[];
}

function extractImageSource(field: FieldData | undefined): string | undefined {
  if (!field) return undefined;

  const value = field.data;
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const src = candidate.url || candidate.src || candidate.path || candidate.value;
    if (typeof src === "string" && src.trim()) {
      return src;
    }
  }

  return undefined;
}

function toDisplayText(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("data" in obj) {
      return toDisplayText(obj.data);
    }

    return (
      toDisplayText(obj.name) ||
      toDisplayText(obj.title) ||
      toDisplayText(obj.label) ||
      toDisplayText(obj.value) ||
      toDisplayText(obj.id)
    );
  }

  return undefined;
}

export function buildResourceGridCardModel(
  resource: ResourceItem,
  headers: FieldData[],
  recordTitleKey?: string
): GridCardModel {
  const visibleEntries: GridCardEntry[] = headers
    .map((header) => ({
      header,
      field: resource[header.key] as FieldData | undefined,
    }))
    .filter((entry): entry is GridCardEntry => Boolean(entry.field));

  const imageEntry = visibleEntries.find(
    (entry) => isImageFieldHeader(entry.header) && !!extractImageSource(entry.field)
  );
  const imageSrc = extractImageSource(imageEntry?.field);

  const normalizedTitleKey = (recordTitleKey || "").trim().toLowerCase();
  const titleFieldEntry =
    normalizedTitleKey.length > 0
      ? visibleEntries.find((entry) => entry.header.key.toLowerCase() === normalizedTitleKey)
      : undefined;

  const titleFromKey = toDisplayText(titleFieldEntry?.field?.data);
  const fallbackTitle = extractRecordTitleFromItem(resource as unknown as Record<string, unknown>);
  const title = titleFromKey || fallbackTitle || "—";

  const bodyEntries = visibleEntries.filter((entry) => {
    if (imageEntry && entry.header.key === imageEntry.header.key) return false;
    if (titleFieldEntry && entry.header.key === titleFieldEntry.header.key) return false;
    return true;
  });

  return {
    title,
    imageSrc,
    imageEntry,
    titleFieldEntry,
    bodyEntries,
  };
}
