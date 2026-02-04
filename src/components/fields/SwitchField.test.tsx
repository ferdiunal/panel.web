import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwitchField } from './SwitchField';

describe('SwitchField Component', () => {
  describe('Rendering', () => {
    it('should render with label and switch control', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not display required indicator when required prop is false', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          required={false}
        />
      );

      const asterisks = container.querySelectorAll('.text-destructive');
      expect(asterisks.length).toBe(0);
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          helpText="Enable this feature"
        />
      );

      expect(screen.getByText('Enable this feature')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error="This field is required"
          helpText="Enable this feature"
        />
      );

      expect(screen.queryByText('Enable this feature')).not.toBeInTheDocument();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Switch Behavior', () => {
    it('should call onChange when switch is toggled from false to true', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      const switchControl = screen.getByRole('switch');
      fireEvent.click(switchControl);

      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should call onChange when switch is toggled from true to false', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={true}
          onChange={onChange}
        />
      );

      const switchControl = screen.getByRole('switch');
      fireEvent.click(switchControl);

      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should reflect the current value in the switch state', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      let switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toHaveAttribute('aria-checked', 'false');

      rerender(
        <SwitchField
          name="active"
          label="Active"
          value={true}
          onChange={onChange}
        />
      );

      switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toHaveAttribute('aria-checked', 'true');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          disabled={true}
        />
      );

      const switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toBeDisabled();
    });

    it('should not be disabled when disabled prop is false', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          disabled={false}
        />
      );

      const switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).not.toBeDisabled();
    });

    it('should not call onChange when disabled and clicked', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          disabled={true}
        />
      );

      const switchControl = screen.getByRole('switch');
      fireEvent.click(switchControl);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error="This field is required"
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error when error exists', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error="This field is required"
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toHaveAttribute('aria-describedby', 'active-error');
    });

    it('should have aria-describedby pointing to help text when help text exists', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          helpText="Enable this feature"
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toHaveAttribute('aria-describedby', 'active-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toHaveAttribute('id', 'active');
      expect(screen.getByText('Active')).toHaveAttribute('for', 'active');
    });

    it('should have cursor-pointer on label', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      const label = screen.getByText('Active');
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      const onChange = vi.fn();
      render(
        <SwitchField
          name="active"
          label=""
          value={false}
          onChange={onChange}
        />
      );

      const switchControl = screen.getByRole('switch');
      expect(switchControl).toBeInTheDocument();
    });

    it('should handle very long label', () => {
      const onChange = vi.fn();
      const longLabel = 'This is a very long label that describes a complex feature that requires extensive explanation';
      render(
        <SwitchField
          name="active"
          label={longLabel}
          value={false}
          onChange={onChange}
        />
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle very long error message', () => {
      const onChange = vi.fn();
      const longError = 'This is a very long error message that provides detailed information about what went wrong and how to fix it';
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error={longError}
        />
      );

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should handle very long help text', () => {
      const onChange = vi.fn();
      const longHelp = 'This is a very long help text that provides detailed instructions on how to use this feature and what it does';
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          helpText={longHelp}
        />
      );

      expect(screen.getByText(longHelp)).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      const onChange = vi.fn();
      const specialLabel = 'Enable & Activate (Beta) - v2.0';
      render(
        <SwitchField
          name="active"
          label={specialLabel}
          value={false}
          onChange={onChange}
        />
      );

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it('should handle special characters in error message', () => {
      const onChange = vi.fn();
      const specialError = 'Error: Field & validation failed (code: 400)';
      render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error={specialError}
        />
      );

      expect(screen.getByText(specialError)).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          className="custom-class"
        />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have default flex layout classes', () => {
      const onChange = vi.fn();
      const { container } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'gap-2');
    });
  });

  describe('Multiple Toggles', () => {
    it('should handle multiple switch fields independently', () => {
      const onChange1 = vi.fn();
      const onChange2 = vi.fn();
      render(
        <>
          <SwitchField
            name="active"
            label="Active"
            value={false}
            onChange={onChange1}
          />
          <SwitchField
            name="featured"
            label="Featured"
            value={true}
            onChange={onChange2}
          />
        </>
      );

      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(2);

      fireEvent.click(switches[0]);
      expect(onChange1).toHaveBeenCalledWith(true);
      expect(onChange2).not.toHaveBeenCalled();

      fireEvent.click(switches[1]);
      expect(onChange2).toHaveBeenCalledWith(false);
    });
  });

  describe('State Updates', () => {
    it('should update when value prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      let switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toHaveAttribute('aria-checked', 'false');

      rerender(
        <SwitchField
          name="active"
          label="Active"
          value={true}
          onChange={onChange}
        />
      );

      switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toHaveAttribute('aria-checked', 'true');
    });

    it('should update when disabled prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          disabled={false}
        />
      );

      let switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).not.toBeDisabled();

      rerender(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          disabled={true}
        />
      );

      switchControl = screen.getByRole('switch') as HTMLButtonElement;
      expect(switchControl).toBeDisabled();
    });

    it('should update when error prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      expect(screen.queryByText('Error message')).not.toBeInTheDocument();

      rerender(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          error="Error message"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should update when help text prop changes', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
        />
      );

      expect(screen.queryByText('Help text')).not.toBeInTheDocument();

      rerender(
        <SwitchField
          name="active"
          label="Active"
          value={false}
          onChange={onChange}
          helpText="Help text"
        />
      );

      expect(screen.getByText('Help text')).toBeInTheDocument();
    });
  });
});
