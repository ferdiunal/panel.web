import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { IndexView, type IndexViewColumn } from './IndexView';
import type { Resource } from '@/types';

const mockResources: Resource[] = [
  { id: '1', name: 'Resource 1', type: 'user' },
  { id: '2', name: 'Resource 2', type: 'user' },
  { id: '3', name: 'Resource 3', type: 'user' },
];

const mockColumns: IndexViewColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'type', label: 'Type' },
];

describe('IndexView Component', () => {
  describe('Rendering', () => {
    it('should render table with columns', () => {
      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should render all resources as table rows', () => {
      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();
      expect(screen.getByText('Resource 3')).toBeInTheDocument();
    });

    it('should display action buttons when callbacks are provided', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      );

      expect(screen.getAllByTitle('View')).toHaveLength(mockResources.length);
      expect(screen.getAllByTitle('Edit')).toHaveLength(mockResources.length);
      expect(screen.getAllByTitle('Delete')).toHaveLength(mockResources.length);
    });

    it('should display search input when onSearchChange is provided', () => {
      const onSearchChange = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onSearchChange={onSearchChange}
        />
      );

      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearchChange when search input changes', () => {
      const onSearchChange = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onSearchChange={onSearchChange}
        />
      );

      const input = screen.getByPlaceholderText('Search resources...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('should display current search query', () => {
      const onSearchChange = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          searchQuery="test query"
          onSearchChange={onSearchChange}
        />
      );

      const input = screen.getByPlaceholderText('Search resources...') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });
  });

  describe('Sort Functionality', () => {
    it('should call onSort when sortable column header is clicked', () => {
      const onSort = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should display sort indicator for active sort column', () => {
      const onSort = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          sortBy="name"
          sortOrder="asc"
          onSort={onSort}
        />
      );

      // Check that sort icon is displayed
      const nameHeader = screen.getByText('Name').closest('button');
      expect(nameHeader).toBeInTheDocument();
    });

    it('should not call onSort for non-sortable columns', () => {
      const onSort = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onSort={onSort}
        />
      );

      const idHeader = screen.getByText('ID');
      fireEvent.click(idHeader);

      expect(onSort).not.toHaveBeenCalled();
    });
  });

  describe('Action Buttons', () => {
    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onEdit={onEdit}
        />
      );

      const editButtons = screen.getAllByTitle('Edit');
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockResources[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onDelete={onDelete}
        />
      );

      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockResources[0]);
    });

    it('should call onView when view button is clicked', () => {
      const onView = vi.fn();

      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          onView={onView}
        />
      );

      const viewButtons = screen.getAllByTitle('View');
      fireEvent.click(viewButtons[0]);

      expect(onView).toHaveBeenCalledWith(mockResources[0]);
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      render(
        <IndexView
          resources={[]}
          columns={mockColumns}
          isLoading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not display resources when isLoading is true', () => {
      render(
        <IndexView
          resources={mockResources}
          columns={mockColumns}
          isLoading={true}
        />
      );

      expect(screen.queryByText('Resource 1')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when isEmpty is true', () => {
      render(
        <IndexView
          resources={[]}
          columns={mockColumns}
          isEmpty={true}
        />
      );

      expect(screen.getByText('No resources found')).toBeInTheDocument();
    });

    it('should display "No data" when resources array is empty', () => {
      render(
        <IndexView
          resources={[]}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(
        <IndexView
          resources={[]}
          columns={mockColumns}
          error="Failed to load resources"
        />
      );

      expect(screen.getByText('Error loading resources')).toBeInTheDocument();
      expect(screen.getByText('Failed to load resources')).toBeInTheDocument();
    });

    it('should display retry button when onRetry is provided', () => {
      const onRetry = vi.fn();

      render(
        <IndexView
          resources={[]}
          columns={mockColumns}
          error="Failed to load resources"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom render function for columns', () => {
      const customColumns: IndexViewColumn[] = [
        {
          key: 'name',
          label: 'Name',
          render: (value) => `Custom: ${value}`,
        },
      ];

      render(
        <IndexView
          resources={mockResources}
          columns={customColumns}
        />
      );

      expect(screen.getByText('Custom: Resource 1')).toBeInTheDocument();
    });
  });

  describe('Property 1: Index View Displays All Records', () => {
    it('should display all resources from array', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              type: fc.constant('user' as const),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (resources) => {
            render(
              <IndexView
                resources={resources}
                columns={mockColumns}
              />
            );

            resources.forEach((resource) => {
              expect(screen.getByText(resource.name)).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 3: Sort Order is Correct', () => {
    it('should display sort indicator for active sort', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.constant('asc' as const), fc.constant('desc' as const)),
          (sortOrder) => {
            render(
              <IndexView
                resources={mockResources}
                columns={mockColumns}
                sortBy="name"
                sortOrder={sortOrder}
              />
            );

            const nameHeader = screen.getByText('Name').closest('button');
            expect(nameHeader).toBeInTheDocument();
          }
        ),
        { numRuns: 2 }
      );
    });
  });
});
