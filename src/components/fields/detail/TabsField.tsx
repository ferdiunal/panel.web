/**
 * TabsDetailField - Mikro Frontend Pattern
 *
 * Detay görünümünde tab'lı içerik gösterimi.
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const TabsDetailField: React.FC<DetailFieldProps> = ({ field }) => {
  // Backend'den gelen tabs verisi
  const tabs = field.props?.tabs || [];
  const side = field.props?.side || 'top';
  const defaultTab = field.props?.defaultTab || tabs[0]?.value;

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <Tabs defaultValue={defaultTab} side={side}>
        <TabsList>
          {tabs.map((tab: any) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab: any) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="space-y-4">
              {/* Tab içindeki field'lar burada render edilecek */}
              {/* Backend'den gelen field'ları render etmek için FieldRenderer kullanılmalı */}
              {tab.fields && tab.fields.length > 0 ? (
                <div className="text-sm text-muted-foreground">
                  {tab.fields.length} field içeriyor
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Bu tab'da field yok
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </FieldLayout>
  );
};

TabsDetailField.displayName = 'TabsDetailField';
