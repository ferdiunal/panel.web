/**
 * RadioGroupField Component Tests
 *
 * RadioGroupField bileşeni için test dosyası.
 * Radio button grubu seçimi test edilir.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroupField } from './RadioGroupField';

describe('RadioGroupField', () => {
  const options = [
    { value: 'male', label: 'Erkek' },
    { value: 'female', label: 'Kadın' },
    { value: 'other', label: 'Diğer' },
  ];

  describe('Rendering', () => {
    it('renders with label and all options', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Cinsiyet')).toBeInTheDocument();
      expect(screen.getByText('Erkek')).toBeInTheDocument();
      expect(screen.getByText('Kadın')).toBeInTheDocument();
      expect(screen.getByText('Diğer')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          error="Cinsiyet seçmelisiniz"
        />
      );

      expect(screen.getByText('Cinsiyet seçmelisiniz')).toBeInTheDocument();
    });

    it('displays help text when no error', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          helpText="Cinsiyetinizi seçin"
        />
      );

      expect(screen.getByText('Cinsiyetinizi seçin')).toBeInTheDocument();
    });

    it('hides help text when error is present', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          error="Hata mesajı"
          helpText="Yardım metni"
        />
      );

      expect(screen.queryByText('Yardım metni')).not.toBeInTheDocument();
      expect(screen.getByText('Hata mesajı')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('selects the correct option', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value="male"
          onChange={() => {}}
        />
      );

      const maleRadio = screen.getByLabelText('Erkek');
      expect(maleRadio).toBeChecked();
    });

    it('calls onChange when option is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={handleChange}
        />
      );

      const femaleRadio = screen.getByLabelText('Kadın');
      await user.click(femaleRadio);

      expect(handleChange).toHaveBeenCalledWith('female');
    });

    it('changes selection when different option is clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value="male"
          onChange={handleChange}
        />
      );

      const otherRadio = screen.getByLabelText('Diğer');
      await user.click(otherRadio);

      expect(handleChange).toHaveBeenCalledWith('other');
    });
  });

  describe('Orientation', () => {
    it('renders vertically by default', () => {
      const { container } = render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveClass('flex-col');
    });

    it('renders horizontally when orientation is horizontal', () => {
      const { container } = render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          orientation="horizontal"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveClass('flex-row');
    });
  });

  describe('Options with Description', () => {
    const optionsWithDescription = [
      { value: 'basic', label: 'Temel', description: 'Temel özellikler' },
      { value: 'pro', label: 'Pro', description: 'Gelişmiş özellikler' },
    ];

    it('displays option descriptions', () => {
      render(
        <RadioGroupField
          name="plan"
          label="Plan"
          options={optionsWithDescription}
          value=""
          onChange={() => {}}
        />
      );

      expect(screen.getByText('Temel özellikler')).toBeInTheDocument();
      expect(screen.getByText('Gelişmiş özellikler')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables all options when disabled prop is true', () => {
      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          disabled
        />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('disables specific options', () => {
      const optionsWithDisabled = [
        { value: 'male', label: 'Erkek' },
        { value: 'female', label: 'Kadın', disabled: true },
        { value: 'other', label: 'Diğer' },
      ];

      render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={optionsWithDisabled}
          value=""
          onChange={() => {}}
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeDisabled();
      expect(radios[1]).toBeDisabled();
      expect(radios[2]).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-invalid when error is present', () => {
      const { container } = render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          error="Hata"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby for error message', () => {
      const { container } = render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          error="Hata mesajı"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveAttribute('aria-describedby', 'gender-error');
    });

    it('sets aria-describedby for help text', () => {
      const { container } = render(
        <RadioGroupField
          name="gender"
          label="Cinsiyet"
          options={options}
          value=""
          onChange={() => {}}
          helpText="Yardım metni"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveAttribute('aria-describedby', 'gender-help');
    });
  });
});
