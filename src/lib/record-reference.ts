import type { FieldData } from "@/types";

type UnknownRecord = Record<string, unknown>;

const META_TITLE_KEYS = [
  "modelTitle",
  "resourceTitle",
  "modelLabel",
  "resourceLabel",
  "recordTitle",
  "recordLabel",
  "model_title",
  "resource_title",
  "model_label",
  "resource_label",
  "record_title",
  "record_label",
] as const;

const TITLE_FIELD_KEYS = [
  "title",
  "name",
  "label",
  "full_name",
  "display_name",
] as const;

function unwrapFieldValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: unknown }).data;
  }
  return value;
}

function toDisplayText(value: unknown): string | undefined {
  const normalized = unwrapFieldValue(value);
  if (typeof normalized === "string") {
    const trimmed = normalized.trim();
    return trimmed ? trimmed : undefined;
  }
  if (typeof normalized === "number") {
    return String(normalized);
  }
  if (typeof normalized === "object" && normalized !== null) {
    const record = normalized as UnknownRecord;
    for (const key of TITLE_FIELD_KEYS) {
      const nested = toDisplayText(record[key]);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function extractRecordIdFromItem(item: UnknownRecord | null | undefined): string | number | undefined {
  if (!item) return undefined;

  const id = unwrapFieldValue(item.id);
  if (typeof id === "string" || typeof id === "number") {
    return id;
  }
  return undefined;
}

export function extractRecordTitleFromMeta(meta: UnknownRecord | null | undefined): string | undefined {
  if (!meta) return undefined;

  for (const key of META_TITLE_KEYS) {
    const title = toDisplayText(meta[key]);
    if (title) return title;
  }
  return undefined;
}

export function extractRecordTitleFromItem(item: UnknownRecord | null | undefined): string | undefined {
  if (!item) return undefined;

  for (const key of META_TITLE_KEYS) {
    const title = toDisplayText(item[key]);
    if (title) return title;
  }

  for (const key of TITLE_FIELD_KEYS) {
    if (!(key in item)) continue;
    const title = toDisplayText(item[key]);
    if (title) return title;
  }

  return undefined;
}

export function extractRecordTitleFromFields(fields: FieldData[]): string | undefined {
  if (!Array.isArray(fields) || fields.length === 0) {
    return undefined;
  }

  const byKey = new Map<string, FieldData>();
  for (const field of fields) {
    byKey.set((field.key || "").toLowerCase(), field);
  }

  for (const key of TITLE_FIELD_KEYS) {
    const field = byKey.get(key);
    if (!field) continue;
    const title = toDisplayText(field.data);
    if (title) return title;
  }

  for (const field of fields) {
    const title = toDisplayText(field.data);
    if (title) return title;
  }

  return undefined;
}

export function formatRecordReference(id: string | number | undefined, title?: string): string {
  if (id === undefined) {
    return title || "";
  }
  if (!title || title === String(id) || title === `#${id}`) {
    return `#${id}`;
  }
  return `#${id} ${title}`;
}
