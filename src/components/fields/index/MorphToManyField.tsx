/**
 * MorphToManyIndexField - MorphToMany Field Index View Component
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export const MorphToManyIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  const relatedData = record[field.key];
  
  let count = 0;
  if (Array.isArray(relatedData)) {
    count = relatedData.length;
  } else if (relatedData && typeof relatedData === 'object') {
    const data = (relatedData as any).data;
    if (Array.isArray(data)) {
      count = data.length;
    }
  }

  const textAlign = field.text_align || 'center';
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[textAlign] || 'justify-center';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
      hideLabel={true}
    >
      {count > 0 ? (
        <div className={cn('flex items-center gap-2', alignmentClass)}>
          <Badge variant="secondary">{count}</Badge>
          <span className="text-sm">kayıt</span>
        </div>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

MorphToManyIndexField.displayName = 'MorphToManyIndexField';
