import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

describe('Pagination Component', () => {
  it('renders numbered links mode by default', () => {
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

    expect(screen.getByText('Showing 11 to 20 of 100')).toBeTruthy();
    expect(screen.getByRole('button', { name: '1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '2' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '3' })).toBeTruthy();
  });

  it('calls onPageChange when clicking a page in links mode', () => {
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

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders simple mode with page indicator', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination
        mode="simple"
        page={2}
        pageSize={10}
        total={100}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(screen.getByText('Page 2 of 10')).toBeTruthy();
  });

  it('calls onLoadMore in load_more mode', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onLoadMore = vi.fn();

    render(
      <Pagination
        mode="load_more"
        page={1}
        pageSize={10}
        total={30}
        visibleCount={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onLoadMore={onLoadMore}
      />
    );

    expect(screen.getByText('Showing 10 of 30')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Daha fazla yükle' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('disables load more button when all records are visible', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onLoadMore = vi.fn();

    render(
      <Pagination
        mode="load_more"
        page={3}
        pageSize={10}
        total={30}
        visibleCount={30}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onLoadMore={onLoadMore}
      />
    );

    const button = screen.getByRole('button', { name: 'Daha fazla yükle' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('calls onPageSizeChange when page size is changed', () => {
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
});
