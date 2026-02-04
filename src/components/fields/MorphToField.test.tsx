import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MorphToField } from './MorphToField';
import type { Resource } from '@/types';

const mockUserResources: Resource[] = [
  { id: 'u1', name: 'User 1', type: 'user' },
  { id: 'u2', name: 'User 2', type: 'user' },
];

const mockPostResources: Resource[] = [
  { id: 'p1', name: 'Post 1', type: 'post' },
  { id: 'p2', name: 'Post 2', type: 'post' },
];

describe('MorphToField Component', () => {
  describe('Rendering', () => {
    it('should render with label and combobox input', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      expect(screen.getByText('Morphable')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select a resource...')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
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
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
          helpText="Select a user or post"
        />
      );

      expect(screen.getByText('Select a user or post')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
          error="Morphable is required"
        />
      );

      expect(screen.getByText('Morphable is required')).toBeInTheDocument();
    });
  });

  describe('Polymorphic Search', () => {
    it('should search across multiple resource types', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockImplementation((type) => {
        if (type === 'user') return Promise.resolve(mockUserResources);
        if (type === 'post') return Promise.resolve(mockPostResources);
        return Promise.resolve([]);
      });

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(searchFn).toHaveBeenCalledWith('user', 'test');
        expect(searchFn).toHaveBeenCalledWith('post', 'test');
      });
    });

    it('should display results grouped by resource type', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockImplementation((type) => {
        if (type === 'user') return Promise.resolve(mockUserResources);
        if (type === 'post') return Promise.resolve(mockPostResources);
        return Promise.resolve([]);
      });

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('user')).toBeInTheDocument();
        expect(screen.getByText('post')).toBeInTheDocument();
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });
    });

    it('should show loading state while searching', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should call onChange when option is selected', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockImplementation((type) => {
        if (type === 'user') return Promise.resolve(mockUserResources);
        return Promise.resolve([]);
      });

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument();
      });

      const option = screen.getByText('User 1');
      fireEvent.click(option);

      expect(onChange).toHaveBeenCalledWith('u1');
    });

    it('should allow selecting from different resource types', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockImplementation((type) => {
        if (type === 'user') return Promise.resolve(mockUserResources);
        if (type === 'post') return Promise.resolve(mockPostResources);
        return Promise.resolve([]);
      });

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.getByText('Post 1')).toBeInTheDocument();
      });

      const userOption = screen.getByText('User 1');
      fireEvent.click(userOption);

      expect(onChange).toHaveBeenCalledWith('u1');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-invalid when error is present', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
          error="Morphable is required"
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('id', 'morphable');
      expect(screen.getByText('Morphable')).toHaveAttribute('for', 'morphable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle search errors gracefully', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockRejectedValue(new Error('Search failed'));

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle empty results from all types', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <MorphToField
          name="morphable"
          label="Morphable"
          value={null}
          onChange={onChange}
          resourceTypes={['user', 'post']}
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });
});
