import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * SearchBar Component
 * 
 * A search input with clear button for filtering resources.
 * 
 * Validates: Requirements 1.2
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search resources...',
      onClear,
      disabled = false,
      className,
    },
    ref
  ) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    const handleClear = useCallback(() => {
      onChange('');
      onClear?.();
    }, [onChange, onClear]);

    return (
      <div className={cn('relative flex items-center', className)}>
        <SearchIcon className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="icon"
            className="absolute right-1 h-7 w-7"
            disabled={disabled}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
