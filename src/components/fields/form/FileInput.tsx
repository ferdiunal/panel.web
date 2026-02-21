/**
 * FileFormField - Dosya yükleme form bileşeni
 *
 * useFileUpload hook'unu kullanarak drag-and-drop, önizleme ve
 * dosya validasyonu destekler. Mevcut değer (URL string) olduğunda
 * da doğru şekilde görüntüler.
 *
 * FormData ile gönderim için uyumludur.
 */

import React from 'react';
import { useFileUpload, formatBytes } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';
import { Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const DATA_OR_BLOB_URL_PATTERN = /^(?:data|blob):/i;

function extractStringValue(raw: unknown): string | null {
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (!raw || typeof raw !== 'object') {
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

function resolveExistingPreviewUrl(rawValue: unknown, storageBaseUrl?: string): string | null {
    const extracted = extractStringValue(rawValue);
    if (!extracted) return null;

    if (DATA_OR_BLOB_URL_PATTERN.test(extracted) || ABSOLUTE_URL_PATTERN.test(extracted)) {
        return extracted;
    }

    if (extracted.startsWith('/')) {
        return extracted;
    }

    // Relative path with folder info is treated as app-root relative.
    if (extracted.includes('/')) {
        return `/${extracted.replace(/^\/+/, '')}`;
    }

    const fallbackBase = (storageBaseUrl || '/storage').trim().replace(/\/+$/, '');
    return `${fallbackBase}/${extracted.replace(/^\/+/, '')}`;
}

function extractExistingFileName(rawValue: unknown, resolvedUrl: string | null): string | null {
    if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        const name = (rawValue as Record<string, unknown>).name;
        if (typeof name === 'string' && name.trim().length > 0) {
            return name.trim();
        }
    }

    if (!resolvedUrl) return null;
    const segments = resolvedUrl.split('/');
    return segments[segments.length - 1] || null;
}

export const FileFormField: React.FC<FormFieldProps> = ({
    field,
    name,
    label,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    placeholder,
    helpText,
    startAddon,
    endAddon,
}) => {
    const maxSize = (field.props?.maxSize as number) || 10 * 1024 * 1024; // 10MB default
    const accept = (field.props?.accept as string) || '*';
    const fieldView = String((field as any).view || '');
    const isImageAccept = accept
        .split(',')
        .some((entry) => entry.trim().toLowerCase().startsWith('image/'));
    const isImageField =
        fieldView === 'image-field' ||
        fieldView.startsWith('image-field-') ||
        (field.type as string) === 'image' ||
        isImageAccept;

    const storageBaseUrl =
        (field.props?.storageURL as string | undefined) ||
        (field.props?.storageUrl as string | undefined) ||
        (field.props?.storage_url as string | undefined);

    const [
        { files, isDragging, errors },
        { removeFile, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps },
    ] = useFileUpload({
        maxFiles: 1,
        maxSize,
        accept,
        multiple: false,
        initialFiles: [],
        onFilesChange: (updatedFiles) => {
            if (updatedFiles.length > 0) {
                const f = updatedFiles[0];
                // File nesnesi varsa onu gönder (FormData uyumlu)
                if (f.file instanceof File) {
                    onChange(f.file);
                }
            } else {
                onChange(null);
            }
        },
    });
    const addons = resolveFieldInputAddons(
      field.props as Record<string, unknown> | undefined,
      { startAddon, endAddon }
    );

    const currentFile = files[0];

    // Mevcut değer (URL string) olduğunda gösterilecek bilgi
    const existingUrl = !currentFile ? resolveExistingPreviewUrl(value, storageBaseUrl) : null;
    const existingFileName = extractExistingFileName(value, existingUrl);

    // Preview: yeni dosya varsa onun preview'ı, yoksa mevcut URL
    const previewUrl = currentFile?.preview || existingUrl;

    const handleRemove = () => {
        if (currentFile) {
            removeFile(currentFile.id);
        } else if (existingUrl) {
            // Mevcut URL'yi temizle
            onChange(null);
        }
    };

    const hasFile = currentFile || existingUrl;
    const fileName = currentFile
        ? (currentFile.file instanceof File ? currentFile.file.name : currentFile.file.name)
        : existingFileName;

    return (
        <FieldLayout
            name={name}
            label={label}
            error={error}
            required={required}
            helpText={helpText}
            disabled={disabled}
        >
            <AddonAwareControl
                startAddon={addons.startAddon}
                endAddon={addons.endAddon}
                groupClassName={addons.startAddon || addons.endAddon ? 'h-auto min-h-9 items-stretch' : undefined}
                controlClassName={addons.startAddon || addons.endAddon ? 'items-stretch px-2.5 py-2' : undefined}
            >
                <div className="space-y-2 w-full">
                    {/* Drop Zone */}
                    <div
                        className={cn(
                            'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                            disabled && 'opacity-50 cursor-not-allowed',
                            error && 'border-destructive',
                        )}
                        onDragEnter={!disabled ? handleDragEnter : undefined}
                        onDragLeave={!disabled ? handleDragLeave : undefined}
                        onDragOver={!disabled ? handleDragOver : undefined}
                        onDrop={!disabled ? handleDrop : undefined}
                        onClick={!disabled ? openFileDialog : undefined}
                    >
                        <input
                            {...getInputProps()}
                            className="sr-only"
                            onBlur={onBlur}
                            disabled={disabled}
                        />

                        {/* Preview veya Upload Icon */}
                        {hasFile ? (
                            <div className="flex items-center gap-3 w-full">
                                {/* Resim önizleme */}
                                {isImageField && previewUrl ? (
                                    <div className="h-16 w-16 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center flex-shrink-0">
                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Dosya bilgileri */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{fileName}</p>
                                    {currentFile && currentFile.file instanceof File && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(currentFile.file.size)}
                                        </p>
                                    )}
                                    {existingUrl && !currentFile && (
                                        <p className="text-xs text-muted-foreground">Mevcut dosya</p>
                                    )}
                                </div>

                                {/* Kaldır butonu */}
                                {!disabled && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove();
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                {isImageField ? (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                )}
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        {placeholder || 'Dosya yüklemek için tıklayın veya sürükleyin'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Maksimum boyut: {formatBytes(maxSize)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Hata mesajları (useFileUpload'dan gelen) */}
                    {errors.length > 0 && (
                        <div className="text-sm text-destructive space-y-1">
                            {errors.map((err, i) => (
                                <p key={i}>{err}</p>
                            ))}
                        </div>
                    )}
                </div>
            </AddonAwareControl>
        </FieldLayout>
    );
};

FileFormField.displayName = 'FileFormField';
