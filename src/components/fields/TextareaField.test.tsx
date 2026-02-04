import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextareaField } from './TextareaField';

describe('TextareaField Component', () => {
  describe('Rendering', () => {
    it('should render with label and textarea field', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display character count when maxLength is provided', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value="Hello"
          onChange={onChange}
          maxLength={100}
        />
      );

      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          helpText="Enter a detailed description"
        />
      );

      expect(screen.getByText('Enter a detailed description')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          error="Description is required"
        />
      );

      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          error="Description is required"
          helpText="Enter a detailed description"
        />
      );

      expect(screen.queryByText('Enter a detailed description')).not.toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when textarea value changes', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New description' } });

      expect(onChange).toHaveBeenCalledWith('New description');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value="Current description"
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Current description');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });

    it('should respect maxLength prop', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          maxLength={50}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(50);
    });

    it('should use custom rows prop', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          rows={8}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(8);
    });
  });

  describe('Character Count', () => {
    it('should update character count as user types', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          maxLength={100}
        />
      );

      expect(screen.getByText('0/100')).toBeInTheDocument();

      rerender(
        <TextareaField
          name="description"
          label="Description"
          value="Hello World"
          onChange={onChange}
          maxLength={100}
        />
      );

      expect(screen.getByText('11/100')).toBeInTheDocument();
    });

    it('should show warning color when approaching limit', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value={'a'.repeat(95)}
          onChange={onChange}
          maxLength={100}
        />
      );

      const charCount = screen.getByText('95/100');
      expect(charCount).toHaveClass('text-destructive');
    });

    it('should not show character count when maxLength is not provided', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value="Some text"
          onChange={onChange}
        />
      );

      expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
          error="Description is required"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'description');
      expect(screen.getByText('Description')).toHaveAttribute('for', 'description');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const onChange = vi.fn();
      render(
        <TextareaField
          name="description"
          label="Description"
          value=""
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle multiline text', () => {
      const onChange = vi.fn();
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(
        <TextareaField
          name="description"
          label="Description"
          value={multilineText}
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });

    it('should handle very long text', () => {
      const onChange = vi.fn();
      const longText = 'a'.repeat(10000);
      render(
        <TextareaField
          name="description"
          label="Description"
          value={longText}
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const onChange = vi.fn();
      const specialText = 'Special chars: <>&"\'';
      render(
        <TextareaField
          name="description"
          label="Description"
          value={specialText}
          onChange={onChange}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });
  });
});
