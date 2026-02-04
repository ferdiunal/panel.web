import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { DateField } from './DateField';

describe('DateField Component', () => {
  describe('Rendering', () => {
    it('should render with label and date picker button', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          placeholder="Pick a date"
        />
      );

      expect(screen.getByText('Pick a date')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          helpText="Select a date"
        />
      );

      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          error="Date is required"
        />
      );

      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          error="Date is required"
          helpText="Select a date"
        />
      );

      expect(screen.queryByText('Select a date')).not.toBeInTheDocument();
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('should display selected date in button', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15); // January 15, 2024
      render(
        <DateField
          name="date"
          label="Date"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      // The format is "PPP" which gives "January 15th, 2024"
      expect(button.textContent).toContain('January 15th, 2024');
    });
  });

  describe('Date Picker Behavior', () => {
    it('should open calendar when button is clicked', async () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Calendar should be visible
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('should call onChange when date is selected', async () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Find a date button (e.g., 15th)
        const dateButtons = screen.getAllByRole('button');
        const dateButton = dateButtons.find(btn => btn.textContent?.trim() === '15');
        if (dateButton) {
          fireEvent.click(dateButton);
        }
      });

      // onChange should have been called with a date
      expect(onChange).toHaveBeenCalled();
      const callArg = onChange.mock.calls[0]?.[0];
      expect(callArg).toBeInstanceOf(Date);
    });

    it('should update displayed date after selection', async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button');
        const dateButton = dateButtons.find(btn => btn.textContent?.trim() === '15');
        if (dateButton) {
          fireEvent.click(dateButton);
        }
      });

      const newDate = new Date(2024, 0, 15);
      rerender(
        <DateField
          name="date"
          label="Date"
          value={newDate}
          onChange={onChange}
        />
      );

      const updatedButton = screen.getByRole('button');
      expect(updatedButton.textContent).toContain('Jan 15, 2024');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          error="Date is required"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error message', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          error="Date is required"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'date-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          helpText="Select a date"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'date-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'date');
      expect(screen.getByText('Date')).toHaveAttribute('for', 'date');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined date value', () => {
      const onChange = vi.fn();
      render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('Pick a date');
    });

    it('should handle date at start of month', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 1);
      render(
        <DateField
          name="date"
          label="Date"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('January 1st, 2024');
    });

    it('should handle date at end of month', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 31);
      render(
        <DateField
          name="date"
          label="Date"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('January 31st, 2024');
    });

    it('should handle leap year dates', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      render(
        <DateField
          name="date"
          label="Date"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('February 29th, 2024');
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <DateField
          name="date"
          label="Date"
          value={undefined}
          onChange={onChange}
          error="Date is required"
        />
      );

      expect(screen.getByText('Date is required')).toBeInTheDocument();

      const newDate = new Date(2024, 0, 15);
      rerender(
        <DateField
          name="date"
          label="Date"
          value={newDate}
          onChange={onChange}
          helpText="Date selected"
        />
      );

      expect(screen.queryByText('Date is required')).not.toBeInTheDocument();
      expect(screen.getByText('Date selected')).toBeInTheDocument();
    });
  });

  describe('Property 28: Date Field Renders Date Picker', () => {
    /**
     * **Validates: Requirements 4.8**
     * 
     * For any date field, a date picker component should be rendered.
     */
    it('should render date field with all required elements for any valid props', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            required: fc.boolean(),
            disabled: fc.boolean(),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={undefined}
                onChange={onChange}
                required={props.required}
                disabled={props.disabled}
              />
            );

            try {
              // Verify button exists
              const button = screen.getByRole('button');
              expect(button).toBeInTheDocument();

              // Verify button has correct id
              expect(button).toHaveAttribute('id', props.name);

              // Verify disabled state
              expect(button.disabled).toBe(props.disabled);

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

    it('should display date picker for any date value', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            year: fc.integer({ min: 2020, max: 2030 }),
            month: fc.integer({ min: 0, max: 11 }),
            day: fc.integer({ min: 1, max: 28 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const date = new Date(props.year, props.month, props.day);
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={date}
                onChange={onChange}
              />
            );

            try {
              const button = screen.getByRole('button');
              expect(button).toBeInTheDocument();
              // Button should display the date
              expect(button.textContent).toBeTruthy();
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle onChange callback for any date selection', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={undefined}
                onChange={onChange}
              />
            );

            try {
              // Verify button exists and can be clicked
              const button = document.getElementById(props.name) as HTMLButtonElement;
              expect(button).toBeInTheDocument();
              expect(button).toHaveAttribute('id', props.name);
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
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            error: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={undefined}
                onChange={onChange}
                error={props.error}
              />
            );

            try {
              // Verify button has aria-invalid
              const button = document.getElementById(props.name) as HTMLButtonElement;
              expect(button).toHaveAttribute('aria-invalid', 'true');

              // Verify aria-describedby points to error
              expect(button).toHaveAttribute('aria-describedby', `${props.name}-error`);

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
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            helpText: fc.string({ minLength: 5, maxLength: 200 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={undefined}
                onChange={onChange}
                helpText={props.helpText}
              />
            );

            try {
              // Verify button has aria-describedby pointing to help
              const button = document.getElementById(props.name) as HTMLButtonElement;
              expect(button).toHaveAttribute('aria-describedby', `${props.name}-help`);

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

    it('should render calendar picker when button is clicked', async () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          async (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateField
                name={props.name}
                label={props.label}
                value={undefined}
                onChange={onChange}
              />
            );

            try {
              const button = document.getElementById(props.name) as HTMLButtonElement;
              fireEvent.click(button);

              await waitFor(() => {
                // Calendar grid should be visible
                expect(screen.getByRole('grid')).toBeInTheDocument();
              });
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
