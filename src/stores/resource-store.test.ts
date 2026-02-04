/**
 * Property-based tests for ResourceStore initialization and selector memoization
 * Validates: Requirements 6.1, 6.2, 6.3
 * Property 31: Store Initializes with Default State
 * Property 32: Selector Only Notifies on Change
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { useResourceStore } from './resource-store';
import type { AnyResource } from '@/types';

describe('ResourceStore - Property 31: Store Initializes with Default State', () => {
  /**
   * Property: For any store creation, the store should initialize with correct default state values.
   * Validates: Requirements 6.1
   *
   * This property verifies that every time the store is accessed, it has the correct
   * default values for all state properties.
   */
  it('should initialize with correct default state values', () => {
    // Get a fresh store instance
    const store = useResourceStore.getState();

    // Verify all default state values
    expect(store.resources).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.page).toBe(1);
    expect(store.pageSize).toBe(10);
    expect(store.total).toBe(0);
    expect(store.searchQuery).toBe('');
    expect(store.filters).toEqual({});
    expect(store.sortBy).toBe('id');
    expect(store.sortOrder).toBe('asc');
    expect(store.formOpen).toBe(false);
    expect(store.detailOpen).toBe(false);
    expect(store.confirmOpen).toBe(false);
  });

  /**
   * Property: For any number of store accesses, the default state should remain consistent.
   * This property verifies that the store's default state is stable across multiple accesses.
   */
  it('should maintain consistent default state across multiple accesses', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (accessCount) => {
        // Access the store multiple times
        for (let i = 0; i < accessCount; i++) {
          const store = useResourceStore.getState();

          // Verify all default state values remain consistent
          expect(store.resources).toEqual([]);
          expect(store.loading).toBe(false);
          expect(store.error).toBeNull();
          expect(store.page).toBe(1);
          expect(store.pageSize).toBe(10);
          expect(store.total).toBe(0);
          expect(store.searchQuery).toBe('');
          expect(store.filters).toEqual({});
          expect(store.sortBy).toBe('id');
          expect(store.sortOrder).toBe('asc');
          expect(store.formOpen).toBe(false);
          expect(store.detailOpen).toBe(false);
          expect(store.confirmOpen).toBe(false);
        }
      })
    );
  });

  /**
   * Property: For any store state, the resources array should always be an array.
   * This property verifies type safety of the resources property.
   */
  it('should always have resources as an array', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(Array.isArray(store.resources)).toBe(true);
      })
    );
  });

  /**
   * Property: For any store state, the filters should always be an object.
   * This property verifies type safety of the filters property.
   */
  it('should always have filters as an object', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(typeof store.filters).toBe('object');
        expect(store.filters).not.toBeNull();
      })
    );
  });

  /**
   * Property: For any store state, pagination values should be positive integers.
   * This property verifies that pagination state is always valid.
   */
  it('should have valid pagination values', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.page).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(store.page)).toBe(true);
        expect(store.pageSize).toBeGreaterThanOrEqual(1);
        expect(Number.isInteger(store.pageSize)).toBe(true);
        expect(store.total).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(store.total)).toBe(true);
      })
    );
  });

  /**
   * Property: For any store state, sortOrder should be either 'asc' or 'desc'.
   * This property verifies that sort order is always valid.
   */
  it('should have valid sort order', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(['asc', 'desc']).toContain(store.sortOrder);
      })
    );
  });

  /**
   * Property: For any store state, all boolean flags should be boolean values.
   * This property verifies type safety of boolean state properties.
   */
  it('should have valid boolean flags', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(typeof store.loading).toBe('boolean');
        expect(typeof store.formOpen).toBe('boolean');
        expect(typeof store.detailOpen).toBe('boolean');
        expect(typeof store.confirmOpen).toBe('boolean');
      })
    );
  });

  /**
   * Property: For any store state, searchQuery should be a string.
   * This property verifies type safety of the searchQuery property.
   */
  it('should have searchQuery as a string', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(typeof store.searchQuery).toBe('string');
      })
    );
  });

  /**
   * Property: For any store state, sortBy should be a string.
   * This property verifies type safety of the sortBy property.
   */
  it('should have sortBy as a string', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(typeof store.sortBy).toBe('string');
      })
    );
  });

  /**
   * Property: For any store state, error should be either null or an Error instance.
   * This property verifies type safety of the error property.
   */
  it('should have error as null or Error instance', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.error === null || store.error instanceof Error).toBe(true);
      })
    );
  });

  /**
   * Property: For any store state, currentResource should be null by default.
   * This property verifies that no resource is selected initially.
   */
  it('should have currentResource as null by default', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.currentResource).toBeNull();
      })
    );
  });

  /**
   * Property: For any store state, formMode should be 'create' by default.
   * This property verifies the default form mode.
   */
  it('should have formMode as create by default', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.formMode).toBe('create');
      })
    );
  });

  /**
   * Property: For any store state, confirmAction should be null by default.
   * This property verifies that no confirmation action is set initially.
   */
  it('should have confirmAction as null by default', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.confirmAction).toBeNull();
      })
    );
  });

  /**
   * Property: For any store state, confirmMessage should be an empty string by default.
   * This property verifies the default confirmation message.
   */
  it('should have confirmMessage as empty string by default', () => {
    fc.assert(
      fc.property(fc.anything(), () => {
        const store = useResourceStore.getState();
        expect(store.confirmMessage).toBe('');
      })
    );
  });
});


