import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Heading2,
} from 'lucide-react';
import './RichTextField.css';

export interface RichTextFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * RichTextField Component
 *
 * A rich text editor field component built with Tiptap and shadcn/ui.
 * Provides WYSIWYG editing with formatting toolbar.
 *
 * Features:
 * - Bold, Italic, Code formatting
 * - Headings, Lists (ordered/unordered)
 * - Blockquotes, Links
 * - Undo/Redo
 * - Placeholder support
 */
export const RichTextField = React.forwardRef<HTMLDivElement, RichTextFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder = 'Start typing...',
      helpText,
      className,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
        }),
      ],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    React.useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    const setLink = React.useCallback(() => {
      if (!editor) return;

      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('URL', previousUrl);

      if (url === null) return;

      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>

        <div
          className={cn(
            'rounded-md border border-input bg-background',
            error && 'border-destructive',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-input">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('bold') && 'bg-accent'
              )}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('italic') && 'bg-accent'
              )}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('code') && 'bg-accent'
              )}
            >
              <Code className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('heading', { level: 2 }) && 'bg-accent'
              )}
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('bulletList') && 'bg-accent'
              )}
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('orderedList') && 'bg-accent'
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('blockquote') && 'bg-accent'
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={setLink}
              className={cn(
                'h-8 w-8 p-0',
                editor.isActive('link') && 'bg-accent'
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor Content */}
          <EditorContent
            editor={editor}
            className={cn(
              'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
              '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
              '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none'
            )}
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
  }
);

RichTextField.displayName = 'RichTextField';
