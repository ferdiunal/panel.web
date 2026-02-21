import qs from 'qs';

export type RelationshipSortOrder = 'asc' | 'desc';

export interface RelationshipUrlState {
  search: string;
  page: number;
  perPage: number;
  view: 'table' | 'grid';
  sortBy?: string;
  sortOrder: RelationshipSortOrder;
  columnFilters: Record<string, string[]>;
}

function toObjectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeFilterValues(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];
  const normalized: string[] = [];

  for (const item of values) {
    const chunks = String(item)
      .split(',')
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0);

    for (const chunk of chunks) {
      if (!normalized.includes(chunk)) {
        normalized.push(chunk);
      }
    }
  }

  return normalized;
}

function parseColumnFilters(filtersValue: unknown): Record<string, string[]> {
  const filtersObject = toObjectRecord(filtersValue);
  if (!filtersObject) {
    return {};
  }

  const parsed: Record<string, string[]> = {};
  for (const [field, rawValue] of Object.entries(filtersObject)) {
    const fieldObject = toObjectRecord(rawValue);
    const inValue =
      fieldObject && Object.prototype.hasOwnProperty.call(fieldObject, 'in')
        ? fieldObject.in
        : rawValue;

    const values = normalizeFilterValues(inValue);
    if (values.length > 0) {
      parsed[field] = values;
    }
  }

  return parsed;
}

export function parseRelationshipUrlState(
  queryString: string,
  resourceType: string,
  defaultPerPage: number
): RelationshipUrlState {
  const parsed = qs.parse(queryString, {
    ignoreQueryPrefix: true,
    depth: 10,
  });

  const resourceState = toObjectRecord(parsed[resourceType]);
  if (!resourceState) {
    return {
      search: '',
      page: 1,
      perPage: defaultPerPage,
      view: 'table',
      sortOrder: 'asc',
      columnFilters: {},
    };
  }

  let sortBy: string | undefined;
  let sortOrder: RelationshipSortOrder = 'asc';

  const sortValue = toObjectRecord(resourceState.sort);
  if (sortValue) {
    const sortEntries = Object.entries(sortValue);
    if (sortEntries.length > 0) {
      const [column, directionValue] = sortEntries[0];
      if (column.trim().length > 0) {
        sortBy = column;
        sortOrder = String(directionValue).toLowerCase() === 'desc' ? 'desc' : 'asc';
      }
    }
  }

  const search = typeof resourceState.search === 'string' ? resourceState.search : '';
  const page = parsePositiveInt(resourceState.page, 1);
  const perPage = parsePositiveInt(resourceState.per_page, defaultPerPage);
  const view = String(resourceState.view || 'table').toLowerCase() === 'grid' ? 'grid' : 'table';
  const columnFilters = parseColumnFilters(resourceState.filters);

  return {
    search,
    page,
    perPage,
    view,
    sortBy,
    sortOrder,
    columnFilters,
  };
}

export function serializeColumnFiltersForQuery(
  filters: Record<string, string[]>
): Record<string, { in: string }> {
  const serialized: Record<string, { in: string }> = {};

  for (const [field, rawValues] of Object.entries(filters)) {
    const values = normalizeFilterValues(rawValues);
    if (values.length > 0) {
      serialized[field] = { in: values.join(',') };
    }
  }

  return serialized;
}

export function serializeColumnFiltersKey(filters: Record<string, string[]>): string {
  const normalized = Object.entries(filters)
    .map(([field, values]) => [field, [...values].sort()] as const)
    .sort(([fieldA], [fieldB]) => fieldA.localeCompare(fieldB));

  return JSON.stringify(normalized);
}

export function buildRelationshipQueryString(
  existingQueryString: string,
  resourceType: string,
  state: RelationshipUrlState
): string {
  const parsed = qs.parse(existingQueryString, {
    ignoreQueryPrefix: true,
    depth: 10,
  }) as Record<string, unknown>;

  const resourceQuery: Record<string, unknown> = {
    page: state.page,
    per_page: state.perPage,
  };

  if (state.view === 'grid') {
    resourceQuery.view = 'grid';
  }

  const trimmedSearch = state.search.trim();
  if (trimmedSearch.length > 0) {
    resourceQuery.search = trimmedSearch;
  }

  if (state.sortBy && state.sortBy.trim().length > 0) {
    resourceQuery.sort = {
      [state.sortBy]: state.sortOrder,
    };
  }

  const serializedFilters = serializeColumnFiltersForQuery(state.columnFilters);
  if (Object.keys(serializedFilters).length > 0) {
    resourceQuery.filters = serializedFilters;
  }

  parsed[resourceType] = resourceQuery;

  return qs.stringify(parsed, {
    encode: true,
    encodeValuesOnly: true,
    skipNulls: true,
    allowDots: false,
  });
}
