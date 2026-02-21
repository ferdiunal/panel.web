import React, { type ReactNode } from "react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { FieldData, ResourceItem } from "@/types";
import { renderRelationshipFieldValue } from "@/lib/relation-field-links";
import { renderDisplayComponent } from "@/lib/display-components";
import { formatTemporalFieldValue } from "@/lib/date-display";
import { formatMoneyFieldValue } from "@/lib/money-display";
import { resolveImageFieldPropsFromFields } from "@/lib/image-field-props";
import { resolveWithPropsFromFields } from "@/lib/with-props";
import { cn } from "@/lib/utils";

function coerceBooleanValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    if (["false", "0", "no", "off", "pasif"].includes(normalized)) return false;
    if (["true", "1", "yes", "on", "aktif"].includes(normalized)) return true;
  }
  return Boolean(value);
}

function isImageField(field?: Pick<FieldData, "key" | "view"> | null): boolean {
  if (!field) return false;
  if (field.key === "image") return true;
  return (field.view || "").startsWith("image-field");
}

function isBadgeField(field?: Pick<FieldData, "view"> | null): boolean {
  if (!field) return false;
  return (field.view || "").startsWith("badge-field");
}

function isStackField(field?: Pick<FieldData, "type" | "view"> | null): boolean {
  if (!field) return false;
  const view = field.view || "";
  return field.type === "stack" || view === "stack-field" || view.startsWith("stack-field-");
}

function toStackChildField(raw: unknown, fallbackKey: string): FieldData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const source = raw as Partial<FieldData>;
  const key = typeof source.key === "string" && source.key.trim().length > 0 ? source.key : fallbackKey;
  const view = typeof source.view === "string" && source.view.trim().length > 0 ? source.view : "text-field";

  return {
    data: source.data ?? null,
    disabled: typeof source.disabled === "boolean" ? source.disabled : false,
    filterable: typeof source.filterable === "boolean" ? source.filterable : false,
    help_text: typeof source.help_text === "string" ? source.help_text : "",
    key,
    label: typeof source.label === "string" && source.label.trim().length > 0 ? source.label : key,
    name: typeof source.name === "string" && source.name.trim().length > 0 ? source.name : key,
    nullable: typeof source.nullable === "boolean" ? source.nullable : true,
    placeholder: typeof source.placeholder === "string" ? source.placeholder : "",
    props: source.props && typeof source.props === "object" && !Array.isArray(source.props) ? source.props : {},
    read_only: typeof source.read_only === "boolean" ? source.read_only : false,
    required: typeof source.required === "boolean" ? source.required : false,
    sortable: typeof source.sortable === "boolean" ? source.sortable : false,
    stacked: typeof source.stacked === "boolean" ? source.stacked : false,
    text_align: source.text_align === "center" || source.text_align === "right" ? source.text_align : "left",
    type: typeof source.type === "string" && source.type.trim().length > 0 ? source.type : "text",
    view,
  };
}

function extractStackChildren(field: FieldData): FieldData[] {
  const propsChildren = Array.isArray(field.props?.fields) ? field.props.fields : [];

  const dataPayload =
    field.data && typeof field.data === "object" && !Array.isArray(field.data)
      ? (field.data as Record<string, unknown>)
      : null;
  const dataProps =
    dataPayload?.props && typeof dataPayload.props === "object" && !Array.isArray(dataPayload.props)
      ? (dataPayload.props as Record<string, unknown>)
      : null;
  const dataChildren = Array.isArray(dataProps?.fields) ? dataProps.fields : [];

  const rawChildren = dataChildren.length > 0 ? dataChildren : propsChildren;

  return rawChildren
    .map((child, index) => toStackChildField(child, `${field.key || "stack"}_${index}`))
    .filter((child): child is FieldData => child !== null);
}

function resolveStackSpan(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const normalized = Math.round(raw);
    return Math.max(1, Math.min(12, normalized));
  }

  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(12, parsed));
    }
  }

  return 12;
}

function applyWithPropsToRenderedNode(
  node: ReactNode,
  header?: Pick<FieldData, "props"> | null,
  field?: Pick<FieldData, "props"> | null
): ReactNode {
  const resolved = resolveWithPropsFromFields(
    (header as Pick<FieldData, "props"> | undefined) ?? undefined,
    (field as Pick<FieldData, "props"> | undefined) ?? undefined
  );

  const hasDecorators =
    !!resolved.className ||
    !!resolved.style ||
    (resolved.attributes && Object.keys(resolved.attributes).length > 0);

  if (!hasDecorators || node === null || node === undefined || node === "") {
    return node;
  }

  if (React.isValidElement(node) && node.type !== React.Fragment) {
    const elementProps = (node.props as Record<string, unknown> | null) ?? {};
    const nextProps: Record<string, unknown> = {};

    if (resolved.className) {
      const existingClassName =
        typeof elementProps.className === "string" ? elementProps.className : undefined;
      nextProps.className = cn(existingClassName, resolved.className);
    }

    if (resolved.style) {
      const existingStyle =
        elementProps.style && typeof elementProps.style === "object" && !Array.isArray(elementProps.style)
          ? (elementProps.style as Record<string, unknown>)
          : undefined;
      nextProps.style = existingStyle ? { ...existingStyle, ...resolved.style } : resolved.style;
    }

    if (resolved.attributes) {
      Object.assign(nextProps, resolved.attributes);
    }

    return React.cloneElement(node, nextProps);
  }

  return (
    <span className={resolved.className} style={resolved.style} {...resolved.attributes}>
      {node}
    </span>
  );
}

