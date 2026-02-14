import { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Custom hook for debouncing callbacks
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */
export type DebouncedCallback<TArgs extends unknown[]> = (
  ...args: TArgs
) => void;

export interface DebouncedCallbackControls<TArgs extends unknown[]> {
  run: DebouncedCallback<TArgs>;
  cancel: () => void;
}

export function useDebouncedCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = { leading: false, trailing: true }
): DebouncedCallbackControls<TArgs> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const lastCallTimeRef = useRef<number>(0);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const cancel = useCallback(() => {
    if (!timeoutRef.current) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const run = useCallback(
    (...args: TArgs) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      const execute = () => {
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
      };

      // Clear existing timeout
      if (timeoutRef.current) {
        cancel();
      }

      // Leading edge execution
      if (options.leading && timeSinceLastCall >= delay) {
        execute();
      }

      // Trailing edge execution
      if (options.trailing) {
        timeoutRef.current = setTimeout(() => {
          if (!options.leading || timeSinceLastCall < delay) {
            execute();
          }
        }, delay);
      }
    },
    [cancel, delay, options.leading, options.trailing]
  );

  return useMemo(
    () => ({
      run,
      cancel,
    }),
    [cancel, run]
  );
}
