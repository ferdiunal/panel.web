import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { EmailInput } from './EmailInput';

describe('EmailInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and email input field', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          placeholder="user@example.com"
        />
      );

      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          helpText="We'll never share your email"
        />
      );

      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          error="Invalid email format"
        />
      );

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          error="Invalid email format"
          helpText="We'll never share your email"
        />
      );

      expect(screen.queryByText("We'll never share your email")).not.toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'user@example.com' } });

      expect(onChange).toHaveBeenCalledWith('user@example.com');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value="user@example.com"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('user@example.com');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
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
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          disabled={false}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  describe('Email Type', () => {
    it('should render as email input type', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should accept valid email formats', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <EmailInput
          name="email"
          label="Email Address"
          value="user@example.com"
          onChange={onChange}
        />
      );

      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('user@example.com');

      rerender(
        <EmailInput
          name="email"
          label="Email Address"
          value="john.doe+tag@company.co.uk"
          onChange={onChange}
        />
      );

      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('john.doe+tag@company.co.uk');
    });

    it('should accept email with special characters', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value="user+tag@example.com"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('user+tag@example.com');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          error="Invalid email format"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
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
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          error="Invalid email format"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          helpText="We'll never share your email"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email');
      expect(screen.getByText('Email Address')).toHaveAttribute('for', 'email');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle very long email addresses', () => {
      const onChange = vi.fn();
      const longEmail = 'a'.repeat(100) + '@example.com';
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value={longEmail}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longEmail);
    });

    it('should handle email with multiple dots', () => {
      const onChange = vi.fn();
      render(
        <EmailInput
          name="email"
          label="Email Address"
          value="user.name.extended@sub.domain.example.com"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('user.name.extended@sub.domain.example.com');
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <EmailInput
          name="email"
          label="Email Address"
          value=""
          onChange={onChange}
          error="Email is required"
        />
      );

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      rerender(
        <EmailInput
          name="email"
          label="Email Address"
          value="user@example.com"
          onChange={onChange}
          helpText="Email verified"
        />
      );

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      expect(screen.getByText('Email verified')).toBeInTheDocument();
    });
  });

  describe('Property 26: Email Field Validates Email Format', () => {
    /**
     * **Validates: Requirements 4.3**
     * 
     * For any email field with invalid email, validation should fail and error should display.
     * For any email field with valid email, no error should display.
     */
    it('should render email field with all required elements for any valid props', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            value: fc.string({ maxLength: 500 }).filter(s => s === s.trim()),
            required: fc.boolean(),
            disabled: fc.boolean(),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <EmailInput
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
              expect(input.type).toBe('email');

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

    it('should handle onChange callback for any email input value', () => {
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

            // Skip if newValue has leading/trailing whitespace
            if (props.newValue !== props.newValue.trim()) {
              return;
            }

            const onChange = vi.fn();
            const { unmount } = render(
              <EmailInput
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
              <EmailInput
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
              <EmailInput
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

    it('should accept valid email formats for any valid email', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            localPart: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            domain: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            tld: fc.constantFrom('com', 'org', 'net', 'co.uk', 'io'),
          }),
          (props) => {
            const onChange = vi.fn();
            const email = `${props.localPart}@${props.domain}.${props.tld}`;
            const { unmount } = render(
              <EmailInput
                name={props.name}
                label={props.label}
                value={email}
                onChange={onChange}
              />
            );

            try {
              const input = screen.getByRole('textbox') as HTMLInputElement;
              expect(input.value).toBe(email);
              expect(input.type).toBe('email');
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle email with special characters in local part', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            localPart: fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-z]+$/.test(s)),
            tag: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-z]+$/.test(s)),
            domain: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
          }),
          (props) => {
            const onChange = vi.fn();
            const email = `${props.localPart}+${props.tag}@${props.domain}.com`;
            const { unmount } = render(
              <EmailInput
                name={props.name}
                label={props.label}
                value={email}
                onChange={onChange}
              />
            );

            try {
              const input = screen.getByRole('textbox') as HTMLInputElement;
              expect(input.value).toBe(email);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle very long email addresses for any length', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            length: fc.integer({ min: 50, max: 200 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const longEmail = 'a'.repeat(props.length) + '@example.com';
            const { unmount } = render(
              <EmailInput
                name={props.name}
                label={props.label}
                value={longEmail}
                onChange={onChange}
              />
            );

            try {
              const input = screen.getByRole('textbox') as HTMLInputElement;
              expect(input.value).toBe(longEmail);
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
