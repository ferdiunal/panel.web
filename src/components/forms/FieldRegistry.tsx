/**
 * Field Registry - Centralized field type to component mapping
 */

import React from 'react';
import type { FieldDefinition } from '@/types/form';

export interface FieldComponentProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  container?: HTMLElement | null;
}

type FieldComponent = React.ComponentType<FieldComponentProps>;

class FieldRegistryClass {
  private registry = new Map<string, FieldComponent>();

  register(type: string, component: FieldComponent) {
    this.registry.set(type, component);
  }

  get(type: string): FieldComponent | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  getAll(): Map<string, FieldComponent> {
    return new Map(this.registry);
  }

  render(
    field: FieldDefinition,
    props: Omit<FieldComponentProps, 'field'>
  ): React.ReactNode {
    // Try field.view first, then field.type
    const Component =
      this.get(field.view) ?? this.get(field.type) ?? this.get('text');

    if (!Component) {
      console.warn(
        `No component registered for field type: ${field.type} or view: ${field.view}`
      );
      return null;
    }

    return <Component key={field.key} field={field} {...props} />;
  }
}

export const fieldRegistry = new FieldRegistryClass();

// Export for use in other files
export default fieldRegistry;
