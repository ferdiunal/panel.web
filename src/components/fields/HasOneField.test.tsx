import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { HasOneField } from './HasOneField';
import type { Resource } from '@/types';

const mockResources: Resource[] = [
  { id: '1', name: 'Resource 1', type: 'user' },
  { id: '2', name: 'Resource 2', type: 'user' },
];

describe('HasOneField Component', () => {
  describe('Rendering', () => {
    it('should render with label and combobox input', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasOneField
          name="profile"
          label="Profile"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select a resource...')).toBeInTheDocument();
    });

    it('should display required indicator when required prop is true', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasOneField
          name="profile"
          label="Profile"
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
        <HasOneField
          name="profile"
          label="Profile"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          helpText="Select the user profile"
        />
      );

      expect(screen.getByText('Select the user profile')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasOneField
          name="profile"
          label="Profile"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          error="Profile is required"
        />
      );

      expect(screen.getByText('Profile is required')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call searchFn when user types in search input', async () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue(mockResources);

      render(
        <HasOneField
          name="profile"
          label="Profile"
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
        <HasOneField
          name="profile"
          label="Profile"
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
        <HasOneField
          name="profile"
          label="Profile"
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
        <HasOneField
          name="profile"
          label="Profile"
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
        <HasOneField
          name="profile"
          label="Profile"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
          error="Profile is required"
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper label association', () => {
      const onChange = vi.fn();
      const searchFn = vi.fn().mockResolvedValue([]);

      render(
        <HasOneField
          name="profile"
          label="Profile"
          value={null}
          onChange={onChange}
          resourceType="user"
          searchFn={searchFn}
        />
      );

      const input = screen.getByPlaceholderText('Select a resource...');
      expect(input).toHaveAttribute('id', 'profile');
      expect(screen.getByText('Profile')).toHaveAttribute('for', 'profile');
    });
  });

  describe('Property Tests', () => {
    it('should handle any valid resource list', async () => {
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
          async (resources) => {
            const onChange = vi.fn();
            const searchFn = vi.fn().mockResolvedValue(resources);

            const { unmount } = render(
              <HasOneField
                name="profile"
                label="Profile"
                value={null}
                onChange={onChange}
                resourceType="user"
                searchFn={searchFn}
              />
            );

            const input = screen.getByPlaceholderText('Select a resource...') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'test' } });

            await waitFor(() => {
              resources.forEach((resource) => {
                expect(screen.getByText(resource.name)).toBeInTheDocument();
              });
            });

            unmount();
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});
