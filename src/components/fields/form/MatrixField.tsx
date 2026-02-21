/**
 * MatrixFormField
 *
 * Dynamic row/column matrix field with customizable columns.
 * - Defaults each column cell to text input when no `type` is provided.
 * - Supports per-column types: text, number, textarea, select, checkbox, radio.
 * - Supports row add/remove and JSON-compatible payload output.
 */

import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  AddonAwareControl,
  AddonAwareInput,
  AddonAwareTextarea,
} from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';

type MatrixColumnType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

interface MatrixOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MatrixColumn {
  key: string;
  label?: string;
  type?: MatrixColumnType;
  placeholder?: string;
  options?: unknown;
  optionsByDependency?: Record<string, unknown>;
  dependsOn?: string;
  defaultValue?: unknown;
  disabled?: boolean;
}

interface MatrixConfig {
  columns?: unknown;
  allowAddingRows?: boolean;
  allowDeletingRows?: boolean;
  allowEditingCells?: boolean;
  addButtonText?: string;
  emptyMessage?: string;
  minRows?: number;
  maxRows?: number;
}

type MatrixRow = Record<string, unknown>;

interface MatrixPayload {
  rows: MatrixRow[];
  keys?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeOptions(raw: unknown): MatrixOption[] {
	if (!raw) return [];

	if (Array.isArray(raw)) {
		const options: MatrixOption[] = [];
		raw.forEach((item) => {
			if (isRecord(item)) {
				const rawValue = item.value ?? item.key ?? item.id;
				const rawLabel = item.label ?? item.name ?? rawValue;
				if (rawValue === undefined || rawValue === null) return;
				options.push({
					value: String(rawValue),
					label: String(rawLabel ?? rawValue),
					disabled: Boolean(item.disabled),
				});
				return;
			}

			options.push({
				value: String(item),
				label: String(item),
				disabled: false,
			});
		});
		return options;
	}

  if (isRecord(raw)) {
    return Object.entries(raw).map(([value, label]) => ({
      value: String(value),
      label: String(label),
      disabled: false,
    }));
  }

  return [];
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseRows(value: unknown): MatrixRow[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseRows(parsed);
    } catch {
      return [];
    }
  }

  if (isRecord(value)) {
    const maybeRows = value.rows;
    if (Array.isArray(maybeRows)) {
      return maybeRows.filter(isRecord);
    }
  }

  return [];
}

function normalizeColumn(raw: unknown): MatrixColumn | null {
  if (!isRecord(raw)) return null;
  if (!raw.key || typeof raw.key !== 'string') return null;

  return {
    key: raw.key,
    label: typeof raw.label === 'string' ? raw.label : humanizeKey(raw.key),
    type: typeof raw.type === 'string' ? (raw.type as MatrixColumnType) : 'text',
    placeholder: typeof raw.placeholder === 'string' ? raw.placeholder : undefined,
    options: raw.options,
    optionsByDependency: isRecord(raw.optionsByDependency)
      ? (raw.optionsByDependency as Record<string, unknown>)
      : undefined,
    dependsOn: typeof raw.dependsOn === 'string' ? raw.dependsOn : undefined,
    defaultValue: raw.defaultValue,
    disabled: Boolean(raw.disabled),
  };
}

function resolveColumns(rawColumns: unknown, rows: MatrixRow[]): MatrixColumn[] {
  if (Array.isArray(rawColumns)) {
    const columns = rawColumns
      .map(normalizeColumn)
      .filter((column): column is MatrixColumn => column !== null);
    if (columns.length > 0) return columns;
  }

  if (rows.length > 0) {
    const firstRow = rows[0];
    const keys = Object.keys(firstRow);
    if (keys.length > 0) {
      return keys.map((key) => ({
        key,
        label: humanizeKey(key),
        type: 'text',
      }));
    }
  }

  return [
    {
      key: 'value',
      label: 'Value',
      type: 'text',
    },
  ];
}

function defaultValueForColumn(column: MatrixColumn): unknown {
  if (column.defaultValue !== undefined) {
    return column.defaultValue;
  }

  switch (column.type) {
    case 'checkbox': {
      const options = normalizeOptions(column.options);
      return options.length > 0 ? [] : false;
    }
    case 'radio':
      return normalizeOptions(column.options).length > 0 ? '' : false;
    case 'number':
      return '';
    default:
      return '';
  }
}

