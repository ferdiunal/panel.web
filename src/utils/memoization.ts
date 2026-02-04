/**
 * Memoization Utilities
 * Provides utilities for component and function memoization
 */

import React from 'react';

/**
 * Create a memoized selector for Zustand store
 * Only notifies when selected value changes
 */
export function createSelector<T, S>(
  selector: (state: T) => S,
  equalityFn?: (a: S, b: S) => boolean
) {
  let lastValue: S | undefined;
  let lastState: T | undefined;

  return (state: T): S => {
    if (lastState !== state) {
      const newValue = selector(state);
      if (
        lastValue === undefined ||
        !equalityFn?.(lastValue, newValue) ||
        lastValue !== newValue
      ) {
        lastValue = newValue;
      }
      lastState = state;
    }
    return lastValue!;
  };
}

/**
 * Shallow equality check for objects
 */
export function shallowEqual<T extends Record<string, any>>(
  a: T,
  b: T
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Deep equality check for objects
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as Record<string, any>);
  const keysB = Object.keys(b as Record<string, any>);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    const valueA = (a as Record<string, any>)[key];
    const valueB = (b as Record<string, any>)[key];

    if (typeof valueA === 'object' && typeof valueB === 'object') {
      return deepEqual(valueA, valueB);
    }

    return valueA === valueB;
  });
}

/**
 * Memoize a component with custom equality check
 */
export function memoizeComponent<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, propsAreEqual);
}

/**
 * Create a memoized callback that only updates when dependencies change
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps) as T;
}

/**
 * Create a memoized value that only updates when dependencies change
 */
export function useMemoizedValue<T>(
  value: T,
  deps: React.DependencyList,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const memoized = React.useRef<T>(value);

  React.useEffect(() => {
    if (!equalityFn || !equalityFn(memoized.current, value)) {
      memoized.current = value;
    }
  }, deps);

  return memoized.current;
}
