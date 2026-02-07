/**
 * CheckboxField Component Tests
 *
 * CheckboxField bileşeni için test dosyası.
 * Hem tek checkbox hem de checkbox grubu modu test edilir.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckboxField } from './CheckboxField';

describe('CheckboxField', () => {
  describe('Single Checkbox Mode', () => {
    it('renders with label', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşullarını kabul ediyorum"
          checked={false}
          onCheckedChange={() => {}}
        />
      );

      expect(screen.getByText('Kullanım koşullarını kabul ediyorum')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          error="Bu alanı işaretlemelisiniz"
        />
      );

      expect(screen.getByText('Bu alanı işaretlemelisiniz')).toBeInTheDocument();
    });

    it('displays help text when no error', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          helpText="Devam etmek için kabul edin"
        />
      );

      expect(screen.getByText('Devam etmek için kabul edin')).toBeInTheDocument();
    });

    it('calls onCheckedChange when clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={handleChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('disables checkbox when disabled prop is true', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });

  describe('Checkbox Group Mode', () => {
    const options = [
      { value: 'sports', label: 'Spor' },
      { value: 'music', label: 'Müzik' },
      { value: 'tech', label: 'Teknoloji' },
    ];

    it('renders all options', () => {
      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={options}
          value={[]}
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Spor')).toBeInTheDocument();
      expect(screen.getByText('Müzik')).toBeInTheDocument();
      expect(screen.getByText('Teknoloji')).toBeInTheDocument();
    });

    it('checks selected options', () => {
      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={options}
          value={['sports', 'tech']}
          onChange={() => {}}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // sports
      expect(checkboxes[1]).not.toBeChecked(); // music
      expect(checkboxes[2]).toBeChecked(); // tech
    });

    it('adds value when checkbox is checked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={options}
          value={['sports']}
          onChange={handleChange}
        />
      );

      const musicCheckbox = screen.getByLabelText('Müzik');
      await user.click(musicCheckbox);

      expect(handleChange).toHaveBeenCalledWith(['sports', 'music']);
    });

    it('removes value when checkbox is unchecked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={options}
          value={['sports', 'music']}
          onChange={handleChange}
        />
      );

      const sportsCheckbox = screen.getByLabelText('Spor');
      await user.click(sportsCheckbox);

      expect(handleChange).toHaveBeenCalledWith(['music']);
    });

    it('disables specific options', () => {
      const optionsWithDisabled = [
        { value: 'sports', label: 'Spor' },
        { value: 'music', label: 'Müzik', disabled: true },
        { value: 'tech', label: 'Teknoloji' },
      ];

      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={optionsWithDisabled}
          value={[]}
          onChange={() => {}}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeDisabled();
      expect(checkboxes[1]).toBeDisabled();
      expect(checkboxes[2]).not.toBeDisabled();
    });

    it('displays error message in group mode', () => {
      render(
        <CheckboxField
          name="interests"
          label="İlgi Alanları"
          options={options}
          value={[]}
          onChange={() => {}}
          error="En az bir seçenek seçmelisiniz"
        />
      );

      expect(screen.getByText('En az bir seçenek seçmelisiniz')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-invalid when error is present', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          error="Hata"
        />
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          error="Hata mesajı"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error');
    });

    it('sets aria-describedby for help text', () => {
      render(
        <CheckboxField
          name="terms"
          label="Kullanım koşulları"
          checked={false}
          onCheckedChange={() => {}}
          helpText="Yardım metni"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-help');
    });
  });
});
