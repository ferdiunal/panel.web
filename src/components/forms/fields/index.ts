/**
 * Memoized field component exports and registry registration
 */

import React from 'react';
import { fieldRegistry } from '../FieldRegistry';

// Import FORM specific components for base types
import { ComboboxFormField } from '@/components/fields/form/ComboboxField';
import { MorphToFormField } from '@/components/fields/form/MorphToField';
import { RichTextFormField } from '@/components/fields/form/RichTextField';
import { CodeFormField } from '@/components/fields/form/CodeField';
import { ColorFormField } from '@/components/fields/form/ColorField';
import { BooleanGroupFormField } from '@/components/fields/form/BooleanGroupField';
import { PanelFormField } from '@/components/fields/form/PanelField';
import { TabsFormField } from '@/components/fields/form/TabsField';
import { BadgeFormField } from '@/components/fields/form/BadgeField';
import { DialogFormField } from '@/components/fields/form/DialogField';

import { TextFormField } from '@/components/fields/form/TextInput';
import { EmailFormField } from '@/components/fields/form/EmailInput';
import { PasswordFormField } from '@/components/fields/form/PasswordInput';
import { NumberFormField } from '@/components/fields/form/NumberInput';
import { URLFormField } from '@/components/fields/form/URLInput';
import { TextareaFormField } from '@/components/fields/form/TextareaField';
import { SelectFormField } from '@/components/fields/form/SelectField';
import { SwitchFormField } from '@/components/fields/form/SwitchField';
import { DateFormField } from '@/components/fields/form/DateField';
import { DateTimeFormField } from '@/components/fields/form/DateTimeField'; // Corrected
import { BelongsToFormField } from '@/components/fields/form/BelongsToField';
import { HasOneFormField } from '@/components/fields/form/HasOneField';
import { HasManyFormField } from '@/components/fields/form/HasManyField';
import { BelongsToManyFormField } from '@/components/fields/form/BelongsToManyField';
import { TelFormField } from '@/components/fields/form/TelInput';
import { AsyncComboboxFormField } from '@/components/fields/form/AsyncComboboxField';
import { CheckboxFormField } from '@/components/fields/form/CheckboxField';
import { RadioGroupFormField } from '@/components/fields/form/RadioGroupField';
import { TimeFormField } from '@/components/fields/form/TimeField';
import { MorphToManyFormField } from '@/components/fields/form/MorphToManyField';
import { FileFormField } from '@/components/fields/form/FileInput';
import { MatrixFormField } from '@/components/fields/form/MatrixField';

// Import Index/Detail specific components
import { TextIndexField } from '@/components/fields/index/TextInput';
import { NumberIndexField } from '@/components/fields/index/NumberInput';
import { SelectIndexField } from '@/components/fields/index/SelectField';
import { DateIndexField } from '@/components/fields/index/DateField';
import { DateTimeIndexField } from '@/components/fields/index/DateTimeField';
import { TelIndexField } from '@/components/fields/index/TelInput';
import { TabsIndexField } from '@/components/fields/index/TabsField';

import { TextDetailField } from '@/components/fields/detail/TextInput';
import { NumberDetailField } from '@/components/fields/detail/NumberInput';
import { SelectDetailField } from '@/components/fields/detail/SelectField';
import { DateDetailField } from '@/components/fields/detail/DateField';
import { DateTimeDetailField } from '@/components/fields/detail/DateTimeField';
import { TelDetailField } from '@/components/fields/detail/TelInput';
import { TabsDetailField } from '@/components/fields/detail/TabsField';

// Memoize field components with custom comparison
export const MemoizedComboboxField = React.memo(ComboboxFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.field.props?.options === next.field.props?.options &&
    prev.placeholder === next.placeholder
  );
});

export const MemoizedMorphToField = React.memo(MorphToFormField);

export const MemoizedRichTextField = React.memo(RichTextFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

export const MemoizedCodeField = React.memo(CodeFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.field.props?.language === next.field.props?.language &&
    prev.field.props?.theme === next.field.props?.theme &&
    prev.field.props?.readOnly === next.field.props?.readOnly
  );
});

export const MemoizedColorField = React.memo(ColorFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled
  );
});

export const MemoizedBooleanGroupField = React.memo(BooleanGroupFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.field.props?.options === next.field.props?.options &&
    prev.disabled === next.disabled
  );
});

export const MemoizedPanelField = React.memo(PanelFormField);
export const MemoizedTabsField = React.memo(TabsFormField);

