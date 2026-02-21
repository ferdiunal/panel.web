import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type DisplayComponentPayload = {
  view?: unknown;
  data?: unknown;
  name?: unknown;
  props?: Record<string, any>;
};

function isDisplayComponentPayload(value: unknown): value is DisplayComponentPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const payload = value as DisplayComponentPayload;
  return typeof payload.view === "string";
}

export function renderDisplayComponent(value: unknown): ReactNode | null {
  if (!isDisplayComponentPayload(value)) {
    return null;
  }

  switch (value.view) {
    case "badge-field": {
      const variant =
        (value.props?.variant as "default" | "secondary" | "destructive" | "outline") || "default";
      const content = value.data ?? value.name;

      return (
        <Badge variant={variant}>
          {content === null || content === undefined || content === "" ? "—" : String(content)}
        </Badge>
      );
    }
    case "stack-field": {
      const children = Array.isArray(value.props?.fields) ? value.props?.fields : [];

      const resolveSpan = (raw: unknown): number => {
        const fallback = 12;
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
        return fallback;
      };

      return (
        <div className="grid grid-cols-12 gap-2">
          {children.map((child: unknown, index: number) => {
            const rendered = renderDisplayComponent(child);
            if (rendered === null) {
              return null;
            }

            const childPayload =
              child && typeof child === "object" && !Array.isArray(child)
                ? (child as DisplayComponentPayload)
                : undefined;
            const span = resolveSpan(childPayload?.props?.span);

            return (
              <div key={index} className="min-w-0" style={{ gridColumn: `span ${span} / span ${span}` }}>
                {rendered}
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return null;
  }
}