export const MatrixFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder,
  helpText,
  startAddon,
  endAddon,
}) => {
  const config = useMemo<MatrixConfig>(() => {
    const options = field.props?.options;
    return isRecord(options) ? (options as MatrixConfig) : {};
  }, [field.props?.options]);

  const rows = useMemo(() => parseRows(value), [value]);

  const columns = useMemo(() => {
    const candidateColumns = field.props?.columns ?? config.columns;
    return resolveColumns(candidateColumns, rows);
  }, [field.props?.columns, config.columns, rows]);
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );
  const hasAddons = !!addons.startAddon || !!addons.endAddon;

  const allowAddingRows = config.allowAddingRows !== false;
  const allowDeletingRows = config.allowDeletingRows !== false;
  const allowEditingCells = config.allowEditingCells !== false;
  const minRows = Math.max(0, Number(config.minRows ?? 0));
  const maxRows = Math.max(minRows, Number(config.maxRows ?? Number.MAX_SAFE_INTEGER));
  const addButtonText = config.addButtonText || 'Add row';
  const emptyMessage = config.emptyMessage || 'No rows added yet.';

  const buildPayload = (nextRows: MatrixRow[]): MatrixPayload => ({
    rows: nextRows,
    keys: (() => {
      const propKeys = field.props?.keys;
      if (isRecord(propKeys) || Array.isArray(propKeys)) {
        return propKeys;
      }

      if (isRecord(value)) {
        const existingKeys = value.keys;
        if (isRecord(existingKeys) || Array.isArray(existingKeys)) {
          return existingKeys;
        }
      }

      return columns.map((column) => column.key);
    })(),
  });

  const emitRows = (nextRows: MatrixRow[]) => {
    onChange(buildPayload(nextRows));
  };

  const createEmptyRow = (): MatrixRow => {
    const row: MatrixRow = {};
    columns.forEach((column) => {
      row[column.key] = defaultValueForColumn(column);
    });
    return row;
  };

  const resolveColumnOptions = (column: MatrixColumn, row: MatrixRow): MatrixOption[] => {
    if (column.dependsOn && column.optionsByDependency) {
      const dependencyValue = row[column.dependsOn];
      const dependencyKey =
        dependencyValue === undefined || dependencyValue === null
          ? ''
          : String(dependencyValue);
      return normalizeOptions(column.optionsByDependency[dependencyKey]);
    }

    return normalizeOptions(column.options);
  };

  const ensureDependentValidity = (updatedRow: MatrixRow, changedKey: string) => {
    columns.forEach((candidate) => {
      if (candidate.dependsOn !== changedKey) return;

      const options = resolveColumnOptions(candidate, updatedRow);
      const optionValues = new Set(options.map((option) => option.value));
      const current = updatedRow[candidate.key];

      if (candidate.type === 'checkbox' && Array.isArray(current)) {
        const filtered = current
          .map((item) => String(item))
          .filter((item) => optionValues.has(item));
        updatedRow[candidate.key] = filtered;
        return;
      }

      if ((candidate.type === 'select' || candidate.type === 'radio') && options.length > 0) {
        if (current === undefined || current === null || current === '') return;
        if (!optionValues.has(String(current))) {
          updatedRow[candidate.key] = defaultValueForColumn(candidate);
        }
      }
    });
  };

  const handleCellChange = (rowIndex: number, column: MatrixColumn, nextValue: unknown) => {
    if (disabled || !allowEditingCells || column.disabled) return;

    const nextRows = rows.map((row) => ({ ...row }));
    const updatedRow = nextRows[rowIndex] ?? {};

    const radioOptions = resolveColumnOptions(column, updatedRow);
    const isRowSelectorRadio = column.type === 'radio' && radioOptions.length === 0;

    if (isRowSelectorRadio) {
      const shouldSelect = Boolean(nextValue);
      nextRows.forEach((row) => {
        row[column.key] = false;
      });
      updatedRow[column.key] = shouldSelect;
    } else {
      updatedRow[column.key] = nextValue;
    }

    ensureDependentValidity(updatedRow, column.key);
    emitRows(nextRows);
  };

  const handleAddRow = (insertIndex: number) => {
    if (disabled || !allowAddingRows || rows.length >= maxRows) return;

    const nextRows = rows.map((row) => ({ ...row }));
    nextRows.splice(insertIndex, 0, createEmptyRow());
    emitRows(nextRows);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (disabled || !allowDeletingRows || rows.length <= minRows) return;

    const nextRows = rows.filter((_, index) => index !== rowIndex);
    emitRows(nextRows);
  };

  const renderCell = (column: MatrixColumn, row: MatrixRow, rowIndex: number) => {
    const rawValue = row[column.key];
    const columnDisabled = disabled || !allowEditingCells || Boolean(column.disabled);
    const cellPlaceholder = column.placeholder || placeholder;

    switch (column.type) {
      case 'number':
        return (
          <AddonAwareInput
            type="number"
            value={rawValue === undefined || rawValue === null ? '' : String(rawValue)}
            onChange={(event) =>
              handleCellChange(rowIndex, column, event.target.value === '' ? '' : event.target.value)
            }
            onBlur={onBlur}
            disabled={columnDisabled}
            placeholder={cellPlaceholder}
            startAddon={addons.startAddon}
            endAddon={addons.endAddon}
          />
        );

      case 'textarea':
        return (
          <AddonAwareTextarea
            value={rawValue === undefined || rawValue === null ? '' : String(rawValue)}
            onChange={(event) => handleCellChange(rowIndex, column, event.target.value)}
            onBlur={onBlur}
            disabled={columnDisabled}
            placeholder={cellPlaceholder}
            startAddon={addons.startAddon}
            endAddon={addons.endAddon}
            className="min-h-20"
          />
        );

      case 'select': {
        const options = resolveColumnOptions(column, row);
        const currentValue =
          rawValue === undefined || rawValue === null || rawValue === ''
            ? undefined
            : String(rawValue);

        return (
          <AddonAwareControl
            startAddon={addons.startAddon}
            endAddon={addons.endAddon}
            controlClassName={hasAddons ? 'px-1.5' : undefined}
          >
            <Select
              value={currentValue}
              onValueChange={(next) => handleCellChange(rowIndex, column, next)}
              disabled={columnDisabled}
            >
              <SelectTrigger
                className={cn(
                  hasAddons && 'h-full w-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
                  error && 'border-destructive focus-visible:ring-destructive/20'
                )}
              >
                <SelectValue placeholder={cellPlaceholder || 'Select'} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={Boolean(option.disabled)}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AddonAwareControl>
        );
      }

      case 'checkbox': {
        const options = resolveColumnOptions(column, row);

        if (options.length === 0) {
          return (
            <div className="flex h-9 items-center justify-center">
              <Checkbox
                checked={Boolean(rawValue)}
                onCheckedChange={(checked) => handleCellChange(rowIndex, column, Boolean(checked))}
                disabled={columnDisabled}
              />
            </div>
          );
        }

        const selectedValues = Array.isArray(rawValue)
          ? rawValue.map((item) => String(item))
          : [];

        return (
          <div className="space-y-2">
            {options.map((option) => {
              const checked = selectedValues.includes(option.value);
              return (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`${name}-${rowIndex}-${column.key}-${option.value}`}
                    checked={checked}
                    onCheckedChange={(nextChecked) => {
                      const next = new Set(selectedValues);
                      if (nextChecked) {
                        next.add(option.value);
                      } else {
                        next.delete(option.value);
                      }
                      handleCellChange(rowIndex, column, Array.from(next));
                    }}
                    disabled={columnDisabled || Boolean(option.disabled)}
                  />
                  <Label
                    htmlFor={`${name}-${rowIndex}-${column.key}-${option.value}`}
                    className="text-xs font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      }

      case 'radio': {
        const options = resolveColumnOptions(column, row);

        if (options.length === 0) {
          return (
            <div className="flex h-9 items-center justify-center">
              <input
                type="radio"
                checked={Boolean(rawValue)}
                onChange={(event) => handleCellChange(rowIndex, column, event.target.checked)}
                disabled={columnDisabled}
                name={`${name}-${column.key}-row-selector`}
                className="h-4 w-4 accent-primary"
              />
            </div>
          );
        }

        return (
          <RadioGroup
            value={rawValue === undefined || rawValue === null ? '' : String(rawValue)}
            onValueChange={(next) => handleCellChange(rowIndex, column, next)}
            disabled={columnDisabled}
          >
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${rowIndex}-${column.key}-${option.value}`}
                    disabled={columnDisabled || Boolean(option.disabled)}
                  />
                  <Label
                    htmlFor={`${name}-${rowIndex}-${column.key}-${option.value}`}
                    className="text-xs font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      }

      case 'text':
      default:
        return (
          <AddonAwareInput
            type="text"
            value={rawValue === undefined || rawValue === null ? '' : String(rawValue)}
            onChange={(event) => handleCellChange(rowIndex, column, event.target.value)}
            onBlur={onBlur}
            disabled={columnDisabled}
            placeholder={cellPlaceholder}
            startAddon={addons.startAddon}
            endAddon={addons.endAddon}
          />
        );
    }
  };

  const showRowActions = allowAddingRows || allowDeletingRows;

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label || humanizeKey(column.key)}</TableHead>
                ))}
                {showRowActions && <TableHead className="w-[120px] text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showRowActions ? 1 : 0)}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row, rowIndex) => (
                <TableRow key={`${name}-row-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={`${name}-${rowIndex}-${column.key}`} className="align-top">
                      {renderCell(column, row, rowIndex)}
                    </TableCell>
                  ))}

                  {showRowActions && (
                    <TableCell className="align-top">
                      <div className="flex items-center justify-end gap-1">
                        {allowAddingRows && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddRow(rowIndex + 1)}
                            disabled={disabled || rows.length >= maxRows}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}

                        {allowDeletingRows && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRow(rowIndex)}
                            disabled={disabled || rows.length <= minRows}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {allowAddingRows && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddRow(rows.length)}
            disabled={disabled || rows.length >= maxRows}
          >
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        )}
      </div>
    </FieldLayout>
  );
};

MatrixFormField.displayName = 'MatrixFormField';
