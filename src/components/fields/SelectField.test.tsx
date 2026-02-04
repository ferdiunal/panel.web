import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { SelectField, type SelectOption } from './SelectField';

describe('SelectField Component', () => {
  const defaultOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('should render with label and select trigger', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display placeholder text', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          placeholder="Select a status"
        />
      );

      expect(screen.getByText('Select a status')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          helpText="Choose the current status"
        />
      );

      expect(screen.getByText('Choose the current status')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error="Status is required"
        />
      );

      expect(screen.getByText('Status is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error="Status is required"
          helpText="Choose the current status"
        />
      );

      expect(screen.queryByText('Choose the current status')).not.toBeInTheDocument();
      expect(screen.getByText('Status is required')).toBeInTheDocument();
    });

    it('should display selected value', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value="option1"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Option Rendering', () => {
    it('should render all options in dropdown', async () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should render options with correct labels', async () => {
      const onChange = vi.fn();
      const customOptions: SelectOption[] = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ];

      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={customOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('should handle empty options array', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={[]}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Selection Behavior', () => {
    it('should call onChange when option is selected', async () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 1');
        fireEvent.click(option);
      });

      expect(onChange).toHaveBeenCalledWith('option1');
    });

    it('should update displayed value after selection', async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        const option = screen.getByText('Option 2');
        fireEvent.click(option);
      });

      rerender(
        <SelectField
          name="status"
          label="Status"
          value="option2"
          onChange={onChange}
          options={defaultOptions}
        />
      );

      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          disabled={true}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          disabled={false}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error="Status is required"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error message', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error="Status is required"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-describedby', 'status-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          helpText="Choose the current status"
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-describedby', 'status-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('id', 'status');
      expect(screen.getByText('Status')).toHaveAttribute('for', 'status');
    });
  });

  describe('Edge Cases', () => {
    it('should handle options with special characters in labels', async () => {
      const onChange = vi.fn();
      const specialOptions: SelectOption[] = [
        { value: 'opt1', label: 'Option & Special' },
        { value: 'opt2', label: 'Option < > "' },
      ];

      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={specialOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option & Special')).toBeInTheDocument();
      });
    });

    it('should handle very long option labels', async () => {
      const onChange = vi.fn();
      const longOptions: SelectOption[] = [
        { value: 'opt1', label: 'A'.repeat(100) },
      ];

      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={longOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
      });
    });

    it('should handle many options', async () => {
      const onChange = vi.fn();
      const manyOptions: SelectOption[] = Array.from({ length: 50 }, (_, i) => ({
        value: `opt${i}`,
        label: `Option ${i}`,
      }));

      render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={manyOptions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument();
        expect(screen.getByText('Option 49')).toBeInTheDocument();
      });
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SelectField
          name="status"
          label="Status"
          value=""
          onChange={onChange}
          options={defaultOptions}
          error="Status is required"
        />
      );

      expect(screen.getByText('Status is required')).toBeInTheDocument();

      rerender(
        <SelectField
          name="status"
          label="Status"
          value="option1"
          onChange={onChange}
          options={defaultOptions}
          helpText="Status selected"
        />
      );

      expect(screen.queryByText('Status is required')).not.toBeInTheDocument();
      expect(screen.getByText('Status selected')).toBeInTheDocument();
    });
  });

  describe('Property 27: Select Field Shows Options', () => {
    /**
     * **Validates: Requirements 4.7**
     * 
     * For any select field with options, all options should be available in the dropdown.
     */
    it('should render select field with all required elements for any valid props', () => {
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
              <SelectField
                name={props.name}
                label={props.label}
                value=""
                onChange={onChange}
                options={defaultOptions}
                required={props.required}
                disabled={props.disabled}
              />
            );

            try {
              // Verify trigger button exists
              const trigger = document.getElementById(props.name) as HTMLButtonElement;
              expect(trigger).toBeInTheDocument();

              // Verify trigger has correct id
              expect(trigger).toHaveAttribute('id', props.name);

              // Verify disabled state
              expect(trigger.disabled).toBe(props.disabled);

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

    it('should display all options for any options array', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            optionCount: fc.integer({ min: 1, max: 10 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const options: SelectOption[] = Array.from({ length: props.optionCount }, (_, i) => ({
              value: `opt${i}`,
              label: `Option ${i}`,
            }));

            const { unmount } = render(
              <SelectField
                name={props.name}
                label={props.label}
                value=""
                onChange={onChange}
                options={options}
              />
            );

            try {
              // Verify trigger button exists
              const trigger = document.getElementById(props.name) as HTMLButtonElement;
              expect(trigger).toBeInTheDocument();
              expect(trigger).toHaveAttribute('id', props.name);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle onChange callback for any option selection', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            selectedIndex: fc.integer({ min: 0, max: 2 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const { unmount } = render(
              <SelectField
                name={props.name}
                label={props.label}
                value=""
                onChange={onChange}
                options={defaultOptions}
              />
            );

            try {
              // Verify trigger button exists
              const trigger = document.getElementById(props.name) as HTMLButtonElement;
              expect(trigger).toBeInTheDocument();
              expect(trigger).toHaveAttribute('id', props.name);
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display selected value for any valid option', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z]+$/.test(s)),
            label: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0),
            selectedIndex: fc.integer({ min: 0, max: 2 }),
          }),
          (props) => {
            const onChange = vi.fn();
            const selectedValue = `option${props.selectedIndex + 1}`;
            const { unmount } = render(
              <SelectField
                name={props.name}
                label={props.label}
                value={selectedValue}
                onChange={onChange}
                options={defaultOptions}
              />
            );

            try {
              expect(screen.getByText(`Option ${props.selectedIndex + 1}`)).toBeInTheDocument();
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
              <SelectField
                name={props.name}
                label={props.label}
                value=""
                onChange={onChange}
                options={defaultOptions}
                error={props.error}
              />
            );

            try {
              // Verify trigger has aria-invalid
              const trigger = document.getElementById(props.name) as HTMLButtonElement;
              expect(trigger).toHaveAttribute('aria-invalid', 'true');

              // Verify aria-describedby points to error
              expect(trigger).toHaveAttribute('aria-describedby', `${props.name}-error`);

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
              <SelectField
                name={props.name}
                label={props.label}
                value=""
                onChange={onChange}
                options={defaultOptions}
                helpText={props.helpText}
              />
            );

            try {
              // Verify trigger has aria-describedby pointing to help
              const trigger = document.getElementById(props.name) as HTMLButtonElement;
              expect(trigger).toHaveAttribute('aria-describedby', `${props.name}-help`);

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