// Basic input fields (Using Form Variants)
export const MemoizedTextInput = React.memo(TextFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedEmailInput = React.memo(EmailFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedPasswordInput = React.memo(PasswordFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedURLInput = React.memo(URLFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedTextareaField = React.memo(TextareaFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedNumberInput = React.memo(NumberFormField, (prev, next) => {
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
export const MemoizedSelectField = React.memo(SelectFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error &&
    prev.options === next.options
  );
});

export const MemoizedSwitchField = React.memo(SwitchFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.label === next.label
  );
});

// Date/Time fields
export const MemoizedDateField = React.memo(DateFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

export const MemoizedDateTimeField = React.memo(DateTimeFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.placeholder === next.placeholder &&
    prev.error === next.error
  );
});

// Relationship fields
export const MemoizedBelongsToField = React.memo(BelongsToFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

export const MemoizedHasOneField = React.memo(HasOneFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

export const MemoizedHasManyField = React.memo(HasManyFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

export const MemoizedBelongsToManyField = React.memo(BelongsToManyFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required
  );
});

// Display fields
export const MemoizedBadgeField = React.memo(BadgeFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.field.props?.variant === next.field.props?.variant
  );
});

// Dialog field
export const MemoizedDialogField = React.memo(DialogFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.field.props?.defaultOpen === next.field.props?.defaultOpen &&
    prev.disabled === next.disabled
  );
});

export const MemoizedAsyncComboboxField = React.memo(AsyncComboboxFormField);
export const MemoizedCheckboxField = React.memo(CheckboxFormField);
export const MemoizedRadioGroupField = React.memo(RadioGroupFormField);
export const MemoizedTimeField = React.memo(TimeFormField);
export const MemoizedMorphToManyField = React.memo(MorphToManyFormField);
export const MemoizedFileInput = React.memo(FileFormField, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.error === next.error
  );
});
export const MemoizedMatrixField = React.memo(MatrixFormField);

