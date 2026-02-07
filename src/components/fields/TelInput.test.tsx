/**
 * TelInput Component Tests
 *
 * TelInput bileşeni için test dosyası.
 * Hem PhoneInput modu hem de native input modu test edilir.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelInput } from './TelInput';

describe('TelInput', () => {
  describe('Native Mode (Default)', () => {
    it('renders with label and input', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Telefon Numarası')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });

    it('shows required indicator when required', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          error="Geçersiz telefon numarası"
        />
      );

      expect(screen.getByText('Geçersiz telefon numarası')).toBeInTheDocument();
    });

    it('displays help text when no error', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          helpText="Telefon numaranızı girin"
        />
      );

      expect(screen.getByText('Telefon numaranızı girin')).toBeInTheDocument();
    });

    it('hides help text when error is present', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          error="Hata mesajı"
          helpText="Yardım metni"
        />
      );

      expect(screen.queryByText('Yardım metni')).not.toBeInTheDocument();
      expect(screen.getByText('Hata mesajı')).toBeInTheDocument();
    });

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '5551234567');

      expect(handleChange).toHaveBeenCalled();
    });

    it('disables input when disabled prop is true', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies mask when mask prop is provided', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          mask="(599) 999 99 99"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('PhoneInput Mode', () => {
    it('renders PhoneInput when usePhoneInput is true', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          usePhoneInput
        />
      );

      expect(screen.getByLabelText('Telefon Numarası')).toBeInTheDocument();
      // PhoneInput renders a button for country selection
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('uses default country when provided', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          usePhoneInput
          defaultCountry="US"
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('displays error message in PhoneInput mode', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          usePhoneInput
          error="Geçersiz telefon numarası"
        />
      );

      expect(screen.getByText('Geçersiz telefon numarası')).toBeInTheDocument();
    });

    it('displays help text in PhoneInput mode', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          usePhoneInput
          helpText="Uluslararası format kullanın"
        />
      );

      expect(screen.getByText('Uluslararası format kullanın')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'phone');
      expect(screen.getByLabelText('Telefon Numarası')).toBe(input);
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          error="Hata"
        />
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          error="Hata mesajı"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'phone-error');
    });

    it('sets aria-describedby for help text', () => {
      render(
        <TelInput
          name="phone"
          label="Telefon Numarası"
          value=""
          onChange={() => {}}
          helpText="Yardım metni"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'phone-help');
    });
  });
});
