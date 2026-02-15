import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { FieldData } from "@/types";

type UnknownRecord = Record<string, unknown>;
type IdValue = string | number;

const RELATIONSHIP_VIEW_PREFIXES = [
  "belongs-to-field",
  "has-one-field",
  "has-many-field",
  "belongs-to-many-field",
  "morph-to-field",
  "morph-to-many-field",
] as const;

const RELATIONSHIP_TYPES = new Set([
  "relationship",
  "belongs-to",
  "has-one",
  "has-many",
  "belongs-to-many",
  "morph-to",
  "morph-to-many",
]);

function renderEmpty(): ReactNode {
  return <span className="text-muted-foreground text-sm">—</span>;
}

function isFieldDataLike(value: unknown): value is { data: unknown; key: unknown } {
  return typeof value === "object" && value !== null && "data" in value && "key" in value;
}

function unwrapFieldData(value: unknown): unknown {
  if (isFieldDataLike(value)) {
    return value.data;
  }
  return value;
}

function asString(value: unknown): string | undefined {
  const normalized = unwrapFieldData(value);
  if (typeof normalized === "string" && normalized.trim() !== "") {
    return normalized;
  }
  if (typeof normalized === "number") {
    return String(normalized);
  }
  return undefined;
}

function extractId(value: unknown): IdValue | undefined {
  const normalized = unwrapFieldData(value);
  if (typeof normalized === "string" || typeof normalized === "number") {
    return normalized;
  }

  if (typeof normalized === "object" && normalized !== null) {
    const record = normalized as UnknownRecord;
    const idCandidate = unwrapFieldData(record.id);
    if (typeof idCandidate === "string" || typeof idCandidate === "number") {
      return idCandidate;
    }

    const valueCandidate = unwrapFieldData(record.value);
    if (typeof valueCandidate === "string" || typeof valueCandidate === "number") {
      return valueCandidate;
    }
  }

  return undefined;
}

function extractLabel(value: unknown): string | undefined {
  const normalized = unwrapFieldData(value);
  if (typeof normalized === "string" || typeof normalized === "number") {
    return String(normalized);
  }

  if (typeof normalized === "object" && normalized !== null) {
    const record = normalized as UnknownRecord;
    const labelKeys = ["title", "name", "label", "username", "email", "slug", "code"];

    for (const key of labelKeys) {
      const candidate = unwrapFieldData(record[key]);
      if (typeof candidate === "string" && candidate.trim() !== "") {
        return candidate;
      }
      if (typeof candidate === "number") {
        return String(candidate);
      }
    }

    const id = extractId(record);
    if (id !== undefined) {
      return `#${id}`;
    }
  }

  return undefined;
}

function findOptionLabel(field: FieldData, id: IdValue): string | undefined {
  const options = field.props?.options;
  if (!options) return undefined;

  if (Array.isArray(options)) {
    const option = options.find((item) => {
      if (typeof item !== "object" || item === null) return false;
      return String((item as Record<string, unknown>).value) === String(id);
    });

    if (option && typeof option === "object") {
      const optionRecord = option as Record<string, unknown>;
      const label = optionRecord.label;
      if (typeof label === "string" || typeof label === "number") {
        return String(label);
      }
    }
  }

  if (typeof options === "object" && options !== null) {
    const label = (options as Record<string, unknown>)[String(id)];
    if (typeof label === "string" || typeof label === "number") {
      return String(label);
    }
  }

  return undefined;
}

function relationItems(value: unknown): unknown[] {
  const normalized = unwrapFieldData(value);
  if (Array.isArray(normalized)) {
    return normalized;
  }

  if (typeof normalized === "object" && normalized !== null) {
    const nestedData = unwrapFieldData((normalized as UnknownRecord).data);
    if (Array.isArray(nestedData)) {
      return nestedData;
    }
  }

  return [];
}

function relationViewMatches(field: FieldData, prefix: string): boolean {
  const view = field.view || "";
  return view === prefix || view.startsWith(`${prefix}-`);
}

function isManyRelationshipField(field: FieldData): boolean {
  return (
    relationViewMatches(field, "has-many-field") ||
    relationViewMatches(field, "belongs-to-many-field") ||
    relationViewMatches(field, "morph-to-many-field") ||
    field.type === "has-many" ||
    field.type === "belongs-to-many" ||
    field.type === "morph-to-many"
  );
}

function isMorphToField(field: FieldData): boolean {
  return relationViewMatches(field, "morph-to-field") || field.type === "morph-to";
}

function detailPath(resource: string, id: IdValue): string {
  return `/resource/${resource}/${id}/show`;
}

function renderSingleRelationLink(resource: string, id: IdValue, label: string): ReactNode {
  return (
    <Link
      to={detailPath(resource, id)}
      className="text-sm text-primary hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </Link>
  );
}

