interface MoneyFieldLike {
  data: unknown;
  type?: string;
  view?: string;
  props?: Record<string, unknown>;
}

const MONEY_VIEW_REGEX = /(^|-)money-field($|-)/;

const getBrowserLocale = (): string | undefined => {
  if (typeof document !== "undefined") {
    const htmlLang = document.documentElement?.lang?.trim();
    if (htmlLang) return htmlLang;
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return undefined;
};

const normalizeMoneyValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const raw = value.trim();
  if (!raw) return undefined;

  const normalized = raw
    .replace(/\s/g, "")
    .replace(/[^0-9,.\-]/g, "")
    .replace(/,(?=\d{1,2}$)/, ".")
    .replace(/,/g, "");

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const formatMoneyForDisplay = (
  value: unknown,
  currency: string,
  locale?: string,
): string => {
  const amount = normalizeMoneyValue(value);
  if (amount === undefined) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(locale || getBrowserLocale(), {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return amount.toString();
  }
};

export const formatMoneyFieldValue = (field: MoneyFieldLike): string | null => {
  const view = field.view || "";
  const type = field.type || "";
  const isMoneyField = type === "money" || MONEY_VIEW_REGEX.test(view);
  if (!isMoneyField) {
    return null;
  }

  const rawCurrency = typeof field.props?.currency === "string" ? field.props.currency : "USD";
  const currency = rawCurrency.toUpperCase();
  return formatMoneyForDisplay(field.data, currency);
};
