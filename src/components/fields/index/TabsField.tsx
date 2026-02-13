/**
 * TabsIndexField - Mikro Frontend Pattern
 *
 * Index/tablo görünümünde tabs field gösterimi.
 * Genellikle tab sayısı ve içerik özeti gösterilir.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { IndexFieldProps } from '@/types';

export const TabsIndexField: React.FC<IndexFieldProps> = ({ field }) => {
  // Backend'den gelen tabs verisi
  const tabs = field.props?.tabs || [];

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      hideLabel={true}
    >
      <div className="text-sm text-muted-foreground">
        {tabs.length > 0 ? `${tabs.length} tab` : '—'}
      </div>
    </FieldLayout>
  );
};

TabsIndexField.displayName = 'TabsIndexField';
