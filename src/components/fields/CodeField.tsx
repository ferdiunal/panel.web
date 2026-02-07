import React from 'react';
import Editor from '@monaco-editor/react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface CodeFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'light';
  height?: string;
  readOnly?: boolean;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * CodeField Component
 *
 * A code editor field component built with Monaco Editor (VS Code's editor).
 * Supports syntax highlighting for multiple languages, themes, and read-only mode.
 */
export const CodeField: React.FC<CodeFieldProps> = ({
  name,
  label,
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  height = '300px',
  readOnly = false,
  error,
  required,
  helpText,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="border rounded-md overflow-hidden">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme={theme}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${name}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  );
};

CodeField.displayName = 'CodeField';
