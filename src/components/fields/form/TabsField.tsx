/**
 * TabsFormField - Mikro Frontend Pattern
 *
 * Alanları tab'lara ayırmak için kullanılan konteyner field.
 * Her tab, kendi başlığı ve içeriği ile ayrı bir bölüm oluşturur.
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

export const TabsFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  error,
  disabled = false,
  required = false,
  helpText,
  startAddon,
  endAddon,
}) => {
  // Backend'den gelen tabs verisi
  const tabs = (field.props?.tabs || []) as Array<{ value: string; label: string; fields?: any[] }>;
  const side = (field.props?.side || 'top') as "top" | "bottom" | "left" | "right";
  const defaultTab = (field.props?.defaultTab || tabs[0]?.value || '') as string;
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <AddonAwareControl
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        groupClassName={addons.startAddon || addons.endAddon ? 'h-auto min-h-9' : undefined}
        controlClassName={addons.startAddon || addons.endAddon ? 'items-start px-2.5 py-2' : undefined}
      >
        <Tabs defaultValue={defaultTab} side={side}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
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
      </AddonAwareControl>
    </FieldLayout>
  );
};

TabsFormField.displayName = 'TabsFormField';
