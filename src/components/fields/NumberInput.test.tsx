import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './NumberInput';

describe('NumberInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and number input field', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display increment and decrement buttons', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      expect(screen.getByRole('button', { name: /increase/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrease/i })).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          helpText="Enter quantity between 1 and 100"
        />
      );

      expect(screen.getByText('Enter quantity between 1 and 100')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          error="Quantity is required"
        />
      );

      expect(screen.getByText('Quantity is required')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '5' } });

      expect(onChange).toHaveBeenCalledWith('5');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={10}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.value).toBe('10');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          disabled={true}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('Increment/Decrement Buttons', () => {
    it('should increment value when increment button is clicked', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={5}
          onChange={onChange}
          step={1}
        />
      );

      const incrementButton = screen.getByRole('button', { name: /increase/i });
      fireEvent.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('should decrement value when decrement button is clicked', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={5}
          onChange={onChange}
          step={1}
        />
      );

      const decrementButton = screen.getByRole('button', { name: /decrease/i });
      fireEvent.click(decrementButton);

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('should respect max value when incrementing', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={10}
          onChange={onChange}
          max={10}
          step={1}
        />
      );

      const incrementButton = screen.getByRole('button', { name: /increase/i });
      expect(incrementButton).toBeDisabled();
    });

    it('should respect min value when decrementing', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          min={0}
          step={1}
        />
      );

      const decrementButton = screen.getByRole('button', { name: /decrease/i });
      expect(decrementButton).toBeDisabled();
    });

    it('should use custom step value', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          step={5}
        />
      );

      const incrementButton = screen.getByRole('button', { name: /increase/i });
      fireEvent.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
          error="Quantity is required"
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('id', 'quantity');
      expect(screen.getByText('Quantity')).toHaveAttribute('for', 'quantity');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value={0}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.value).toBe('0');
    });

    it('should handle negative values', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="temperature"
          label="Temperature"
          value={-5}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.value).toBe('-5');
    });

    it('should handle decimal values', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="price"
          label="Price"
          value={19.99}
          onChange={onChange}
          step={0.01}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.value).toBe('19.99');
    });

    it('should handle string values', () => {
      const onChange = vi.fn();
      render(
        <NumberInput
          name="quantity"
          label="Quantity"
          value="42"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(input.value).toBe('42');
    });
  });
});
