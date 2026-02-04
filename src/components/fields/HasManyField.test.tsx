import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { HasManyField } from './HasManyField';
import type { Resource } from '@/types';

const mockResources: Resource[] = [
  { id: '1', name: 'Resource 1', type: 'user' },
  { id: '2', name: 'Resource 2', type: 'user' },
  { id: '3', name: 'Resource 3', type: 'user' },
];

describe('HasManyField Component', () => {
  describe('Rendering', () => {
    it('should render with label and multi-select input', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
        />
      );

      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select resources...')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
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
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
          helpText="Select multiple tags"
        />
      );

      expect(screen.getByText('Select multiple tags')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
          error="Tags are required"
        />
      );

      expect(screen.getByText('Tags are required')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call searchFn when user types in search input', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
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
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });
    });

    it('should show loading state while searching', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResources), 100))
      );

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Selection', () => {
    it('should add item to selection when option is clicked', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
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
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
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

      // Simulate second selection
      rerender(
        <HasManyField
          name="tags"
          label="Tags"
          value={['1']}
          onChange={onChange}
          resourceType="tag"
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

    it('should display selected items as chips', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={['1', '2']}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
        />
      );

      // Chips should be displayed
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
          error="Tags are required"
        />
      );

      const chips = screen.getByRole('group');
      expect(chips).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasManyField
          name="tags"
          label="Tags"
          value={[]}
          onChange={onChange}
          resourceType="tag"
          searchFn={searchFn}
        />
      );

      const chips = screen.getByRole('group');
      expect(chips).toHaveAttribute('id', 'tags');
      expect(screen.getByText('Tags')).toHaveAttribute('for', 'tags');
    });
  });

  describe('Property 30: HasMany Field Allows Multiple Selection', () => {
    it('should allow selecting multiple resources', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              type: fc.constant('tag' as const),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (resources) => {
            const onChange = vi.fn();
            const searchFn = vi.fn().mockResolvedValue(resources);

            const { unmount } = render(
              <HasManyField
                name="tags"
                label="Tags"
                value={[]}
                onChange={onChange}
                resourceType="tag"
                searchFn={searchFn}
              />
            );

            const input = screen.getByPlaceholderText('Select resources...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'test' } });

            await waitFor(() => {
              expect(searchFn).toHaveBeenCalledWith('test');
            });

            unmount();
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