function renderManyRelationLink(resource: string, id: IdValue, label: string, key: string): ReactNode {
  return (
    <Link
      key={key}
      to={detailPath(resource, id)}
      className="inline-flex items-center"
      onClick={(event) => event.stopPropagation()}
    >
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
        {label}
      </span>
    </Link>
  );
}

function resolveMorphTypeAndId(field: FieldData, record: UnknownRecord): { morphType?: string; morphId?: IdValue } {
  const typeKey = `${field.key}_type`;
  const idKey = `${field.key}_id`;

  const recordAttributes =
    typeof record.attributes === "object" && record.attributes !== null
      ? (record.attributes as UnknownRecord)
      : undefined;

  let morphType =
    asString(record[typeKey]) ||
    asString(recordAttributes?.[typeKey]);

  let morphId =
    extractId(record[idKey]) ||
    extractId(recordAttributes?.[idKey]);

  const fromFieldData = unwrapFieldData(field.data);
  if (typeof fromFieldData === "object" && fromFieldData !== null) {
    const dataRecord = fromFieldData as UnknownRecord;
    morphType =
      morphType ||
      asString(dataRecord.type) ||
      asString(dataRecord.morphToType) ||
      asString(dataRecord.commentable_type) ||
      asString(dataRecord.morph_type);

    morphId =
      morphId ||
      extractId(dataRecord.id) ||
      extractId(dataRecord.morphToId) ||
      extractId(dataRecord.commentable_id) ||
      extractId(dataRecord.morph_id);
  }

  const nestedValue = record[field.key];
  if (typeof nestedValue === "object" && nestedValue !== null) {
    const nestedRecord = nestedValue as UnknownRecord;
    morphType =
      morphType ||
      asString(nestedRecord.type) ||
      asString(nestedRecord.commentable_type) ||
      asString(nestedRecord.morph_type);

    morphId =
      morphId ||
      extractId(nestedRecord.id) ||
      extractId(nestedRecord.commentable_id) ||
      extractId(nestedRecord.morph_id);
  }

  return { morphType, morphId };
}

export function isRelationshipField(field: FieldData): boolean {
  const view = field.view || "";
  if (RELATIONSHIP_VIEW_PREFIXES.some((prefix) => view === prefix || view.startsWith(`${prefix}-`))) {
    return true;
  }

  return RELATIONSHIP_TYPES.has(field.type || "");
}

export function renderRelationshipFieldValue(field: FieldData, record: UnknownRecord): ReactNode | null {
  if (!isRelationshipField(field)) {
    return null;
  }

  const relatedResource = asString(field.props?.related_resource);

  if (isManyRelationshipField(field)) {
    const items = relationItems(field.data);
    if (items.length === 0) {
      return renderEmpty();
    }

    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => {
          const itemId = extractId(item);
          const label = extractLabel(item) || (itemId !== undefined ? `#${itemId}` : `#${index + 1}`);

          if (itemId !== undefined && relatedResource) {
            return renderManyRelationLink(relatedResource, itemId, label, `${itemId}-${index}`);
          }

          return (
            <span
              key={`plain-${index}`}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {label}
            </span>
          );
        })}
      </div>
    );
  }

  if (isMorphToField(field)) {
    const { morphType, morphId } = resolveMorphTypeAndId(field, record);
    if (!morphType && morphId === undefined) {
      return renderEmpty();
    }

    const types = Array.isArray(field.props?.types)
      ? (field.props.types as Array<UnknownRecord>)
      : [];

    const typeDef = types.find((entry) => {
      const value = asString(entry.value);
      const slug = asString(entry.slug);
      return value === morphType || slug === morphType;
    });

    const morphResource = asString(typeDef?.slug) || relatedResource;
    const typeLabel = asString(typeDef?.label) || morphType;
    const displayLabel = extractLabel(field.data) || (morphId !== undefined ? `#${morphId}` : "—");

    return (
      <div className="flex items-center gap-2">
        {typeLabel ? (
          <Badge variant="outline" className="font-normal text-xs">
            {typeLabel}
          </Badge>
        ) : null}
        {morphResource && morphId !== undefined ? (
          renderSingleRelationLink(morphResource, morphId, displayLabel)
        ) : (
          <span className="text-sm">{displayLabel}</span>
        )}
      </div>
    );
  }

  const relatedId = extractId(field.data);
  if (relatedId === undefined) {
    return renderEmpty();
  }

  const nestedRelationValue = field.key.endsWith("_id")
    ? record[field.key.slice(0, -3)]
    : record[field.key];

  const label =
    findOptionLabel(field, relatedId) ||
    extractLabel(field.data) ||
    extractLabel(nestedRelationValue) ||
    `#${relatedId}`;

  if (!relatedResource) {
    return <span className="text-sm">{label}</span>;
  }

  return renderSingleRelationLink(relatedResource, relatedId, label);
}