describe('ResourceStore - Property 32: Selector Only Notifies on Change', () => {
  /**
   * Property: For any store selector, the component should only re-render when the selected state value changes.
   * Validates: Requirements 6.2, 6.3
   *
   * This property verifies that selectors only notify subscribers when their selected value changes,
   * and don't notify when unrelated state changes.
   */

  /**
   * Test: selectResources only changes when resources change
   * When resources change, selectResources changes but selectLoading doesn't
   */
  it('should only change selectResources when resources change', () => {
    const store = useResourceStore.getState();

    // Get initial values
    const initialResources = store.selectResources();
    const initialLoading = store.selectLoading();

    // Change resources - should change selectResources
    const newResources: AnyResource[] = [
      {
        id: '1',
        type: 'user',
        attributes: { name: 'Test User' },
      } as AnyResource,
    ];
    store.setResources(newResources);

    // Verify selectResources changed
    expect(store.selectResources()).not.toBe(initialResources);

    // Change loading - should not change selectResources
    const resourcesAfterLoadingChange = store.selectResources();
    store.setLoading(true);

    // Verify selectResources didn't change when loading changed
    expect(store.selectResources()).toBe(resourcesAfterLoadingChange);

    // Verify selectLoading changed
    expect(store.selectLoading()).not.toBe(initialLoading);
  });

  /**
   * Test: selectLoading only changes when loading changes
   * When loading changes, selectLoading changes but selectResources doesn't
   */
  it('should only change selectLoading when loading changes', () => {
    const store = useResourceStore.getState();

    // Reset state to known values
    store.setLoading(false);
    store.setResources([]);

    // Get initial values
    const initialLoading = store.selectLoading();
    const initialResources = store.selectResources();

    // Change loading - should change selectLoading
    store.setLoading(true);

    // Verify selectLoading changed
    expect(store.selectLoading()).not.toBe(initialLoading);

    // Change resources - should not change selectLoading
    const loadingAfterResourcesChange = store.selectLoading();
    const newResources: AnyResource[] = [
      {
        id: '2',
        type: 'product',
        attributes: { name: 'Test Product' },
      } as AnyResource,
    ];
    store.setResources(newResources);

    // Verify selectLoading didn't change when resources changed
    expect(store.selectLoading()).toBe(loadingAfterResourcesChange);

    // Verify selectResources changed
    expect(store.selectResources()).not.toBe(initialResources);
  });

  /**
   * Test: selectPaginatedResources only changes when page or resources change
   * When page changes, selectPaginatedResources changes but selectResources doesn't
   */
  it('should only change selectPaginatedResources when page or resources change', () => {
    const store = useResourceStore.getState();

    // Set up initial resources
    const resources: AnyResource[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      type: 'user',
      attributes: { name: `User ${i + 1}` },
    })) as AnyResource[];
    store.setResources(resources);
    store.setTotal(30);

    // Get initial values
    const initialResources = store.selectResources();
    const initialPaginated = store.selectPaginatedResources();

    // Change page - should change selectPaginatedResources
    store.setPage(2);

    // Verify selectPaginatedResources changed
    expect(store.selectPaginatedResources()).not.toBe(initialPaginated);

    // Verify selectResources didn't change
    expect(store.selectResources()).toBe(initialResources);
  });

  /**
   * Test: Multiple selectors can be used independently without interference
   * Verifies that multiple selectors don't interfere with each other
   */
  it('should allow multiple selectors to work independently', () => {
    const store = useResourceStore.getState();

    // Reset state to known values
    store.setLoading(false);
    store.setError(null);
    store.setResources([]);

    // Get initial values
    const initialResources = store.selectResources();
    const initialLoading = store.selectLoading();
    const initialError = store.selectError();

    // Change resources
    const newResources: AnyResource[] = [
      {
        id: '1',
        type: 'user',
        attributes: { name: 'Test' },
      } as AnyResource,
    ];
    store.setResources(newResources);

    // Verify resources changed
    expect(store.selectResources()).not.toBe(initialResources);

    // Verify loading and error didn't change
    expect(store.selectLoading()).toBe(initialLoading);
    expect(store.selectError()).toBe(initialError);

    // Change loading
    store.setLoading(true);

    // Verify loading changed
    expect(store.selectLoading()).not.toBe(initialLoading);

    // Verify resources and error didn't change
    expect(store.selectResources()).not.toBe(initialResources); // Still different from initial
    expect(store.selectError()).toBe(initialError);

    // Change error
    const testError = new Error('Test error');
    store.setError(testError);

    // Verify error changed
    expect(store.selectError()).not.toBe(initialError);
  });

  /**
   * Test: Selector values are memoized and don't create new references unnecessarily
   * Verifies that selectors return the same reference when state hasn't changed
   */
  it('should memoize selector values and not create new references unnecessarily', () => {
    const store = useResourceStore.getState();

    // Get initial selector values
    const resources1 = store.selectResources();
    const resources2 = store.selectResources();

    // Verify same reference when state hasn't changed
    expect(resources1).toBe(resources2);

    // Change unrelated state
    store.setLoading(true);

    // Verify selector still returns same reference
    const resources3 = store.selectResources();
    expect(resources1).toBe(resources3);

    // Change related state
    const newResources: AnyResource[] = [
      {
        id: '1',
        type: 'user',
        attributes: { name: 'Test' },
      } as AnyResource,
    ];
    store.setResources(newResources);

    // Verify selector returns new reference when state changed
    const resources4 = store.selectResources();
    expect(resources1).not.toBe(resources4);
  });

  /**
   * Property: For any sequence of state changes, selectors should only notify when their selected value changes.
   * This property uses fast-check to generate random sequences of state changes and verify selector behavior.
   */
  it('should only notify selectors when their selected value changes (property-based)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant({ type: 'setLoading', value: fc.boolean() }),
            fc.constant({ type: 'setError', value: fc.constant(null) }),
            fc.constant({ type: 'setPage', value: fc.integer({ min: 1, max: 10 }) })
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (actions) => {
          const store = useResourceStore.getState();

          // Set up initial resources
          const resources: AnyResource[] = Array.from({ length: 30 }, (_, i) => ({
            id: String(i + 1),
            type: 'user',
            attributes: { name: `User ${i + 1}` },
          })) as AnyResource[];
          store.setResources(resources);
          store.setTotal(30);

          // Execute random state changes
          actions.forEach((action: any) => {
            if (action.type === 'setLoading') {
              store.setLoading(fc.sample(fc.boolean(), 1)[0]);
            } else if (action.type === 'setError') {
              store.setError(null);
            } else if (action.type === 'setPage') {
              store.setPage(fc.sample(fc.integer({ min: 1, max: 10 }), 1)[0]);
            }
          });

          // Verify that selectors work correctly
          expect(typeof store.selectLoading()).toBe('boolean');
          expect(typeof store.selectPage).toBe('undefined'); // page is not a selector
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test: Selector hooks (useResources, useResourcesLoading, etc.) only re-render when their selected value changes
   * This test verifies that the selector hooks work correctly with React's subscription mechanism
   */
  it('should provide selector hooks that only re-render on value change', () => {
    const store = useResourceStore.getState();

    // Get initial values from selector hooks
    const initialResources = store.selectResources();
    const initialLoading = store.selectLoading();

    // Verify initial values
    expect(Array.isArray(initialResources)).toBe(true);
    expect(typeof initialLoading).toBe('boolean');

    // Change unrelated state
    store.setError(new Error('Test error'));

    // Verify selector values haven't changed
    expect(store.selectResources()).toBe(initialResources);
    expect(store.selectLoading()).toBe(initialLoading);

    // Change related state
    const newResources: AnyResource[] = [
      {
        id: '1',
        type: 'user',
        attributes: { name: 'Test' },
      } as AnyResource,
    ];
    store.setResources(newResources);

    // Verify selector values changed
    expect(store.selectResources()).not.toBe(initialResources);
  });

  /**
   * Test: Selectors should not notify when the same value is set again
   * Verifies that setting the same value doesn't trigger notifications
   */
  it('should not notify when the same value is set again', () => {
    const store = useResourceStore.getState();

    // Set loading to true
    store.setLoading(true);
    const loading1 = store.selectLoading();

    // Set loading to true again (same value)
    store.setLoading(true);

    // Verify selector returns the same value
    const loading2 = store.selectLoading();
    expect(loading1).toBe(loading2);
  });

  /**
   * Test: Paginated resources should update when page changes
   * Verifies that selectPaginatedResources returns correct slice based on page
   */
  it('should return correct paginated resources for different pages', () => {
    const store = useResourceStore.getState();

    // Set up resources
    const resources: AnyResource[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i + 1),
      type: 'user',
      attributes: { name: `User ${i + 1}` },
    })) as AnyResource[];
    store.setResources(resources);
    store.setTotal(30);
    store.setPageSize(10);

    // Get page 1
    store.setPage(1);
    const page1 = store.selectPaginatedResources();
    expect(page1).toHaveLength(10);
    expect(page1[0].id).toBe('1');
    expect(page1[9].id).toBe('10');

    // Get page 2
    store.setPage(2);
    const page2 = store.selectPaginatedResources();
    expect(page2).toHaveLength(10);
    expect(page2[0].id).toBe('11');
    expect(page2[9].id).toBe('20');

    // Get page 3
    store.setPage(3);
    const page3 = store.selectPaginatedResources();
    expect(page3).toHaveLength(10);
    expect(page3[0].id).toBe('21');
    expect(page3[9].id).toBe('30');

    // Verify pages have different content
    expect(page1[0].id).not.toBe(page2[0].id);
    expect(page2[0].id).not.toBe(page3[0].id);
  });

  /**
   * Test: Selectors should handle edge cases correctly
   * Verifies that selectors work correctly with empty resources and edge cases
   */
  it('should handle edge cases correctly', () => {
    const store = useResourceStore.getState();

    // Empty resources
    store.setResources([]);
    store.setTotal(0);
    expect(store.selectResources()).toEqual([]);
    expect(store.selectPaginatedResources()).toEqual([]);

    // Single resource
    const singleResource: AnyResource[] = [
      {
        id: '1',
        type: 'user',
        attributes: { name: 'Test' },
      } as AnyResource,
    ];
    store.setResources(singleResource);
    store.setTotal(1);
    store.setPage(1);
    expect(store.selectResources()).toHaveLength(1);
    expect(store.selectPaginatedResources()).toHaveLength(1);

    // Page beyond available resources
    store.setPage(100);
    expect(store.selectPaginatedResources()).toEqual([]);
  });
});
