/**
 * TimeField Component Tests
 *
 * TimeField bileşeni için test dosyası.
 * Hem dialog modu hem de native input modu test edilir.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeField } from './TimeField';

describe('TimeField', () => {
  describe('Dialog Mode (Default)', () => {
    it('renders with label and button', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Başlangıç Saati')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays current time value', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value="14:30"
          onChange={() => {}}
        />
      );

      expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('displays placeholder when no value', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          placeholder="Saat seçin"
        />
      );

      expect(screen.getByText('Saat seçin')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          error="Geçersiz saat"
        />
      );

      expect(screen.getByText('Geçersiz saat')).toBeInTheDocument();
    });

    it('displays help text when no error', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          helpText="Çalışma saatinizi girin"
        />
      );

      expect(screen.getByText('Çalışma saatinizi girin')).toBeInTheDocument();
    });

    it('hides help text when error is present', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          error="Hata mesajı"
          helpText="Yardım metni"
        />
      );

      expect(screen.queryByText('Yardım metni')).not.toBeInTheDocument();
      expect(screen.getByText('Hata mesajı')).toBeInTheDocument();
    });

    it('opens popover when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Popover içindeki "Tamam" butonunu kontrol et
      expect(screen.getByText('Tamam')).toBeInTheDocument();
    });

    it('calls onChange when Done button is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={handleChange}
        />
      );

      // Popover'ı aç
      const button = screen.getByRole('button', { name: /Başlangıç Saati/i });
      await user.click(button);

      // Time input'u bul ve değer gir
      const timeInput = screen.getByLabelText('Saat');
      await user.clear(timeInput);
      await user.type(timeInput, '14:30');

      // Tamam butonuna tıkla
      const doneButton = screen.getByText('Tamam');
      await user.click(doneButton);

      expect(handleChange).toHaveBeenCalledWith('14:30');
    });

    it('disables button when disabled prop is true', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Native Mode', () => {
    it('renders native time input when useNative is true', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('displays current time value in native mode', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value="14:30"
          onChange={() => {}}
          useNative
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati') as HTMLInputElement;
      expect(input.value).toBe('14:30');
    });

    it('calls onChange when native input value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={handleChange}
          useNative
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati');
      await user.clear(input);
      await user.type(input, '14:30');

      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message in native mode', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          error="Geçersiz saat"
        />
      );

      expect(screen.getByText('Geçersiz saat')).toBeInTheDocument();
    });

    it('displays help text in native mode', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          helpText="Çalışma saatinizi girin"
        />
      );

      expect(screen.getByText('Çalışma saatinizi girin')).toBeInTheDocument();
    });

    it('disables native input when disabled prop is true', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          disabled
        />
      );

      expect(screen.getByLabelText('Başlangıç Saati')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input in native mode', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati');
      expect(input).toHaveAttribute('id', 'start_time');
    });

    it('sets aria-invalid when error is present', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          error="Hata"
        />
      );

      expect(screen.getByLabelText('Başlangıç Saati')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          error="Hata mesajı"
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati');
      expect(input).toHaveAttribute('aria-describedby', 'start_time-error');
    });

    it('sets aria-describedby for help text', () => {
      render(
        <TimeField
          name="start_time"
          label="Başlangıç Saati"
          value=""
          onChange={() => {}}
          useNative
          helpText="Yardım metni"
        />
      );

      const input = screen.getByLabelText('Başlangıç Saati');
      expect(input).toHaveAttribute('aria-describedby', 'start_time-help');
    });
  });
});
