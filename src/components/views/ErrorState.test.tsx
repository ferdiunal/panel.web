import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState Component', () => {
  describe('Rendering', () => {
    it('should render with default title', () => {
      render(
        <ErrorState message="Something went wrong" />
      );

      expect(screen.getByText('Error loading resources')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(
        <ErrorState
          title="Failed"
          message="Something went wrong"
        />
      );

      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should render error message', () => {
      const message = 'Network connection failed';

      render(
        <ErrorState message={message} />
      );

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should render retry button with default label', () => {
      const onRetry = vi.fn();

      render(
        <ErrorState
          message="Error"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should render retry button with custom label', () => {
      const onRetry = vi.fn();

      render(
        <ErrorState
          message="Error"
          retryLabel="Try Again"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(
        <ErrorState message="Error" />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();

      render(
        <ErrorState
          message="Error"
          onRetry={onRetry}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Property 7: Error State Shows Message and Retry', () => {
    it('should display error message and retry button', () => {
      const onRetry = vi.fn();
      const messages = ['Connection failed', 'Server error', 'Timeout'];

      for (const message of messages) {
        const { unmount } = render(
          <ErrorState
            message={message}
            onRetry={onRetry}
          />
        );

        expect(screen.getByText(message)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();

        unmount();
      }
    });
  });
});