export function renderResourceFieldValue(
  field: FieldData | undefined,
  header?: FieldData,
  record?: ResourceItem | Record<string, unknown>
): ReactNode {
  if (!field) return null;
  const withFieldProps = (node: ReactNode) => applyWithPropsToRenderedNode(node, header, field);

  const isBooleanField =
    (header?.view || "").startsWith("switch-field") ||
    header?.type === "boolean" ||
    (field.view || "").startsWith("switch-field") ||
    field.type === "boolean";

  if (isBooleanField) {
    const enabled = coerceBooleanValue(field.data);
    return withFieldProps(
      <Badge
        variant="outline"
        className={
          enabled
            ? "gap-1 border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "gap-1 border border-border bg-muted/60 text-muted-foreground"
        }
      >
        <Check className="h-3 w-3" />
        <span>{enabled ? "Aktif" : "Pasif"}</span>
      </Badge>
    );
  }

  if (isImageField(header) || isImageField(field)) {
    const imageProps = resolveImageFieldPropsFromFields(header as FieldData | undefined, field);
    return withFieldProps(
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={typeof field.data === "string" ? field.data : ""}
          alt={imageProps.alt || field.name}
          className={imageProps.className}
          style={imageProps.style}
          loading={imageProps.loading}
          decoding={imageProps.decoding}
          referrerPolicy={imageProps.referrerPolicy}
          crossOrigin={imageProps.crossOrigin}
          width={imageProps.width}
          height={imageProps.height}
          sizes={imageProps.sizes}
          srcSet={imageProps.srcSet}
        />
        <AvatarFallback>{field.name ? field.name.substring(0, 2).toUpperCase() : "IMG"}</AvatarFallback>
      </Avatar>
    );
  }

  if (isBadgeField(header) || isBadgeField(field)) {
    return withFieldProps(
      <Badge variant={field.props?.variant || "default"}>
        {field.data === null || field.data === undefined || field.data === "" ? "—" : field.data}
      </Badge>
    );
  }

  if (isStackField(header) || isStackField(field)) {
    const stackChildren = extractStackChildren(field);
    if (stackChildren.length === 0) {
      return withFieldProps(field.data);
    }

    return withFieldProps(
      <div className="grid grid-cols-12 gap-1.5">
        {stackChildren.map((child, index) => {
          const renderedChild = renderResourceFieldValue(child, child, record);
          const isEmptyChild = renderedChild === null || renderedChild === undefined || renderedChild === "";
          const span = resolveStackSpan(child.props?.span);

          return (
            <div
              key={`${field.key}_${child.key}_${index}`}
              className="min-w-0"
              style={{ gridColumn: `span ${span} / span ${span}` }}
            >
              {isEmptyChild ? <span className="text-muted-foreground">—</span> : renderedChild}
            </div>
          );
        })}
      </div>
    );
  }

  const relationshipContent = renderRelationshipFieldValue(
    field,
    (record || {}) as Record<string, unknown>
  );
  if (relationshipContent !== null) {
    return withFieldProps(relationshipContent);
  }

  const displayComponent = renderDisplayComponent(field.data);
  if (displayComponent !== null) {
    return withFieldProps(displayComponent);
  }

  if (typeof field.data === "object" && field.data !== null) {
    const data = field.data as any;
    if (Array.isArray(data)) {
      return withFieldProps(
        <div className="flex flex-wrap gap-1">
          {data.map((item: any, i: number) => {
            let label: string;
            if (item && typeof item === "object" && "data" in item && "key" in item) {
              const fieldData = item.data;
              if (fieldData && typeof fieldData === "object") {
                label = String(fieldData.name || fieldData.title || fieldData.label || fieldData.id || i);
              } else {
                label = String(fieldData || i);
              }
            } else if (typeof item === "object") {
              label = String(item.name || item.title || item.label || item.username || item.email || item.id || i);
            } else {
              label = String(item);
            }
            return (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {label}
              </span>
            );
          })}
        </div>
      );
    }
    return withFieldProps(data.name || data.email || data.title || data.username || data.id || JSON.stringify(data));
  }

  if (field.props?.options) {
    if (Array.isArray(field.props.options)) {
      const option = field.props.options.find((opt: any) => opt.value === field.data);
      if (option) return withFieldProps(option.label);
    } else {
      const options = field.props.options as Record<string, string>;
      const valStr = String(field.data);
      if (options[valStr]) return withFieldProps(options[valStr]);
    }
  }

  const formattedTemporalValue = formatTemporalFieldValue(field);
  if (formattedTemporalValue !== null) {
    return withFieldProps(formattedTemporalValue);
  }

  const formattedMoneyValue = formatMoneyFieldValue(field);
  if (formattedMoneyValue !== null) {
    return withFieldProps(formattedMoneyValue);
  }

  return withFieldProps(field.data);
}

export function isImageFieldHeader(field: FieldData): boolean {
  return isImageField(field);
}
