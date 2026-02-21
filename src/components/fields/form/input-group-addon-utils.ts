import type React from 'react';

export interface FieldInputAddons {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
}

function isDefinedAddon(value: unknown): value is React.ReactNode {
  if (value === undefined || value === null || value === false) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function firstDefinedAddon(...values: unknown[]): React.ReactNode | undefined {
  return values.find((value) => isDefinedAddon(value)) as React.ReactNode | undefined;
}

export function resolveFieldInputAddons(
  fieldProps?: Record<string, unknown>,
  overrides?: FieldInputAddons
): FieldInputAddons {
  const startAddon = firstDefinedAddon(
    overrides?.startAddon,
    fieldProps?.startAddon,
    fieldProps?.start_addon,
    fieldProps?.startComponent,
    fieldProps?.start_component,
    fieldProps?.leadingComponent,
    fieldProps?.leading_component,
    fieldProps?.prefixComponent,
    fieldProps?.prefix_component,
    fieldProps?.prependComponent,
    fieldProps?.prepend_component,
    fieldProps?.prefix,
    fieldProps?.prepend,
    fieldProps?.before
  );

  const endAddon = firstDefinedAddon(
    overrides?.endAddon,
    fieldProps?.endAddon,
    fieldProps?.end_addon,
    fieldProps?.endComponent,
    fieldProps?.end_component,
    fieldProps?.trailingComponent,
    fieldProps?.trailing_component,
    fieldProps?.suffixComponent,
    fieldProps?.suffix_component,
    fieldProps?.appendComponent,
    fieldProps?.append_component,
    fieldProps?.suffix,
    fieldProps?.append,
    fieldProps?.after
  );

  return { startAddon, endAddon };
}
