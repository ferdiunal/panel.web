/**
 * Form utility functions
 */

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Get relevant fields for dependency resolution
 * Returns fields that are dependencies of the changed fields
 */
export function getRelevantFields(
  changedFields: string[],
  allFields: Array<{ key: string; depends_on?: string[] }>
): string[] {
  const relevant = new Set<string>(changedFields);

  // Add all fields that depend on changed fields
  allFields.forEach((field) => {
    if (field.depends_on?.some((dep) => changedFields.includes(dep))) {
      relevant.add(field.key);
    }
  });

  return Array.from(relevant);
}

/**
 * Generate unique form ID
 */
export function generateFormId(resourceType: string, mode: 'create' | 'edit', resourceId?: string | number): string {
  const timestamp = Date.now();
  const id = resourceId ? `${resourceId}` : 'new';
  return `${resourceType}-${mode}-${id}-${timestamp}`;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key as keyof T] = deepMerge(
        targetValue as any,
        sourceValue as any
      );
    } else {
      result[key as keyof T] = sourceValue as any;
    }
  });

  return result;
}
