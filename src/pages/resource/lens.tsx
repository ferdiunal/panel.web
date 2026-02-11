/**
 * Lens Page
 *
 * Lens görüntüleme sayfası.
 * URL: /resource/:resource/lens/:lens
 *
 * Bu sayfa, LensView component'ini render eder ve
 * gerekli prop'ları URL parametrelerinden alır.
 */

import { useParams, Navigate, type LoaderFunctionArgs, redirect } from 'react-router-dom';
import { LensView } from '@/components/views/LensView';
import { useAppStore, useAuthStore } from '@/stores';

/**
 * Lens Page Loader
 * Sayfa yüklenmeden önce authentication kontrolü yapar
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const resource = params.resource;
  const lens = params.lens;

  if (!resource || !lens) {
    throw new Response('Resource or lens not found', { status: 404 });
  }

  try {
    await useAppStore.getState().init();
  } catch (error) {
    console.error('App init failed:', error);
  }

  try {
    await useAuthStore.getState().checkSession();
  } catch {
    return redirect('/login');
  }

  return { resource, lens };
};

/**
 * Lens Page Component
 *
 * URL parametrelerinden resource ve lens slug'ını alır
 * ve LensView component'ini render eder.
 */
export default function LensPage() {
  const { resource, lens } = useParams<{ resource: string; lens: string }>();

  // URL parametreleri eksikse ana sayfaya yönlendir
  if (!resource || !lens) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto">
      <LensView
        resourceName={resource}
        lensSlug={lens}
        searchable={true}
        perPageOptions={[25, 50, 100]}
      />
    </div>
  );
}
