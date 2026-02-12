/**
 * Component Exports
 * Central export for all components
 */

// Views
export { DetailView } from './views/DetailView';
export { IndexView } from './views/IndexView';
export { EmptyState } from './views/EmptyState';
export { Pagination } from './views/Pagination';

// Fields - Re-export from the main registry/index file
// We alias Memoized components to their original names for backward compatibility
export { 
  MemoizedTextInput as TextInput,
  MemoizedEmailInput as EmailInput,
  MemoizedPasswordInput as PasswordInput,
  MemoizedNumberInput as NumberInput,
  MemoizedTextareaField as TextareaField,
  MemoizedURLInput as URLInput,
  MemoizedSelectField as SelectField,
  MemoizedDateField as DateField,
  MemoizedDateTimeField as DateTimeField,
  MemoizedSwitchField as SwitchField,
  MemoizedBelongsToField as BelongsToField,
  MemoizedHasOneField as HasOneField,
  MemoizedHasManyField as HasManyField,
  MemoizedBelongsToManyField as BelongsToManyField,
  MemoizedMorphToField as MorphToField,
  MemoizedComboboxField as ComboboxField,
  MemoizedRichTextField as RichTextField,
  MemoizedCodeField as CodeField,
  MemoizedColorField as ColorField,
  MemoizedBooleanGroupField as BooleanGroupField,
  MemoizedPanelField as PanelField,
  MemoizedBadgeField as BadgeField,
  MemoizedDialogField as DialogField
} from './forms/fields';

// Error Handling
export { default as ErrorDisplay } from './error-display';
export { default as FieldError } from './field-error';

// Navigation
export { BreadcrumbBuilder } from './breadcrumb-builder';

// UI Components
export { ResponsiveModal } from './ui/responsive-modal';
