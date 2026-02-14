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
}) => {
    const maxSize = (field.props?.maxSize as number) || 10 * 1024 * 1024; // 10MB default
    const accept = (field.props?.accept as string) || '*';
    const isImageField = (field.type as string) === 'image' || accept.startsWith('image/');

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

    const currentFile = files[0];

    // Mevcut değer (URL string) olduğunda gösterilecek bilgi
    const existingUrl = typeof value === 'string' && value && !currentFile ? value : null;
    const existingFileName = existingUrl ? existingUrl.split('/').pop() : null;

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
            <div className="space-y-2">
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
        </FieldLayout>
    );
};

FileFormField.displayName = 'FileFormField';
