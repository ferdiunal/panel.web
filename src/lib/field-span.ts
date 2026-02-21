type FieldWithProps = {
  props?: Record<string, any>;
};

const MIN_FIELD_SPAN = 1;
const MAX_FIELD_SPAN = 12;
const DEFAULT_FIELD_SPAN = 12;

const SPAN_CLASS_BY_VALUE: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

function clampSpan(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FIELD_SPAN;
  if (value < MIN_FIELD_SPAN) return MIN_FIELD_SPAN;
  if (value > MAX_FIELD_SPAN) return MAX_FIELD_SPAN;
  return Math.trunc(value);
}

function parseSpan(value: unknown): number {
  if (typeof value === 'number') {
    return clampSpan(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.trim(), 10);
    if (!Number.isNaN(parsed)) {
      return clampSpan(parsed);
    }
  }

  return DEFAULT_FIELD_SPAN;
}

export function getFieldSpan(field?: FieldWithProps | null): number {
  return parseSpan(field?.props?.span);
}

export function getFieldSpanClass(field?: FieldWithProps | null): string {
  return SPAN_CLASS_BY_VALUE[getFieldSpan(field)] || SPAN_CLASS_BY_VALUE[DEFAULT_FIELD_SPAN];
}

