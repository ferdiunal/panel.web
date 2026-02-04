import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { URLInput } from './URLInput';

describe('URLInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and URL input field', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByText('Website')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /website/i })).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
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
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          placeholder="https://example.com"
        />
      );

      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          helpText="Enter a valid URL starting with http:// or https://"
        />
      );

      expect(screen.getByText('Enter a valid URL starting with http:// or https://')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          error="Invalid URL format"
        />
      );

      expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          error="Invalid URL format"
          helpText="Enter a valid URL"
        />
      );

      expect(screen.queryByText('Enter a valid URL')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid URL format')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'https://example.com' } });

      expect(onChange).toHaveBeenCalledWith('https://example.com');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value="https://example.com"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('https://example.com');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
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
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          disabled={false}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  describe('URL Type', () => {
    it('should render as URL input type', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('url');
    });

    it('should accept valid URLs', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <URLInput
          name="website"
          label="Website"
          value="https://example.com"
          onChange={onChange}
        />
      );

      let input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('https://example.com');

      rerender(
        <URLInput
          name="website"
          label="Website"
          value="http://subdomain.example.co.uk/path?query=value"
          onChange={onChange}
        />
      );

      input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('http://subdomain.example.co.uk/path?query=value');
    });

    it('should accept URLs with ports', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value="https://example.com:8080"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('https://example.com:8080');
    });

    it('should accept URLs with authentication', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value="https://user:pass@example.com"
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('https://user:pass@example.com');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          error="Invalid URL format"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
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
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          error="Invalid URL format"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'website-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          helpText="Enter a valid URL"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'website-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'website');
      expect(screen.getByText('Website')).toHaveAttribute('for', 'website');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const onChange = vi.fn();
      render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle very long URLs', () => {
      const onChange = vi.fn();
      const longURL = 'https://example.com/' + 'a'.repeat(500);
      render(
        <URLInput
          name="website"
          label="Website"
          value={longURL}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longURL);
    });

    it('should handle URLs with query parameters', () => {
      const onChange = vi.fn();
      const urlWithParams = 'https://example.com/path?param1=value1&param2=value2';
      render(
        <URLInput
          name="website"
          label="Website"
          value={urlWithParams}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(urlWithParams);
    });

    it('should handle URLs with fragments', () => {
      const onChange = vi.fn();
      const urlWithFragment = 'https://example.com/path#section';
      render(
        <URLInput
          name="website"
          label="Website"
          value={urlWithFragment}
          onChange={onChange}
        />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(urlWithFragment);
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <URLInput
          name="website"
          label="Website"
          value=""
          onChange={onChange}
          error="URL is required"
        />
      );

      expect(screen.getByText('URL is required')).toBeInTheDocument();

      rerender(
        <URLInput
          name="website"
          label="Website"
          value="https://example.com"
          onChange={onChange}
          helpText="URL is valid"
        />
      );

      expect(screen.queryByText('URL is required')).not.toBeInTheDocument();
      expect(screen.getByText('URL is valid')).toBeInTheDocument();
    });
  });
});
