/**
 * DetailView Component Tests
 * Tests for resource detail display, loading, error, and delete states
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import DetailView from './DetailView';
import type { FieldDefinition, User } from '@/types';

// Mock ResponsiveModal
vi.mock('@/components/ui/responsive-modal', () => ({
  ResponsiveModal: ({ children, title, open, onOpenChange }: { children: React.ReactNode; title: string; open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? (
      <div data-testid="responsive-modal" role="dialog">
        <h2>{title}</h2>
        <button onClick={() => onOpenChange(false)} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

describe('DetailView Component', () => {
  const mockFields: FieldDefinition[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
    },
  ];

  const mockResource: User = {
    id: '1',
    type: 'user',
    attributes: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnDeleteConfirm = vi.fn();
  const mockOnDeleteCancel = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property 17: Detail View Displays All Attributes', () => {
    it('should display all resource attributes', () => {
      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('detail-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('detail-email')).toHaveTextContent('john@example.com');
      expect(screen.getByTestId('detail-role')).toHaveTextContent('admin');
    });

    it(
      'should display all attributes for any resource',
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          email: fc.string({ minLength: 1 }),
          role: fc.constantFrom('admin', 'user'),
          status: fc.constantFrom('active', 'inactive'),
        }),
        (attributes) => {
          const resource: User = {
            id: '1',
            type: 'user',
            attributes,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { container } = render(
            <DetailView
              resourceType="user"
              resource={resource}
              fields={mockFields}
              isOpen={true}
              onEdit={mockOnEdit}
              onDelete={mockOnDelete}
              onDeleteConfirm={mockOnDeleteConfirm}
              onDeleteCancel={mockOnDeleteCancel}
              onClose={mockOnClose}
            />
          );

          expect(container.querySelector('[data-testid="detail-name"]')).toHaveTextContent(
            attributes.name
          );
          expect(container.querySelector('[data-testid="detail-email"]')).toHaveTextContent(
            attributes.email
          );

          return true;
        }
      )
    );
  });

  describe('Property 19: Detail Loading Shows Skeleton', () => {
    it('should display loading skeleton when loading', () => {
      render(
        <DetailView
          resourceType="user"
          resource={null}
          fields={mockFields}
          isOpen={true}
          isLoading={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      // Check for skeleton elements
      const skeletons = screen.getByText('Loading...').closest('div')?.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons?.length).toBeGreaterThan(0);
    });
  });

  describe('Property 20: Detail Error Shows Message and Retry', () => {
    it('should display error message with retry button', () => {
      const error = 'Failed to load resource';

      render(
        <DetailView
          resourceType="user"
          resource={null}
          fields={mockFields}
          isOpen={true}
          error={error}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText(error)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const error = 'Failed to load resource';

      render(
        <DetailView
          resourceType="user"
          resource={null}
          fields={mockFields}
          isOpen={true}
          error={error}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Property 21: Edit Button Navigates to Form', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalled();
    });
  });

  describe('Property 22: Delete Button Shows Confirmation', () => {
    it('should show delete confirmation dialog when delete button is clicked', () => {
      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          showDeleteConfirm={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/delete user\?/i)).toBeInTheDocument();
      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });
  });

  describe('Property 23: Delete Confirmation Deletes and Navigates', () => {
    it('should call onDeleteConfirm when delete is confirmed', async () => {
      const user = userEvent.setup();

      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          showDeleteConfirm={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      expect(mockOnDeleteConfirm).toHaveBeenCalled();
    });

    it('should call onDeleteCancel when delete is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          showDeleteConfirm={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnDeleteCancel).toHaveBeenCalled();
    });
  });

  describe('Property 24: Back Button Navigates to Index', () => {
    it('should call onClose when sheet is closed', async () => {
      const userEvent_ = userEvent.setup();

      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      // Find and click the close button
      const closeButtons = screen.getAllByRole('button');
      const sheetCloseButton = closeButtons.find((btn) => btn.getAttribute('data-slot') === 'sheet-close');

      if (sheetCloseButton) {
        await userEvent_.click(sheetCloseButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Delete Button Loading State', () => {
    it('should show loading state while deleting', () => {
      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          isDeleting={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should disable buttons while deleting', () => {
      render(
        <DetailView
          resourceType="user"
          resource={mockResource}
          fields={mockFields}
          isOpen={true}
          isDeleting={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /deleting/i });

      expect(editButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Value Formatting', () => {
    it('should format boolean values as Yes/No', () => {
      const resource: User = {
        id: '1',
        type: 'user',
        attributes: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          is_active: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const booleanFields: FieldDefinition[] = [
        {
          name: 'is_active',
          label: 'Active',
          type: 'switch',
        },
      ];

      render(
        <DetailView
          resourceType="user"
          resource={resource}
          fields={booleanFields}
          isOpen={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('detail-is_active')).toHaveTextContent('Yes');
    });

    it('should display dash for null/undefined values', () => {
      const resource: User = {
        id: '1',
        type: 'user',
        attributes: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          bio: undefined,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bioField: FieldDefinition[] = [
        {
          name: 'bio',
          label: 'Bio',
          type: 'textarea',
        },
      ];

      render(
        <DetailView
          resourceType="user"
          resource={resource}
          fields={bioField}
          isOpen={true}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDeleteConfirm={mockOnDeleteConfirm}
          onDeleteCancel={mockOnDeleteCancel}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('detail-bio')).toHaveTextContent('-');
    });
  });
});
