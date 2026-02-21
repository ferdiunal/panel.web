import type { CSSProperties } from "react";
import type { FieldData } from "@/types";

type UnknownRecord = Record<string, unknown>;
type PrimitiveAttribute = string | number | boolean;

export interface ResolvedWithProps {
  attributes?: Record<string, PrimitiveAttribute>;
  className?: string;
  style?: CSSProperties;
}

function isPlainObject(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mergeClassName(base: string | undefined, incoming: string | undefined): string | undefined {
  if (!incoming) return base;
  if (!base) return incoming;
  return `${base} ${incoming}`;
}

function mergeStyle(
  base: CSSProperties | undefined,
  incoming: CSSProperties | undefined
): CSSProperties | undefined {
  if (!incoming) return base;
  if (!base) return incoming;
  return { ...base, ...incoming };
}

function mergeAttributes(
  base: Record<string, PrimitiveAttribute> | undefined,
  incoming: Record<string, PrimitiveAttribute> | undefined
): Record<string, PrimitiveAttribute> | undefined {
  if (!incoming) return base;
  if (!base) return incoming;
  return { ...base, ...incoming };
}

function normalizeStyleKey(rawKey: string): string {
  return rawKey
    .trim()
    .replace(/^[-_]+/, "")
    .replace(/[-_]+([a-zA-Z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function normalizeStyleObject(rawStyle: unknown): CSSProperties | undefined {
  if (!isPlainObject(rawStyle)) return undefined;

  const normalized: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(rawStyle)) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const styleKey = normalizeStyleKey(key);
    if (!styleKey) continue;
    normalized[styleKey] = value;
  }

  return Object.keys(normalized).length > 0 ? (normalized as CSSProperties) : undefined;
}

function normalizeAttributeMap(rawAttributes: unknown): Record<string, PrimitiveAttribute> | undefined {
  if (!isPlainObject(rawAttributes)) return undefined;

  const normalized: Record<string, PrimitiveAttribute> = {};
  for (const [key, value] of Object.entries(rawAttributes)) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      continue;
    }
    normalized[key] = value;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function collectTopLevelDataAndAria(source: UnknownRecord): Record<string, PrimitiveAttribute> | undefined {
  const collected: Record<string, PrimitiveAttribute> = {};

  for (const [key, value] of Object.entries(source)) {
    const isDataOrAria = key.startsWith("data-") || key.startsWith("aria-");
    if (!isDataOrAria) continue;
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      continue;
    }
    collected[key] = value;
  }

  return Object.keys(collected).length > 0 ? collected : undefined;
}

function resolveClassName(source: UnknownRecord): string | undefined {
  return (
    toTrimmedString(source.className) ||
    toTrimmedString(source.class_name) ||
    toTrimmedString(source.class) ||
    toTrimmedString(source.wrapperClassName) ||
    toTrimmedString(source.wrapper_class_name) ||
    toTrimmedString(source.containerClassName) ||
    toTrimmedString(source.container_class_name)
  );
}

export function resolveWithProps(
  ...sources: Array<Record<string, unknown> | undefined>
): ResolvedWithProps {
  const resolved: ResolvedWithProps = {};

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    resolved.className = mergeClassName(resolved.className, resolveClassName(source));
    resolved.style = mergeStyle(resolved.style, normalizeStyleObject(source.style));

    const nestedAttributes = normalizeAttributeMap(source.attributes ?? source.attrs);
    const topLevelAttributes = collectTopLevelDataAndAria(source);
    resolved.attributes = mergeAttributes(
      resolved.attributes,
      mergeAttributes(nestedAttributes, topLevelAttributes)
    );
  }

  return resolved;
}

export function resolveWithPropsFromFields(
  ...fields: Array<Pick<FieldData, "props"> | undefined>
): ResolvedWithProps {
  const sources = fields.map((field) =>
    isPlainObject(field?.props) ? (field.props as Record<string, unknown>) : undefined
  );
  return resolveWithProps(...sources);
}
