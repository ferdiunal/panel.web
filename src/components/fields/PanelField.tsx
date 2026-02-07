import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FieldData } from '@/types';

export interface PanelFieldProps {
  field: FieldData;
  fields: FieldData[];
  formData: Record<string, any>;
  handleChange: (key: string, value: any) => void;
  renderInput: (field: FieldData, formData: Record<string, any>, handleChange: (key: string, value: any) => void, container?: HTMLElement | null) => React.ReactNode;
  container?: HTMLElement | null;
}

/**
 * PanelField Component
 *
 * Renders a card-based panel/section for grouping related fields.
 * Supports grid layout with 1-4 columns and collapsible panels.
 */
export const PanelField: React.FC<PanelFieldProps> = ({
  field,
  fields,
  formData,
  handleChange,
  renderInput,
  container,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(
    field.props?.defaultCollapsed === true
  );

  const columns = field.props?.columns || 1;
  const collapsible = field.props?.collapsible === true;
  const description = field.props?.description as string | undefined;

  // Get panel fields (fields that belong to this panel)
  const panelFields = field.props?.fields as FieldData[] | undefined || [];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1';

  return (
    <Card className="w-full">
      <CardHeader
        className={cn(
          collapsible && 'cursor-pointer select-none',
          'transition-colors hover:bg-accent/50'
        )}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {field.name || field.label}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          {collapsible && (
            <div className="ml-4">
              <svg
                className={cn(
                  'h-5 w-5 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className={cn('grid gap-6', gridCols)}>
            {panelFields.map((panelField) => {
              if (panelField.read_only) return null;

              return (
                <div key={panelField.key} className="space-y-2">
                  <label
                    htmlFor={panelField.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {panelField.name || panelField.label}
                    {panelField.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </label>
                  {renderInput(panelField, formData, handleChange, container)}
                  {panelField.help_text && (
                    <p className="text-xs text-muted-foreground">
                      {panelField.help_text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
