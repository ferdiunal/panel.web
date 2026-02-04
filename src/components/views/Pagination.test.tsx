import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  describe('Rendering', () => {
    it('should display current page and total pages', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
    });

    it('should display item range', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Showing 1 to 10 of 100')).toBeInTheDocument();
    });

    it('should display page size selector', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Per page:')).toBeInTheDocument();
    });

    it('should display navigation buttons', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={2}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange when next button is clicked', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={2}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      fireEvent.click(prevButton);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button on first page', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={10}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Page Size', () => {
    it('should call onPageSizeChange when page size is changed', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.click(select);

      const option = screen.getByText('25');
      fireEvent.click(option);

      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('should display custom page size options', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[5, 15, 30]}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.click(select);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });

  describe('Item Range Calculation', () => {
    it('should calculate correct item range for first page', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={1}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Showing 1 to 10 of 100')).toBeInTheDocument();
    });

    it('should calculate correct item range for middle page', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={2}
          pageSize={10}
          total={100}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Showing 11 to 20 of 100')).toBeInTheDocument();
    });

    it('should calculate correct item range for last page with partial items', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <Pagination
          page={3}
          pageSize={10}
          total={25}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      );

      expect(screen.getByText('Showing 21 to 25 of 25')).toBeInTheDocument();
    });
  });

  describe('Property 4: Pagination Shows Correct Page', () => {
    it('should display correct page information for any valid page', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      for (let page = 1; page <= 5; page++) {
        const { unmount } = render(
          <Pagination
            page={page}
            pageSize={10}
            total={100}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        );

        expect(screen.getByText(`Page ${page} of 10`)).toBeInTheDocument();
        unmount();
      }
    });
  });
});
