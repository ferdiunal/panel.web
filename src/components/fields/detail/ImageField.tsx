import React from 'react';
import { ImageOff } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';
import { cn } from '@/lib/utils';
import { resolveImageFieldPropsFromFields } from '@/lib/image-field-props';

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const DATA_OR_BLOB_URL_PATTERN = /^(?:data|blob):/i;

function extractStringValue(raw: unknown): string | null {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const candidates = [record.url, record.src, record.path, record.preview, record.value, record.data];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function resolveImageUrl(rawValue: unknown, storageBaseUrl?: string): string | null {
  const extracted = extractStringValue(rawValue);
  if (!extracted) return null;

  if (DATA_OR_BLOB_URL_PATTERN.test(extracted) || ABSOLUTE_URL_PATTERN.test(extracted)) {
    return extracted;
  }

  if (extracted.startsWith('/')) {
    return extracted;
  }

  // Relative paths with folders are treated as app-root relative.
  if (extracted.includes('/')) {
    return `/${extracted.replace(/^\/+/, '')}`;
  }

  const fallbackBase = (storageBaseUrl || '/storage').trim().replace(/\/+$/, '');
  return `${fallbackBase}/${extracted.replace(/^\/+/, '')}`;
}

export const ImageDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const rawValue = record[field.key]?.data || record[field.key];
  const storageBaseUrl =
    (field.props?.storageURL as string | undefined) ||
    (field.props?.storageUrl as string | undefined) ||
    (field.props?.storage_url as string | undefined);
  const imageProps = resolveImageFieldPropsFromFields(field);

  const imageUrl = resolveImageUrl(rawValue, storageBaseUrl);

  return (
    <FieldLayout name={field.key} label={field.label || field.name} helpText={field.help_text}>
      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={imageProps.containerClassName}
          title={imageProps.alt || field.label || field.name || field.key}
        >
          <img
            src={imageUrl}
            alt={imageProps.alt || field.label || field.name || field.key}
            className={cn('max-h-52 rounded-md border bg-muted object-contain', imageProps.className)}
            style={imageProps.style}
            loading={imageProps.loading || 'lazy'}
            decoding={imageProps.decoding}
            referrerPolicy={imageProps.referrerPolicy}
            crossOrigin={imageProps.crossOrigin}
            width={imageProps.width}
            height={imageProps.height}
            sizes={imageProps.sizes}
            srcSet={imageProps.srcSet}
          />
        </a>
      ) : (
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ImageOff className="h-4 w-4" />
          <span>—</span>
        </div>
      )}
    </FieldLayout>
  );
};

ImageDetailField.displayName = 'ImageDetailField';