// Register all field components with the registry
export function registerAllFields() {
  // Basic input fields (Mapped to Form Variants)
  fieldRegistry.register('text', MemoizedTextInput as any);
  fieldRegistry.register('text-field', MemoizedTextInput as any);
  fieldRegistry.register('email', MemoizedEmailInput as any);
  fieldRegistry.register('email-field', MemoizedEmailInput as any);
  fieldRegistry.register('password', MemoizedPasswordInput as any);
  fieldRegistry.register('password-field', MemoizedPasswordInput as any);
  fieldRegistry.register('number', MemoizedNumberInput as any);
  fieldRegistry.register('number-field', MemoizedNumberInput as any);
  fieldRegistry.register('money', MemoizedNumberInput as any);
  fieldRegistry.register('money-field', MemoizedNumberInput as any);
  fieldRegistry.register('url', MemoizedURLInput as any);
  fieldRegistry.register('url-field', MemoizedURLInput as any);
  fieldRegistry.register('tel', TelFormField as any);
  fieldRegistry.register('tel-field', TelFormField as any);
  fieldRegistry.register('textarea', MemoizedTextareaField as any);
  fieldRegistry.register('textarea-field', MemoizedTextareaField as any);

  // Selection fields
  fieldRegistry.register('select', MemoizedSelectField as any);
  fieldRegistry.register('select-field', MemoizedSelectField as any);
  fieldRegistry.register('switch', MemoizedSwitchField as any);
  fieldRegistry.register('switch-field', MemoizedSwitchField as any);
  fieldRegistry.register('combobox', MemoizedComboboxField as any);
  fieldRegistry.register('combobox-field', MemoizedComboboxField as any);
  fieldRegistry.register('async-combobox', MemoizedAsyncComboboxField as any);
  fieldRegistry.register('async-combobox-field', MemoizedAsyncComboboxField as any);
  fieldRegistry.register('checkbox', MemoizedCheckboxField as any);
  fieldRegistry.register('checkbox-field', MemoizedCheckboxField as any);
  fieldRegistry.register('radio-group', MemoizedRadioGroupField as any);
  fieldRegistry.register('radio-group-field', MemoizedRadioGroupField as any);

  // Date/Time fields
  fieldRegistry.register('date', MemoizedDateField as any);
  fieldRegistry.register('date-field', MemoizedDateField as any);
  fieldRegistry.register('datetime', MemoizedDateTimeField as any);
  fieldRegistry.register('datetime-field', MemoizedDateTimeField as any);
  fieldRegistry.register('time', MemoizedTimeField as any);
  fieldRegistry.register('time-field', MemoizedTimeField as any);

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
  fieldRegistry.register('morph-to-many', MemoizedMorphToManyField as any);
  fieldRegistry.register('morph-to-many-field', MemoizedMorphToManyField as any);

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
  fieldRegistry.register('tabs', MemoizedTabsField as any);
  fieldRegistry.register('tabs-field', MemoizedTabsField as any);
  fieldRegistry.register('badge', MemoizedBadgeField as any);
  fieldRegistry.register('badge-field', MemoizedBadgeField as any);

  // Dialog field
  fieldRegistry.register('dialog', MemoizedDialogField as any);
  fieldRegistry.register('dialog-field', MemoizedDialogField as any);

  // File field
  fieldRegistry.register('file', MemoizedFileInput as any);
  fieldRegistry.register('file-field', MemoizedFileInput as any);
  fieldRegistry.register('file-field-form', FileFormField as any);

  // Matrix / KeyValue field
  fieldRegistry.register('matrix', MemoizedMatrixField as any);
  fieldRegistry.register('matrix-field', MemoizedMatrixField as any);
  fieldRegistry.register('matrix-field-form', MatrixFormField as any);
  fieldRegistry.register('key_value', MemoizedMatrixField as any);
  fieldRegistry.register('key-value-field', MemoizedMatrixField as any);
  fieldRegistry.register('key-value-field-form', MatrixFormField as any);

  // Image field (uses file input)
  fieldRegistry.register('image', MemoizedFileInput as any);
  fieldRegistry.register('image-field', MemoizedFileInput as any);
  fieldRegistry.register('image-field-form', FileFormField as any);

  // ============================================================================
  // View-Specific Field Components (Form/Index/Detail Pattern)
  // ============================================================================

  // Text Field - Form/Index/Detail Views
  fieldRegistry.register('text-field-form', TextFormField as any);
  fieldRegistry.register('text-field-index', TextIndexField as any);
  fieldRegistry.register('text-field-detail', TextDetailField as any);

  // Select Field - Form/Index/Detail Views
  fieldRegistry.register('select-field-form', SelectFormField as any);
  fieldRegistry.register('select-field-index', SelectIndexField as any);
  fieldRegistry.register('select-field-detail', SelectDetailField as any);

  // Date Field - Form/Index/Detail Views
  fieldRegistry.register('date-field-form', DateFormField as any);
  fieldRegistry.register('date-field-index', DateIndexField as any);
  fieldRegistry.register('date-field-detail', DateDetailField as any);

  // DateTime Field - Form/Index/Detail Views
  fieldRegistry.register('datetime-field-form', DateTimeFormField as any);
  fieldRegistry.register('datetime-field-index', DateTimeIndexField as any);
  fieldRegistry.register('datetime-field-detail', DateTimeDetailField as any);

  // Tel Field - Form/Index/Detail Views
  fieldRegistry.register('tel-field-form', TelFormField as any);
  fieldRegistry.register('tel-field-index', TelIndexField as any);
  fieldRegistry.register('tel-field-detail', TelDetailField as any);

  // Relationship Fields - Form/Index/Detail Views
  fieldRegistry.register('belongs-to-field-form', BelongsToFormField as any);
  fieldRegistry.register('belongs-to-many-field-form', BelongsToManyFormField as any);
  fieldRegistry.register('has-many-field-form', HasManyFormField as any);
  fieldRegistry.register('has-one-field-form', HasOneFormField as any);
  fieldRegistry.register('morph-to-field-form', MorphToFormField as any);
  fieldRegistry.register('morph-to-many-field-form', MorphToManyFormField as any);

  // Other Fields - Form View
  fieldRegistry.register('combobox-field-form', ComboboxFormField as any);
  fieldRegistry.register('async-combobox-field-form', AsyncComboboxFormField as any);
  fieldRegistry.register('checkbox-field-form', CheckboxFormField as any);
  fieldRegistry.register('radio-group-field-form', RadioGroupFormField as any);
  fieldRegistry.register('switch-field-form', SwitchFormField as any);
  fieldRegistry.register('color-field-form', ColorFormField as any);
  fieldRegistry.register('code-field-form', CodeFormField as any);
  fieldRegistry.register('richtext-field-form', RichTextFormField as any);
  fieldRegistry.register('textarea-field-form', TextareaFormField as any);
  fieldRegistry.register('number-field-form', NumberFormField as any);
  fieldRegistry.register('number-field-index', NumberIndexField as any);
  fieldRegistry.register('number-field-detail', NumberDetailField as any);
  fieldRegistry.register('money-field-form', NumberFormField as any);
  fieldRegistry.register('money-field-index', NumberIndexField as any);
  fieldRegistry.register('money-field-detail', NumberDetailField as any);
  fieldRegistry.register('password-field-form', PasswordFormField as any);
  fieldRegistry.register('email-field-form', EmailFormField as any);
  fieldRegistry.register('url-field-form', URLFormField as any);
  fieldRegistry.register('time-field-form', TimeFormField as any);
  fieldRegistry.register('dialog-field-form', DialogFormField as any);
  fieldRegistry.register('badge-field-form', BadgeFormField as any);
  fieldRegistry.register('panel-field-form', PanelFormField as any);
  fieldRegistry.register('tabs-field-form', TabsFormField as any);
  fieldRegistry.register('tabs-field-detail', TabsDetailField as any);
  fieldRegistry.register('tabs-field-index', TabsIndexField as any);
  fieldRegistry.register('boolean-group-field-form', BooleanGroupFormField as any);
}

// Auto-register on module load
registerAllFields();
