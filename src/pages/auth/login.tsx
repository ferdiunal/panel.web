/**
 * Login Page
 * Kullanıcı giriş sayfası
 */

import { useState } from 'react';
import { useNavigate, Link, redirect } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';
import api, { setAuthToken } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/components/auth-layout';
import { useTranslation } from '@/hooks/useTranslation';

interface LoginResponse {
  user: any;
  session?: {
    token: string;
    expires: string;
  };
  csrf_token?: string;
}

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


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setError } = useAuthStore();
  const { features } = useAppStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError(t('auth.login.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<LoginResponse>('/auth/sign-in/email', {
        email,
        password,
      });

      if (response.data.session?.token && response.data.user) {
        setAuthToken(response.data.session.token);
        login(response.data.user, response.data.session.token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || t('auth.login.loginFailed');
      setLocalError(message);
      setError(new Error(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {features.forgot_password && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.login.submitting')}
                </>
              ) : (
                t('auth.login.submit')
              )}
            </Button>
          </form>
          {features.register && (
            <div className="mt-4 text-center text-sm">
              {t('auth.login.noAccount')}{" "}
              <Link to="/register" className="underline underline-offset-4">
                {t('auth.login.register')}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
