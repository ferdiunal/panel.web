import React, { useMemo } from "react";
import { Eye, MoreHorizontal, Pencil, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FieldData, ResourceItem } from "@/types";
import type { IndexViewRowClickAction } from "@/components/views/IndexView";
import { renderResourceFieldValue } from "@/lib/resource-field-render";
import { buildResourceGridCardModel } from "@/lib/resource-grid-card";
import { resolveImageFieldPropsFromFields } from "@/lib/image-field-props";

interface ResourceGridViewProps {
  resources: ResourceItem[];
  headers: FieldData[];
  recordTitleKey?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onView?: (resource: ResourceItem) => void;
  onEdit?: (resource: ResourceItem) => void;
  onDelete?: (resource: ResourceItem) => void;
  rowClickAction?: IndexViewRowClickAction;
  className?: string;
}

export const ResourceGridView: React.FC<ResourceGridViewProps> = ({
  resources,
  headers,
  recordTitleKey,
  isLoading = false,
  isEmpty = false,
  searchQuery = "",
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  rowClickAction = "edit",
  className,
}) => {
  const resolveFieldSpan = (header: FieldData, field: FieldData): number => {
    const raw = field?.props?.span ?? header?.props?.span;
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.max(1, Math.min(12, Math.round(raw)));
    }
    if (typeof raw === "string") {
      const parsed = Number.parseInt(raw, 10);
      if (Number.isFinite(parsed)) {
        return Math.max(1, Math.min(12, parsed));
      }
    }
    return 12;
  };

  const handleCardClick = (resource: ResourceItem) => {
    if (rowClickAction === "none") return;

    if (rowClickAction === "detail") {
      if (onView && (resource.policy?.view ?? true)) {
        onView(resource);
      }
      return;
    }

    if (rowClickAction === "edit") {
      if (onEdit && (resource.policy?.update ?? true)) {
        onEdit(resource);
      }
    }
  };

  const renderedCards = useMemo(() => {
    return resources.map((resource, index) => {
      const cardModel = buildResourceGridCardModel(resource, headers, recordTitleKey);
      const { imageSrc, imageEntry, title: cardTitle, bodyEntries } = cardModel;
      const imageProps = resolveImageFieldPropsFromFields(imageEntry?.header, imageEntry?.field);

      const hasAnyAction =
        (onView && (resource.policy?.view ?? true)) ||
        (onEdit && (resource.policy?.update ?? true)) ||
        (onDelete && (resource.policy?.delete ?? true));

      return (
        <Card
          key={(resource.id as FieldData | undefined)?.data ?? index}
          className={cn(
            "gap-0 py-0 cursor-pointer transition-shadow hover:shadow-md",
            rowClickAction === "none" && "cursor-default"
          )}
          onClick={() => handleCardClick(resource)}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageProps.alt || cardTitle}
              className={cn("h-40 w-full object-cover", imageProps.className)}
              style={imageProps.style}
              loading={imageProps.loading || "lazy"}
              decoding={imageProps.decoding}
              referrerPolicy={imageProps.referrerPolicy}
              crossOrigin={imageProps.crossOrigin}
              width={imageProps.width}
              height={imageProps.height}
              sizes={imageProps.sizes}
              srcSet={imageProps.srcSet}
            />
          )}
          <CardHeader className={cn("pb-3", imageSrc ? "pt-4" : "pt-3")}>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-2 text-base">{cardTitle}</CardTitle>
              {hasAnyAction && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (resource.policy?.view ?? true) && (
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onView(resource);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Görüntüle
                      </DropdownMenuItem>
                    )}
                    {onEdit && (resource.policy?.update ?? true) && (
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(resource);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                    )}
                    {onDelete && (resource.policy?.delete ?? true) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(resource);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-12 gap-3 pb-5">
            {bodyEntries.length === 0 ? (
              <div className="col-span-12 text-sm text-muted-foreground">—</div>
            ) : (
              bodyEntries.map(({ header, field }) => {
                const renderedValue = renderResourceFieldValue(field, header, resource);
                const key = header.key;
                const span = resolveFieldSpan(header, field);
                const isEmptyValue =
                  renderedValue === null || renderedValue === undefined || renderedValue === "";

                return (
                  <div
                    key={key}
                    className="min-w-0 space-y-1"
                    style={{ gridColumn: `span ${span} / span ${span}` }}
                  >
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {header.label || header.name || key}
                    </div>
                    <div className="text-sm">
                      {isEmptyValue ? <span className="text-muted-foreground">—</span> : renderedValue}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      );
    });
  }, [headers, onDelete, onEdit, onView, recordTitleKey, resources, rowClickAction]);

  return (
    <div className={cn("space-y-4", className)}>
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : isEmpty || resources.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderedCards}
        </div>
      )}
    </div>
  );
};

ResourceGridView.displayName = "ResourceGridView";
