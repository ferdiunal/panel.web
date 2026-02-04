/**
 * FormView Component Tests
 * Tests for form creation, update, validation, and submission
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import FormView from './FormView';
import type { FieldDefinition, User } from '@/types';

// Mock ResponsiveModal
vi.mock('@/components/ui/responsive-modal', () => ({
  ResponsiveModal: ({ children, title, open, onOpenChange }: { children: React.ReactNode; title: string; open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? (
      <div data-testid="responsive-modal" role="dialog">
        <h2>{title}</h2>
        <button onClick={() => onOpenChange(false)} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

// Mock field components
vi.mock('@/components/fields', () => ({
  TextInput: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  EmailInput: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  PasswordInput: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  SelectField: ({ name, label, value, onChange, error, disabled, options }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean; options: Array<{ value: string; label: string }> }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  DateField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  DateTimeField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  NumberInput: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: number; onChange: (v: number) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  TextareaField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  URLInput: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  SwitchField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: boolean; onChange: (v: boolean) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  BelongsToField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  HasOneField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  HasManyField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string[]; onChange: (v: string[]) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={Array.isArray(value) ? value.join(',') : ''}
        onChange={(e) => onChange(e.target.value.split(','))}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  BelongsToManyField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string[]; onChange: (v: string[]) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={Array.isArray(value) ? value.join(',') : ''}
        onChange={(e) => onChange(e.target.value.split(','))}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
  MorphToField: ({ name, label, value, onChange, error, disabled }: { name: string; label: string; value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) => (
    <div data-testid={`field-${name}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`input-${name}`}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  ),
}));

describe('FormView Component', () => {
  const mockFields: FieldDefinition[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ],
    },
  ];

  const mockResource: User = {
    id: '1',
    type: 'user',
    attributes: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 9: Form Creation Shows Empty Fields', () => {
    it('should render empty fields in create mode', () => {
      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('input-name')).toHaveValue('');
      expect(screen.getByTestId('input-email')).toHaveValue('');
    });

    it(
      'should initialize all fields with empty values in create mode',
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            label: fc.string({ minLength: 1 }),
            type: fc.constantFrom('text', 'email', 'number'),
          })
        ),
        (fields) => {
          if (fields.length === 0) return true;

          const { container } = render(
            <FormView
              resourceType="user"
              mode="create"
              fields={fields}
              isOpen={true}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          fields.forEach((field) => {
            const input = container.querySelector(`[data-testid="input-${field.name}"]`);
            expect(input).toHaveValue('');
          });

          return true;
        }
      )
    );
  });

  describe('Property 10: Form Update Pre-populates Data', () => {
    it('should pre-populate fields with resource data in update mode', () => {
      render(
        <FormView
          resourceType="user"
          mode="update"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('input-name')).toHaveValue('John Doe');
      expect(screen.getByTestId('input-email')).toHaveValue('john@example.com');
    });

    it(
      'should pre-populate all fields with resource attributes in update mode',
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          email: fc.string({ minLength: 1 }),
          role: fc.constantFrom('admin', 'user'),
          status: fc.constantFrom('active', 'inactive'),
        }),
        (attributes) => {
          const resource: User = {
            id: '1',
            type: 'user',
            attributes,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { container } = render(
            <FormView
              resourceType="user"
              mode="update"
              resource={resource}
              fields={mockFields}
              isOpen={true}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          expect(container.querySelector('[data-testid="input-name"]')).toHaveValue(
            attributes.name
          );
          expect(container.querySelector('[data-testid="input-email"]')).toHaveValue(
            attributes.email
          );

          return true;
        }
      )
    );
  });

  describe('Property 11: Validation Errors Display Immediately', () => {
    it('should display validation error when submitting invalid data', async () => {
      const user = userEvent.setup();

      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toBeInTheDocument();
      });
    });

    it('should clear error when field is corrected', async () => {
      const user = userEvent.setup();

      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toBeInTheDocument();
      });

      // Fill the field
      const nameInput = screen.getByTestId('input-name');
      await user.clear(nameInput);
      await user.type(nameInput, 'John Doe');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByTestId('error-name')).not.toBeInTheDocument();
      });
    });
  });

  describe('Property 12: Form Prevents Invalid Submission', () => {
    it('should not call onSubmit with invalid data', async () => {
      const user = userEvent.setup();

      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should display all validation errors for invalid fields', async () => {
      const user = userEvent.setup();

      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-name')).toBeInTheDocument();
        expect(screen.getByTestId('error-email')).toBeInTheDocument();
      });
    });
  });

  describe('Property 13: Submit Button Shows Loading State', () => {
    it('should disable fields and show loading state during submission', () => {
      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          isSubmitting={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);

      const submitButton = screen.getByRole('button', { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Property 14: Success Redirects to Index', () => {
    it.todo('should call onSuccess after successful submission');
  });

  describe('Property 15: Submission Error Allows Retry', () => {
    it.todo('should display error message on submission failure');

    it.todo('should allow retry after submission error');
  });

  describe('Property 16: Cancel Discards Changes', () => {
    it('should discard changes and call onCancel when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      await user.type(nameInput, 'John Doe');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should reset form to initial state after cancel', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      await user.type(nameInput, 'John Doe');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Reopen form
      rerender(
        <FormView
          resourceType="user"
          mode="create"
          fields={mockFields}
          isOpen={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('input-name')).toHaveValue('');
    });
  });

  describe('Property 37: Multiple Validation Errors Display', () => {
    it(
      'should display all validation errors for multiple invalid fields',
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            label: fc.string({ minLength: 1 }),
            type: fc.constantFrom('text', 'email'),
            required: fc.constant(true),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (fields) => {
          const user = userEvent.setup();

          const { container } = render(
            <FormView
              resourceType="user"
              mode="create"
              fields={fields}
              isOpen={true}
              onSubmit={mockOnSubmit}
              onCancel={mockOnCancel}
            />
          );

          const submitButton = screen.getByRole('button', { name: /submit/i });
          await user.click(submitButton);

          await waitFor(() => {
            fields.forEach((field) => {
              const error = container.querySelector(`[data-testid="error-${field.name}"]`);
              expect(error).toBeInTheDocument();
            });
          });

          return true;
        }
      )
    );
  });
});
