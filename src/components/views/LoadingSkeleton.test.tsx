import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton Component', () => {
  describe('Rendering', () => {
    it('should render table structure', () => {
      const { container } = render(
        <LoadingSkeleton columns={3} rows={5} />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('should render correct number of header columns', () => {
      const { container } = render(
        <LoadingSkeleton columns={3} rows={5} />
      );

      const headerCells = container.querySelectorAll('thead th');
      expect(headerCells).toHaveLength(3);
    });

    it('should render correct number of rows', () => {
      const { container } = render(
        <LoadingSkeleton columns={3} rows={5} />
      );

      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(5);
    });

    it('should render skeleton elements', () => {
      const { container } = render(
        <LoadingSkeleton columns={3} rows={2} />
      );

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Property 5: Loading State Displays Skeleton', () => {
    it('should display skeleton for any column count', () => {
      for (let cols = 1; cols <= 5; cols++) {
        const { container, unmount } = render(
          <LoadingSkeleton columns={cols} rows={3} />
        );

        const headerCells = container.querySelectorAll('thead th');
        expect(headerCells).toHaveLength(cols);

        unmount();
      }
    });

    it('should display skeleton for any row count', () => {
      for (let rows = 1; rows <= 10; rows++) {
        const { container, unmount } = render(
          <LoadingSkeleton columns={3} rows={rows} />
        );

        const bodyRows = container.querySelectorAll('tbody tr');
        expect(bodyRows).toHaveLength(rows);

        unmount();
      }
    });
  });
});
