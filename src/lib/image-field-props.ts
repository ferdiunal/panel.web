import type { CSSProperties, ImgHTMLAttributes } from "react";
import type { FieldData } from "@/types";
import { normalizeStyleObject } from "@/lib/with-props";

type UnknownRecord = Record<string, unknown>;

export interface ResolvedImageFieldProps {
  alt?: string;
  className?: string;
  containerClassName?: string;
  crossOrigin?: ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
  height?: number | string;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  referrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
  sizes?: string;
  srcSet?: string;
  style?: CSSProperties;
  width?: number | string;
}

function isPlainObject(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toDimensionValue(value: unknown): number | string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return toStringValue(value);
}

function toLoadingValue(value: unknown): ImgHTMLAttributes<HTMLImageElement>["loading"] | undefined {
  const normalized = toStringValue(value)?.toLowerCase();
  if (normalized === "lazy" || normalized === "eager") {
    return normalized;
  }
  return undefined;
}

function toDecodingValue(value: unknown): ImgHTMLAttributes<HTMLImageElement>["decoding"] | undefined {
  const normalized = toStringValue(value)?.toLowerCase();
  if (normalized === "sync" || normalized === "async" || normalized === "auto") {
    return normalized;
  }
  return undefined;
}

function mergeStyle(base: CSSProperties | undefined, incoming: CSSProperties | undefined): CSSProperties | undefined {
  if (!incoming) return base;
  if (!base) return incoming;
  return { ...base, ...incoming };
}

export function resolveImageFieldProps(
  ...sources: Array<Record<string, unknown> | undefined>
): ResolvedImageFieldProps {
  const resolved: ResolvedImageFieldProps = {};

  for (const source of sources) {
    if (!isPlainObject(source)) continue;

    resolved.style = mergeStyle(resolved.style, normalizeStyleObject(source.style));

    const className = toStringValue(source.className) ?? toStringValue(source.imgClassName);
    if (className) resolved.className = className;

    const containerClassName = toStringValue(source.containerClassName);
    if (containerClassName) resolved.containerClassName = containerClassName;

    const alt = toStringValue(source.alt);
    if (alt) resolved.alt = alt;

    const loading = toLoadingValue(source.loading);
    if (loading) resolved.loading = loading;

    const decoding = toDecodingValue(source.decoding);
    if (decoding) resolved.decoding = decoding;

    const referrerPolicy = toStringValue(source.referrerPolicy);
    if (referrerPolicy) {
      resolved.referrerPolicy = referrerPolicy as ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
    }

    const crossOrigin = toStringValue(source.crossOrigin);
    if (crossOrigin) {
      resolved.crossOrigin = crossOrigin as ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];
    }

    const width = toDimensionValue(source.width);
    if (width !== undefined) resolved.width = width;

    const height = toDimensionValue(source.height);
    if (height !== undefined) resolved.height = height;

    const sizes = toStringValue(source.sizes);
    if (sizes) resolved.sizes = sizes;

    const srcSet = toStringValue(source.srcSet);
    if (srcSet) resolved.srcSet = srcSet;
  }

  return resolved;
}

export function resolveImageFieldPropsFromFields(
  ...fields: Array<Pick<FieldData, "props"> | undefined>
): ResolvedImageFieldProps {
  const propSources = fields.map((field) => (isPlainObject(field?.props) ? field.props : undefined));
  return resolveImageFieldProps(...propSources);
}
