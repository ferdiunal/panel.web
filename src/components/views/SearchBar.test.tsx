import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value=""
          onChange={onChange}
        />
      );

      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
    });

    it('should display custom placeholder', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value=""
          onChange={onChange}
          placeholder="Find items..."
        />
      );

      expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
    });

    it('should display current value', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value="test query"
          onChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText('Search resources...') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });
  });

  describe('Search Functionality', () => {
    it('should call onChange when input changes', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value=""
          onChange={onChange}
        />
      );

      const input = screen.getByPlaceholderText('Search resources...');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onChange).toHaveBeenCalledWith('test');
    });

    it('should display clear button when value is not empty', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value="test"
          onChange={onChange}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not display clear button when value is empty', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value=""
          onChange={onChange}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Clear Functionality', () => {
    it('should call onChange with empty string when clear button is clicked', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value="test"
          onChange={onChange}
        />
      );

      const clearButton = screen.getByRole('button');
      fireEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should call onClear callback when clear button is clicked', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();

      render(
        <SearchBar
          value="test"
          onChange={onChange}
          onClear={onClear}
        />
      );

      const clearButton = screen.getByRole('button');
      fireEvent.click(clearButton);

      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const onChange = vi.fn();

      render(
        <SearchBar
          value=""
          onChange={onChange}
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText('Search resources...') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
