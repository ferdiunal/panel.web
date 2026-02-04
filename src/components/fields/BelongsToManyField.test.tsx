import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BelongsToManyField } from './BelongsToManyField';
import type { Resource } from '@/types';

const mockResources: Resource[] = [
  { id: '1', name: 'Resource 1', type: 'category' },
  { id: '2', name: 'Resource 2', type: 'category' },
  { id: '3', name: 'Resource 3', type: 'category' },
];

describe('BelongsToManyField Component', () => {
  describe('Rendering', () => {
    it('should render with label and multi-select input', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select resources...')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
          required={true}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should display help text when provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
          helpText="Select multiple categories"
        />
      );

      expect(screen.getByText('Select multiple categories')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
          error="Categories are required"
        />
      );

      expect(screen.getByText('Categories are required')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call searchFn when user types in search input', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(searchFn).toHaveBeenCalledWith('Resource');
      });
    });

    it('should display search results', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Selection', () => {
    it('should add item to selection when option is clicked', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });

      const option = screen.getByText('Resource 1');
      fireEvent.click(option);

      expect(onChange).toHaveBeenCalledWith(['1']);
    });

    it('should allow multiple selections', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      const { rerender } = render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });

      const option1 = screen.getByText('Resource 1');
      fireEvent.click(option1);

      expect(onChange).toHaveBeenCalledWith(['1']);

      rerender(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={['1']}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 2')).toBeInTheDocument();
      });

      const option2 = screen.getByText('Resource 2');
      fireEvent.click(option2);

      expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
          error="Categories are required"
        />
      );

      const chips = screen.getByRole('group');
      expect(chips).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToManyField
          name="categories"
          label="Categories"
          value={[]}
          onChange={onChange}
          resourceType="category"
          searchFn={searchFn}
        />
      );

      const chips = screen.getByRole('group');
      expect(chips).toHaveAttribute('id', 'categories');
      expect(screen.getByText('Categories')).toHaveAttribute('for', 'categories');
    });
  });
});
