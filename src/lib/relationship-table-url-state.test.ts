import { describe, it, expect } from 'vitest';
import qs from 'qs';
import {
  buildRelationshipQueryString,
  parseRelationshipUrlState,
  serializeColumnFiltersForQuery,
  serializeColumnFiltersKey,
  type RelationshipUrlState,
} from './relationship-table-url-state';

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

describe('relationship-table-url-state', () => {
  it('parses search/sort/page/per_page/filters[in] from resource namespace', () => {
    const query =
      '?tags[search]=abc&tags[sort][name]=desc&tags[page]=3&tags[per_page]=25&tags[filters][status][in]=active,pending&tags[filters][kind][in]=system';

    const state = parseRelationshipUrlState(query, 'tags', 5);

    expect(state.search).toBe('abc');
    expect(state.sortBy).toBe('name');
    expect(state.sortOrder).toBe('desc');
    expect(state.page).toBe(3);
    expect(state.perPage).toBe(25);
    expect(state.columnFilters).toEqual({
      status: ['active', 'pending'],
      kind: ['system'],
    });
  });

  it('serializes multi-select filters to filters[field][in]=a,b format', () => {
    const serialized = serializeColumnFiltersForQuery({
      status: ['active', 'pending'],
      kind: ['system'],
    });

    expect(serialized).toEqual({
      status: { in: 'active,pending' },
      kind: { in: 'system' },
    });
  });

  it('builds next query string while preserving root via params and other resources', () => {
    const initialQuery =
      '?viaResource=products&viaResourceId=42&viaRelationship=tags&products[search]=chair';

    const state: RelationshipUrlState = {
      search: 'wireless',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 2,
      perPage: 10,
      columnFilters: {
        status: ['active', 'pending'],
      },
    };

    const nextQuery = buildRelationshipQueryString(initialQuery, 'tags', state);
    const parsed = qs.parse(nextQuery, {
      ignoreQueryPrefix: true,
      depth: 10,
    }) as Record<string, unknown>;

    expect(parsed.viaResource).toBe('products');
    expect(parsed.viaResourceId).toBe('42');
    expect(parsed.viaRelationship).toBe('tags');

    const products = asRecord(parsed.products);
    const tags = asRecord(parsed.tags);
    const tagsSort = asRecord(tags.sort);
    const tagsFilters = asRecord(tags.filters);
    const statusFilter = asRecord(tagsFilters.status);

    expect(products.search).toBe('chair');
    expect(tags.search).toBe('wireless');
    expect(tags.page).toBe('2');
    expect(tags.per_page).toBe('10');
    expect(tagsSort.name).toBe('asc');
    expect(statusFilter.in).toBe('active,pending');
  });

  it('returns stable filter key regardless of map order', () => {
    const keyA = serializeColumnFiltersKey({
      status: ['pending', 'active'],
      kind: ['system'],
    });
    const keyB = serializeColumnFiltersKey({
      kind: ['system'],
      status: ['active', 'pending'],
    });

    expect(keyA).toBe(keyB);
  });
});
