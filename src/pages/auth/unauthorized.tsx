/**
 * Unauthorized Page
 * Shown when user lacks required permissions
 */

import { redirect, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks/useTranslation';

export async function loader() {
  try {
    await useAppStore.getState().init()
    await useAuthStore.getState().checkSession()
    if (useAuthStore.getState().isAuthenticated) {
      return redirect('/dashboard');
    }
  } catch {
  }
}


export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle>{t('auth.unauthorized.title')}</CardTitle>
              <CardDescription>{t('auth.unauthorized.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('auth.unauthorized.message')}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                {t('auth.unauthorized.goBack')}
              </Button>
              <Button
                onClick={() => navigate('/')}
              >
                {t('auth.unauthorized.goHome')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
