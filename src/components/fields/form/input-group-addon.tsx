import React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddonAwareInputProps extends React.ComponentProps<'input'> {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  groupClassName?: string;
}

interface AddonAwareTextareaProps extends React.ComponentProps<'textarea'> {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  groupClassName?: string;
}

interface AddonAwareControlProps {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  children: React.ReactNode;
  groupClassName?: string;
  controlClassName?: string;
}

function normalizeAddonContent(addon: React.ReactNode): React.ReactNode {
  if (typeof addon === 'string' || typeof addon === 'number') {
    return <InputGroupText>{addon}</InputGroupText>;
  }
  return addon;
}

export function AddonAwareInput({
  startAddon,
  endAddon,
  className,
  groupClassName,
  ...props
}: AddonAwareInputProps) {
  if (!startAddon && !endAddon) {
    return <Input className={className} {...props} />;
  }

  return (
    <InputGroup className={cn('h-9 rounded-md', groupClassName)}>
      {startAddon && (
        <InputGroupAddon align="inline-start">
          {normalizeAddonContent(startAddon)}
        </InputGroupAddon>
      )}
      <InputGroupInput className={className} {...props} />
      {endAddon && (
        <InputGroupAddon align="inline-end">
          {normalizeAddonContent(endAddon)}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export function AddonAwareTextarea({
  startAddon,
  endAddon,
  className,
  groupClassName,
  ...props
}: AddonAwareTextareaProps) {
  if (!startAddon && !endAddon) {
    return <Textarea className={className} {...props} />;
  }

  return (
    <InputGroup className={cn('h-auto min-h-9 items-stretch rounded-md', groupClassName)}>
      {startAddon && (
        <InputGroupAddon align="block-start">
          {normalizeAddonContent(startAddon)}
        </InputGroupAddon>
      )}
      <InputGroupTextarea className={className} {...props} />
      {endAddon && (
        <InputGroupAddon align="block-end">
          {normalizeAddonContent(endAddon)}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export function AddonAwareControl({
  startAddon,
  endAddon,
  children,
  groupClassName,
  controlClassName,
}: AddonAwareControlProps) {
  if (!startAddon && !endAddon) {
    return <>{children}</>;
  }

  return (
    <InputGroup className={cn('h-9 rounded-md', groupClassName)}>
      {startAddon && (
        <InputGroupAddon align="inline-start">
          {normalizeAddonContent(startAddon)}
        </InputGroupAddon>
      )}
      <div
        data-slot="input-group-control"
        className={cn('flex min-w-0 flex-1 items-center', controlClassName)}
      >
        {children}
      </div>
      {endAddon && (
        <InputGroupAddon align="inline-end">
          {normalizeAddonContent(endAddon)}
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
