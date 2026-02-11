/**
 * Root Error Boundary
 *
 * Root level'da catch-all error boundary olarak çalışır.
 * Unexpected error'ları handle eder.
 * Development mode'da error stack gösterir.
 */

import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { ErrorPage } from '@/pages/error';

/**
 * Root Error Boundary Component
 *
 * Tüm uygulamayı sarmalayan en üst seviye error boundary.
 * Alt seviye error boundary'ler tarafından yakalanmayan
 * tüm error'ları handle eder.
 */
export function RootErrorBoundary() {
  const error = useRouteError();

  // HTTP error (404, 500, vb.) - React Router Response objesi
  if (isRouteErrorResponse(error)) {
    const title = getErrorTitle(error.status);
    const description = error.data || error.statusText || 'Bir hata oluştu';

    return (
      <ErrorPage
        code={error.status}
        title={title}
        description={description}
        showRefresh={error.status >= 500}
      />
    );
  }

  // Unexpected error - JavaScript runtime error
  // Development mode'da daha detaylı bilgi göster
  const isDevelopment = import.meta.env.DEV;
  const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

  return (
    <ErrorPage
      code={500}
      title="Beklenmeyen Hata"
      description={isDevelopment ? errorMessage : 'Bir hata oluştu. Lütfen tekrar deneyin.'}
      showRefresh={true}
    />
  );
}

/**
 * HTTP status code'a göre Türkçe hata başlığı döndürür
 */
function getErrorTitle(status: number): string {
  switch (status) {
    case 404:
      return 'Sayfa Bulunamadı';
    case 403:
      return 'Erişim Engellendi';
    case 500:
      return 'Sunucu Hatası';
    case 503:
      return 'Servis Kullanılamıyor';
    default:
      return 'Bir Hata Oluştu';
  }
}
