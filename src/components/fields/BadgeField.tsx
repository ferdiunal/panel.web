import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface BadgeFieldProps {
  value: string | number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  className?: string;
}

/**
 * BadgeField Component
 *
 * A read-only badge display field component built with shadcn/ui Badge.
 * Used to display status, labels, or categories in list and detail views.
 * Not intended for form input.
 */
export const BadgeField: React.FC<BadgeFieldProps> = ({
  value,
  variant = 'default',
  className,
}) => {
  if (!value && value !== 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Badge variant={variant} className={cn(className)}>
      {value}
    </Badge>
  );
};

BadgeField.displayName = 'BadgeField';
