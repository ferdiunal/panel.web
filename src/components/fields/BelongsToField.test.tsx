import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { BelongsToField } from './BelongsToField';
import type { Resource } from '@/types';

const mockResources: Resource[] = [
  { id: '1', name: 'Resource 1', type: 'user' },
  { id: '2', name: 'Resource 2', type: 'user' },
  { id: '3', name: 'Resource 3', type: 'user' },
];

describe('BelongsToField Component', () => {
  describe('Rendering', () => {
    it('should render with label and combobox input', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      expect(screen.getByText('Author')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select a resource...')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
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
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          helpText="Select the author of this post"
        />
      );

      expect(screen.getByText('Select the author of this post')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          error="Author is required"
        />
      );

      expect(screen.getByText('Author is required')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call searchFn when user types in search input', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(searchFn).toHaveBeenCalledWith('Resource');
      });
    });

    it('should display search results', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
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
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection Behavior', () => {
    it('should call onChange when option is selected', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Resource' } });

      await waitFor(() => {
        expect(screen.getByText('Resource 1')).toBeInTheDocument();
      });

      const option = screen.getByText('Resource 1');
      fireEvent.click(option);

      expect(onChange).toHaveBeenCalledWith('1');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          error="Author is required"
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <BelongsToField
          name="author"
          label="Author"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('id', 'author');
      expect(screen.getByText('Author')).toHaveAttribute('for', 'author');
    });
  });

  describe('Property 29: BelongsTo Field Searches Related Resources', () => {
    it('should search and return matching resources for any query', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              type: fc.constant('user' as const),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          fc.string({ minLength: 1, maxLength: 10 }),
          async (resources, query) => {
            const onChange = vi.fn();
            const searchFn = vi.fn().mockResolvedValue(resources);

            const { unmount } = render(
              <BelongsToField
                name="author"
                label="Author"
                value={null}
                onChange={onChange}
                resourceType="user"
                searchFn={searchFn}
              />
            );

            const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: query } });

            await waitFor(() => {
              expect(searchFn).toHaveBeenCalledWith(query);
            });

            unmount();
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
