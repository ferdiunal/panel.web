import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TextInput } from './TextInput';

describe('TextInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and input field', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          label="Email"
          value=""
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not display required indicator when required prop is false', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="email"
          label="Email"
          value=""
          onChange={onChange}
          required={false}
        />
      );

      const asterisks = screen.queryAllByText('*');
      expect(asterisks.length).toBe(0);
    });

    it('should display placeholder text', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          placeholder="Enter your username"
        />
      );

      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          helpText="Username must be at least 3 characters"
        />
      );

      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          error="Username is required"
        />
      );

      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          error="Username is required"
          helpText="Username must be at least 3 characters"
        />
      );

      expect(screen.queryByText('Username must be at least 3 characters')).not.toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'john_doe' } });

      expect(onChange).toHaveBeenCalledWith('john_doe');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value="john_doe"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('john_doe');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should not be disabled when disabled prop is false', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          disabled={false}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          error="Username is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error message', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          error="Username is required"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'username-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          helpText="Username must be at least 3 characters"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'username-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username');
      expect(screen.getByText('Username')).toHaveAttribute('for', 'username');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle special characters in value', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value="user@#$%^&*()"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('user@#$%^&*()');
    });

    it('should handle very long values', () => {
      const onChange = vi.fn();
      const longValue = 'a'.repeat(1000);
      render(
        <TextInput
          name="username"
          label="Username"
          value={longValue}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it('should handle multiple errors and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
          error="Username is required"
        />
      );

      expect(screen.getByText('Username is required')).toBeInTheDocument();

      rerender(
        <TextInput
          name="username"
          label="Username"
          value="john"
          onChange={onChange}
          helpText="Username looks good"
        />
      );

      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      expect(screen.getByText('Username looks good')).toBeInTheDocument();
    });
  });

  describe('Type Validation', () => {
    it('should render as text input type', () => {
      const onChange = vi.fn();
      render(
        <TextInput
          name="username"
          label="Username"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });
  });

  describe('Property 25: Text Field Renders Correctly', () => {
    /**
     * **Validates: Requirements 4.1**
     * 
     * For any text field with valid props, the component should render:
     * - A label element with the correct text
     * - An input element with type="text"
     * - The input element should have the correct name and id
     * - The input element should display the current value
     */
    it('should render text field with all required elements for any valid props', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            value: fc.string({ maxLength: 500 }),
            required: fc.boolean(),
            disabled: fc.boolean(),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <TextInput
                name={props.name}
                label={props.label}
                value={props.value}
                onChange={onChange}
                required={props.required}
                disabled={props.disabled}
              />
            );

            try {
              // Verify input element exists and has correct type
              const input = screen.getByRole('textbox') as HTMLInputElement;
              expect(input).toBeInTheDocument();
              expect(input.type).toBe('text');

              // Verify input has correct name and id
              expect(input).toHaveAttribute('name', props.name);
              expect(input).toHaveAttribute('id', props.name);

              // Verify input displays current value
              expect(input.value).toBe(props.value);

              // Verify disabled state
              expect(input.disabled).toBe(props.disabled);

              // Verify required indicator
              if (props.required) {
                expect(screen.getByText('*')).toBeInTheDocument();
              }
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle onChange callback for any input value', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            initialValue: fc.string({ maxLength: 500 }),
            newValue: fc.string({ maxLength: 500 }),
          }),
          (props) => {
            // Skip if values are the same - onChange shouldn't be called if value doesn't change
            if (props.initialValue === props.newValue) {
              return;
            }

            const onChange = vi.fn();
            const { unmount } = render(
              <TextInput
                name={props.name}
                label={props.label}
                value={props.initialValue}
                onChange={onChange}
              />
            );

            try {
              const input = screen.getByRole('textbox');
              fireEvent.change(input, { target: { value: props.newValue } });

              expect(onChange).toHaveBeenCalledWith(props.newValue);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display error message for any error text', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            value: fc.string({ maxLength: 500 }),
            error: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <TextInput
                name={props.name}
                label={props.label}
                value={props.value}
                onChange={onChange}
                error={props.error}
              />
            );

            try {
              // Verify input has aria-invalid
              const input = screen.getByRole('textbox');
              expect(input).toHaveAttribute('aria-invalid', 'true');

              // Verify aria-describedby points to error
              expect(input).toHaveAttribute('aria-describedby', `${props.name}-error`);

              // Verify error element exists
              const errorElement = document.getElementById(`${props.name}-error`);
              expect(errorElement).toBeInTheDocument();
              expect(errorElement?.textContent).toBe(props.error);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display help text for any help text when no error', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            value: fc.string({ maxLength: 500 }),
            helpText: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <TextInput
                name={props.name}
                label={props.label}
                value={props.value}
                onChange={onChange}
                helpText={props.helpText}
              />
            );

            try {
              // Verify input has aria-describedby pointing to help
              const input = screen.getByRole('textbox');
              expect(input).toHaveAttribute('aria-describedby', `${props.name}-help`);

              // Verify help element exists
              const helpElement = document.getElementById(`${props.name}-help`);
              expect(helpElement).toBeInTheDocument();
              expect(helpElement?.textContent).toBe(props.helpText);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
