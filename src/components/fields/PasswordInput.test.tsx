import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput Component', () => {
  describe('Rendering', () => {
    it('should render with label and password input field', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
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
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          placeholder="Enter your password"
        />
      );

      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          helpText="Password must be at least 8 characters"
        />
      );

      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          error="Password is required"
        />
      );

      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should not display help text when error is present', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          error="Password is required"
          helpText="Password must be at least 8 characters"
        />
      );

      expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should render visibility toggle button', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password');
      fireEvent.change(input, { target: { value: 'SecurePassword123' } });

      expect(onChange).toHaveBeenCalledWith('SecurePassword123');
    });

    it('should display the current value', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value="SecurePassword123"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe('SecurePassword123');
    });

    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          disabled={true}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should not be disabled when disabled prop is false', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          disabled={false}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  describe('Password Type', () => {
    it('should render as password input type by default', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should accept special characters in password', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value="P@ssw0rd!#$%^&*()"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe('P@ssw0rd!#$%^&*()');
    });

    it('should accept very long passwords', () => {
      const onChange = vi.fn();
      const longPassword = 'a'.repeat(1000);
      render(
        <PasswordInput
          name="password"
          label="Password"
          value={longPassword}
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe(longPassword);
    });
  });

  describe('Visibility Toggle', () => {
    it('should toggle password visibility when button is clicked', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value="SecurePassword123"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially should be password type
      expect(input.type).toBe('password');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(input.type).toBe('text');

      // Click to hide password
      fireEvent.click(toggleButton);
      expect(input.type).toBe('password');
    });

    it('should update button label when toggling visibility', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value="SecurePassword123"
          onChange={onChange}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially should show "Show password"
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

      // Click to hide password
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });

    it('should disable toggle button when input is disabled', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          disabled={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeDisabled();
    });

    it('should not disable toggle button when input is enabled', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          disabled={false}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).not.toBeDisabled();
    });

    it('should show password text when visibility is toggled', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value="MyPassword123"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password is hidden
      expect(input.type).toBe('password');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(input.type).toBe('text');
      expect(input.value).toBe('MyPassword123');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          error="Password is required"
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-invalid false when no error', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have aria-describedby pointing to error message', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          error="Password is required"
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-describedby', 'password-error');
    });

    it('should have aria-describedby pointing to help text', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          helpText="Password must be at least 8 characters"
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-describedby', 'password-help');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('id', 'password');
      expect(screen.getByText('Password')).toHaveAttribute('for', 'password');
    });

    it('should have aria-label on toggle button', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-label');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const onChange = vi.fn();
      render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle error and help text updates', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <PasswordInput
          name="password"
          label="Password"
          value=""
          onChange={onChange}
          error="Password is required"
        />
      );

      expect(screen.getByText('Password is required')).toBeInTheDocument();

      rerender(
        <PasswordInput
          name="password"
          label="Password"
          value="SecurePassword123"
          onChange={onChange}
          helpText="Password is strong"
        />
      );

      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      expect(screen.getByText('Password is strong')).toBeInTheDocument();
    });

    it('should maintain visibility state across re-renders', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <PasswordInput
          name="password"
          label="Password"
          value="Password123"
          onChange={onChange}
        />
      );

      const input = screen.getByLabelText('Password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Toggle to show password
      fireEvent.click(toggleButton);
      expect(input.type).toBe('text');

      // Re-render with new value
      rerender(
        <PasswordInput
          name="password"
          label="Password"
          value="NewPassword456"
          onChange={onChange}
        />
      );

      // Visibility state should be maintained
      expect(input.type).toBe('text');
    });
  });
});
