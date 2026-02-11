/**
 * Resource Error Boundary
 *
 * Resource route'larında oluşan error'ları handle eder.
 * HTTP status code'a göre farklı UI gösterir.
 * React Router v6 error boundary pattern'i kullanır.
 */

import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { ErrorPage } from '@/pages/error';

/**
 * Resource Error Boundary Component
 *
 * useRouteError() ile error'ı yakalar ve isRouteErrorResponse() ile
 * type-safe error handling yapar.
 */
export function ResourceErrorBoundary() {
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

  // Unexpected error - JavaScript runtime error veya diğer hatalar
  return (
    <ErrorPage
      code={500}
      title="Beklenmeyen Hata"
      description="Bir hata oluştu. Lütfen tekrar deneyin."
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
      return 'Kaynak Bulunamadı';
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
