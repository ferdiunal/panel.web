type DatePreset = 'short' | 'medium' | 'long' | 'full';

interface TemporalFieldLike {
  data: unknown;
  type?: string;
  view?: string;
  props?: Record<string, unknown>;
}

const DATE_FORMAT_OPTIONS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: 'short' },
  medium: { dateStyle: 'medium' },
  long: { dateStyle: 'long' },
  full: { dateStyle: 'full' },
};

const DATETIME_FORMAT_OPTIONS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: 'short', timeStyle: 'short' },
  medium: { dateStyle: 'medium', timeStyle: 'short' },
  long: { dateStyle: 'long', timeStyle: 'medium' },
  full: { dateStyle: 'full', timeStyle: 'medium' },
};

const DATETIME_VIEW_REGEX = /(^|-)datetime-field($|-)/;
const DATE_VIEW_REGEX = /(^|-)date-field($|-)/;

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime());

export const getBrowserLocale = (): string | undefined => {
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement?.lang?.trim();
    if (htmlLang) {
      return htmlLang;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return undefined;
};

export const normalizeDateValue = (value: unknown): Date | undefined => {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isValidDate(value) ? value : undefined;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const raw = value.trim();
  if (!raw) return undefined;

  const direct = new Date(raw);
  if (isValidDate(direct)) {
    return direct;
  }

  // Some payloads include microseconds (6+ digits). JS Date parsing is not consistent there.
  const normalizedFraction = raw.replace(
    /(\.\d{3})\d+(?=(Z|[+-]\d{2}(?::?\d{2})?)$)/,
    '$1',
  );
  const microsecondsDate = new Date(normalizedFraction);
  if (isValidDate(microsecondsDate)) {
    return microsecondsDate;
  }

  // Some offsets arrive as +0300; normalize to +03:00.
  const normalizedOffset = normalizedFraction.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  const offsetDate = new Date(normalizedOffset);
  if (isValidDate(offsetDate)) {
    return offsetDate;
  }

  return undefined;
};

const resolvePreset = (
  preset: string | undefined,
  fallback: DatePreset,
  options: Record<DatePreset, Intl.DateTimeFormatOptions>,
): DatePreset => {
  if (preset && preset in options) {
    return preset as DatePreset;
  }
  return fallback;
};

const formatWithIntl = (
  value: unknown,
  preset: string | undefined,
  fallback: DatePreset,
  options: Record<DatePreset, Intl.DateTimeFormatOptions>,
  locale?: string,
): string => {
  const normalized = normalizeDateValue(value);
  if (!normalized) return '—';

  try {
    const localeToUse = locale || getBrowserLocale();
    const selectedPreset = resolvePreset(preset, fallback, options);
    return new Intl.DateTimeFormat(localeToUse, options[selectedPreset]).format(normalized);
  } catch (error) {
    console.error('Tarih formatlama hatasi:', error);
    return '—';
  }
};

export const formatDateForDisplay = (
  value: unknown,
  preset?: string,
  fallback: DatePreset = 'medium',
  locale?: string,
): string => {
  return formatWithIntl(value, preset, fallback, DATE_FORMAT_OPTIONS, locale);
};

export const formatDateTimeForDisplay = (
  value: unknown,
  preset?: string,
  fallback: DatePreset = 'medium',
  locale?: string,
): string => {
  return formatWithIntl(value, preset, fallback, DATETIME_FORMAT_OPTIONS, locale);
};

export const formatTemporalFieldValue = (field: TemporalFieldLike): string | null => {
  const view = field.view || '';
  const type = field.type || '';
  const preset = typeof field.props?.format === 'string' ? field.props.format : undefined;

  const isDateTimeField = type === 'datetime' || DATETIME_VIEW_REGEX.test(view);
  if (isDateTimeField) {
    return formatDateTimeForDisplay(field.data, preset, 'medium');
  }

  const isDateField = type === 'date' || DATE_VIEW_REGEX.test(view);
  if (isDateField) {
    return formatDateForDisplay(field.data, preset, 'medium');
  }

  return null;
};
