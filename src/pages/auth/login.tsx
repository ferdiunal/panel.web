/**
 * Login Page
 * User authentication page
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
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }
    try {
        await useAppStore.getState().init()
        return null;
    } catch (error) {
        console.error('Login loader error:', error);
        return null;
    }
}


export default function LoginPage() {
  console.log('Render Login Page');
  const navigate = useNavigate();
  const { login, setError } = useAuthStore();
  const { features } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<LoginResponse>('/auth/sign-in/email', {
        email,
        password,
      });

      if (response.data.session?.token && response.data.user) {
        // Set auth token in localStorage and axios
        setAuthToken(response.data.session.token);
        
        // Update auth store
        login(response.data.user, response.data.session.token);
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      setLocalError(message);
      setError(new Error(message));
    } finally {
      setLoading(false);
    }
  };

  console.log(features)

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access the panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>

            {features.register && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
