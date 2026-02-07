import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for debouncing callbacks
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = { leading: false, trailing: true }
): (...args: Parameters<T>) => void {
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      const execute = () => {
        lastCallTimeRef.current = now;
        callbackRef.current(...args);
      };

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
    [delay, options.leading, options.trailing]
  );
}
