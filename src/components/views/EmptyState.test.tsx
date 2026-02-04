import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  describe('Rendering', () => {
    it('should render with default title and description', () => {
      render(<EmptyState />);

      expect(screen.getByText('No resources found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new resource')).toBeInTheDocument();
    });

    it('should render with custom title and description', () => {
      render(
        <EmptyState
          title="No items"
          description="Create your first item"
        />
      );

      expect(screen.getByText('No items')).toBeInTheDocument();
      expect(screen.getByText('Create your first item')).toBeInTheDocument();
    });

    it('should render action button with default label', () => {
      const onAction = vi.fn();

      render(
        <EmptyState onAction={onAction} />
      );

      expect(screen.getByText('Create Resource')).toBeInTheDocument();
    });

    it('should render action button with custom label', () => {
      const onAction = vi.fn();

      render(
        <EmptyState
          actionLabel="Add New"
          onAction={onAction}
        />
      );

      expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('should not render action button when onAction is not provided', () => {
      render(<EmptyState />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should call onAction when button is clicked', () => {
      const onAction = vi.fn();

      render(
        <EmptyState onAction={onAction} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('Property 6: Empty State Shows Message', () => {
    it('should display message for any title and description', () => {
      const titles = ['No data', 'Empty', 'Nothing here'];
      const descriptions = ['Create something', 'Start fresh', 'Begin now'];

      for (let i = 0; i < titles.length; i++) {
        const { unmount } = render(
          <EmptyState
            title={titles[i]}
            description={descriptions[i]}
          />
        );

        expect(screen.getByText(titles[i])).toBeInTheDocument();
        expect(screen.getByText(descriptions[i])).toBeInTheDocument();

        unmount();
      }
    });
  });
});
