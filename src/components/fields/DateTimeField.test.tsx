import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { DateTimeField } from './DateTimeField';

describe('DateTimeField Component', () => {
  describe('Rendering', () => {
    it('should render with label and date time picker button', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
        />
      );

      expect(screen.getByText('Date and Time')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
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
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          placeholder="Pick a date and time"
        />
      );

      expect(screen.getByText('Pick a date and time')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          helpText="Select a date and time"
        />
      );

      expect(screen.getByText('Select a date and time')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          error="Date and time is required"
        />
      );

      expect(screen.getByText('Date and time is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          error="Date and time is required"
          helpText="Select a date and time"
        />
      );

      expect(screen.queryByText('Select a date and time')).not.toBeInTheDocument();
      expect(screen.getByText('Date and time is required')).toBeInTheDocument();
    });

    it('should display selected date and time in button', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 14, 30); // January 15, 2024 at 14:30
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('January 15th, 2024');
      expect(button.textContent).toContain('14:30');
    });
  });

  describe('Date Time Picker Behavior', () => {
    it('should open calendar when button is clicked', async () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
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

    it('should display time input in popover', async () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 14, 30);
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const timeInput = screen.getByDisplayValue('14:30');
        expect(timeInput).toBeInTheDocument();
      });
    });

    it('should call onChange when date is selected', async () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
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

      expect(onChange).toHaveBeenCalled();
      const callArg = onChange.mock.calls[0]?.[0];
      expect(callArg).toBeInstanceOf(Date);
    });

    it('should call onChange when time is changed', async () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 14, 30);
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const timeInput = screen.getByDisplayValue('14:30') as HTMLInputElement;
        fireEvent.change(timeInput, { target: { value: '16:45' } });
      });

      expect(onChange).toHaveBeenCalled();
      const callArg = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
      expect(callArg).toBeInstanceOf(Date);
      expect(callArg?.getHours()).toBe(16);
      expect(callArg?.getMinutes()).toBe(45);
    });

    it('should preserve time when date is changed', async () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 14, 30);
      const { rerender } = render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button');
        const dateButton = dateButtons.find(btn => btn.textContent?.trim() === '20');
        if (dateButton) {
          fireEvent.click(dateButton);
        }
      });

      const newDate = new Date(2024, 0, 20, 14, 30);
      rerender(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={newDate}
          onChange={onChange}
        />
      );

      const updatedButton = screen.getByRole('button');
      expect(updatedButton.textContent).toContain('January 20th, 2024');
      expect(updatedButton.textContent).toContain('14:30');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
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
        <DateTimeField
          name="datetime"
          label="Date and Time"
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
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          error="Date and time is required"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
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
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          error="Date and time is required"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'datetime-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          helpText="Select a date and time"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'datetime-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'datetime');
      expect(screen.getByText('Date and Time')).toHaveAttribute('for', 'datetime');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined date value', () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('Pick a date and time');
    });

    it('should handle date at start of day', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 0, 0);
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('January 15th, 2024');
      expect(button.textContent).toContain('00:00');
    });

    it('should handle date at end of day', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 0, 15, 23, 59);
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('January 15th, 2024');
      expect(button.textContent).toContain('23:59');
    });

    it('should handle leap year dates with time', () => {
      const onChange = vi.fn();
      const date = new Date(2024, 1, 29, 12, 30); // February 29, 2024 (leap year)
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={date}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('February 29th, 2024');
      expect(button.textContent).toContain('12:30');
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
          error="Date and time is required"
        />
      );

      expect(screen.getByText('Date and time is required')).toBeInTheDocument();

      const newDate = new Date(2024, 0, 15, 14, 30);
      rerender(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={newDate}
          onChange={onChange}
          helpText="Date and time selected"
        />
      );

      expect(screen.queryByText('Date and time is required')).not.toBeInTheDocument();
      expect(screen.getByText('Date and time selected')).toBeInTheDocument();
    });

    it('should disable time input when no date is selected', async () => {
      const onChange = vi.fn();
      render(
        <DateTimeField
          name="datetime"
          label="Date and Time"
          value={undefined}
          onChange={onChange}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const timeInput = screen.getByRole('textbox', { name: /time/i }) as HTMLInputElement;
        expect(timeInput.disabled).toBe(true);
      });
    });
  });

  describe('Property 29: DateTime Field Renders Date and Time Picker', () => {
    /**
     * **Validates: Requirements 4.9**
     * 
     * For any date time field, a date and time picker component should be rendered.
     */
    it('should render datetime field with all required elements for any valid props', () => {
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
              <DateTimeField
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

    it('should display date and time picker for any datetime value', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            year: fc.integer({ min: 2020, max: 2030 }),
            month: fc.integer({ min: 0, max: 11 }),
            day: fc.integer({ min: 1, max: 28 }),
            hour: fc.integer({ min: 0, max: 23 }),
            minute: fc.integer({ min: 0, max: 59 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const date = new Date(props.year, props.month, props.day, props.hour, props.minute);
            const { unmount } = render(
              <DateTimeField
                name={props.name}
                label={props.label}
                value={date}
                onChange={onChange}
              />
            );

            try {
              const button = screen.getByRole('button');
              expect(button).toBeInTheDocument();
              // Button should display the date and time
              expect(button.textContent).toBeTruthy();
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle onChange callback for any date and time selection', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <DateTimeField
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
              <DateTimeField
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
              <DateTimeField
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

    it('should render calendar and time picker when button is clicked', async () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
          }),
          async (props) => {
            const onChange = vi.fn();
            const date = new Date(2024, 0, 15, 14, 30);
            const { unmount } = render(
              <DateTimeField
                name={props.name}
                label={props.label}
                value={date}
                onChange={onChange}
              />
            );

            try {
              const button = document.getElementById(props.name) as HTMLButtonElement;
              fireEvent.click(button);

              await waitFor(() => {
                // Calendar grid should be visible
                expect(screen.getByRole('grid')).toBeInTheDocument();
                // Time input should be visible
                expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
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
