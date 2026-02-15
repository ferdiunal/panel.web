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
      return (
        <div className="flex flex-wrap gap-1">
          {children.map((child: unknown, index: number) => {
            const rendered = renderDisplayComponent(child);
            if (rendered === null) {
              return null;
            }
            return <span key={index}>{rendered}</span>;
          })}
        </div>
      );
    }
    default:
      return null;
  }
}
