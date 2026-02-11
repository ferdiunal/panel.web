/**
 * MorphToManyFormField - Mikro Frontend Pattern
 * Polymorphic many-to-many relationship form field
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

export const MorphToManyFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
}) => {
  const items = Array.isArray(value) ? value : [];

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="space-y-2">
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item: any, index: number) => {
              const itemLabel = item.name || item.title || item.label || `#${item.id}`;
              const itemType = item.type || 'Item';
              
              return (
                <Badge key={index} variant="secondary" className="gap-2">
                  <span className="text-xs text-muted-foreground">{itemType}</span>
                  <span>{itemLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ekle</span>
        </Button>
      </div>
    </FieldLayout>
  );
};

MorphToManyFormField.displayName = 'MorphToManyFormField';
