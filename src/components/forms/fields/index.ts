/**
 * Memoized field component exports and registry registration
 */

import React from 'react';
import { fieldRegistry } from '../FieldRegistry';

// Import all field components
import { ComboboxField } from '@/components/fields/ComboboxField';
import { MorphToField } from '@/components/fields/MorphToField';
import { RichTextField } from '@/components/fields/RichTextField';
import { CodeField } from '@/components/fields/CodeField';
import { ColorField } from '@/components/fields/ColorField';
import { BooleanGroupField } from '@/components/fields/BooleanGroupField';
import { PanelField } from '@/components/fields/PanelField';
import { TextInput } from '@/components/fields/TextInput';
import { EmailInput } from '@/components/fields/EmailInput';
import { PasswordInput } from '@/components/fields/PasswordInput';
import { NumberInput } from '@/components/fields/NumberInput';
import { URLInput } from '@/components/fields/URLInput';
import { TextareaField } from '@/components/fields/TextareaField';
import { SelectField } from '@/components/fields/SelectField';
import { SwitchField } from '@/components/fields/SwitchField';
import { DateField } from '@/components/fields/DateField';
import { DateTimeField } from '@/components/fields/DateTimeField';
import { BelongsToField } from '@/components/fields/BelongsToField';
import { HasOneField } from '@/components/fields/HasOneField';
import { HasManyField } from '@/components/fields/HasManyField';
import { BelongsToManyField } from '@/components/fields/BelongsToManyField';
import { BadgeField } from '@/components/fields/BadgeField';

// Memoize field components with custom comparison
export const MemoizedComboboxField = React.memo(ComboboxField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.options === next.options &&
    prev.placeholder === next.placeholder
  );
});

export const MemoizedMorphToField = React.memo(MorphToField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.resourceTypes === next.resourceTypes &&
    prev.disabled === next.disabled
  );
});

export const MemoizedRichTextField = React.memo(RichTextField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

export const MemoizedCodeField = React.memo(CodeField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.language === next.language &&
    prev.theme === next.theme &&
    prev.readOnly === next.readOnly
  );
});

export const MemoizedColorField = React.memo(ColorField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled
  );
});

export const MemoizedBooleanGroupField = React.memo(BooleanGroupField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.options === next.options &&
    prev.disabled === next.disabled
  );
});

export const MemoizedPanelField = React.memo(PanelField);

// Basic input fields
export const MemoizedTextInput = React.memo(TextInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedEmailInput = React.memo(EmailInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedPasswordInput = React.memo(PasswordInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedURLInput = React.memo(URLInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedTextareaField = React.memo(TextareaField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedNumberInput = React.memo(NumberInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error &&
    prev.min === next.min &&
    prev.max === next.max &&
    prev.step === next.step
  );
});

// Selection fields
export const MemoizedSelectField = React.memo(SelectField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error &&
    prev.options === next.options
  );
});

export const MemoizedSwitchField = React.memo(SwitchField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.label === next.label
  );
});

// Date/Time fields
export const MemoizedDateField = React.memo(DateField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedDateTimeField = React.memo(DateTimeField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

// Relationship fields
export const MemoizedBelongsToField = React.memo(BelongsToField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.resourceType === next.resourceType &&
    prev.searchFn === next.searchFn
  );
});

export const MemoizedHasOneField = React.memo(HasOneField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.resourceType === next.resourceType &&
    prev.searchFn === next.searchFn
  );
});

export const MemoizedHasManyField = React.memo(HasManyField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.resourceType === next.resourceType &&
    prev.searchFn === next.searchFn
  );
});

export const MemoizedBelongsToManyField = React.memo(BelongsToManyField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.searchFn === next.searchFn
  );
});

// Display fields
export const MemoizedBadgeField = React.memo(BadgeField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.variant === next.variant
  );
});

// Register all field components with the registry
export function registerAllFields() {
  // Basic input fields
  fieldRegistry.register('text', MemoizedTextInput as any);
  fieldRegistry.register('text-field', MemoizedTextInput as any);
  fieldRegistry.register('email', MemoizedEmailInput as any);
  fieldRegistry.register('email-field', MemoizedEmailInput as any);
  fieldRegistry.register('password', MemoizedPasswordInput as any);
  fieldRegistry.register('password-field', MemoizedPasswordInput as any);
  fieldRegistry.register('number', MemoizedNumberInput as any);
  fieldRegistry.register('number-field', MemoizedNumberInput as any);
  fieldRegistry.register('url', MemoizedURLInput as any);
  fieldRegistry.register('url-field', MemoizedURLInput as any);
  fieldRegistry.register('textarea', MemoizedTextareaField as any);
  fieldRegistry.register('textarea-field', MemoizedTextareaField as any);

  // Selection fields
  fieldRegistry.register('select', MemoizedSelectField as any);
  fieldRegistry.register('select-field', MemoizedSelectField as any);
  fieldRegistry.register('switch', MemoizedSwitchField as any);
  fieldRegistry.register('switch-field', MemoizedSwitchField as any);
  fieldRegistry.register('combobox', MemoizedComboboxField as any);
  fieldRegistry.register('combobox-field', MemoizedComboboxField as any);

  // Date/Time fields
  fieldRegistry.register('date', MemoizedDateField as any);
  fieldRegistry.register('date-field', MemoizedDateField as any);
  fieldRegistry.register('datetime', MemoizedDateTimeField as any);
  fieldRegistry.register('datetime-field', MemoizedDateTimeField as any);

  // Relationship fields
  fieldRegistry.register('belongs-to', MemoizedBelongsToField as any);
  fieldRegistry.register('belongs-to-field', MemoizedBelongsToField as any);
  fieldRegistry.register('has-one', MemoizedHasOneField as any);
  fieldRegistry.register('has-one-field', MemoizedHasOneField as any);
  fieldRegistry.register('has-many', MemoizedHasManyField as any);
  fieldRegistry.register('has-many-field', MemoizedHasManyField as any);
  fieldRegistry.register('belongs-to-many', MemoizedBelongsToManyField as any);
  fieldRegistry.register('belongs-to-many-field', MemoizedBelongsToManyField as any);
  fieldRegistry.register('morph-to', MemoizedMorphToField as any);
  fieldRegistry.register('morph-to-field', MemoizedMorphToField as any);

  // Special fields
  fieldRegistry.register('richtext', MemoizedRichTextField as any);
  fieldRegistry.register('richtext-field', MemoizedRichTextField as any);
  fieldRegistry.register('code', MemoizedCodeField as any);
  fieldRegistry.register('code-field', MemoizedCodeField as any);
  fieldRegistry.register('color', MemoizedColorField as any);
  fieldRegistry.register('color-field', MemoizedColorField as any);
  fieldRegistry.register('boolean-group', MemoizedBooleanGroupField as any);
  fieldRegistry.register('boolean-group-field', MemoizedBooleanGroupField as any);
  fieldRegistry.register('panel', MemoizedPanelField as any);
  fieldRegistry.register('panel-field', MemoizedPanelField as any);
  fieldRegistry.register('badge', MemoizedBadgeField as any);
  fieldRegistry.register('badge-field', MemoizedBadgeField as any);
}

// Auto-register on module load
registerAllFields();
