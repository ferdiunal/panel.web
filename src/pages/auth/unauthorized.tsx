/**
 * Unauthorized Page
 * Shown when user lacks required permissions
 */

import { redirect, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAppStore, useAuthStore } from '@/stores';

export async function loader() {
    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }
    try {
        await useAppStore.getState().init()
    } catch (error) {
        console.error('Register loader error:', error);
        return null;
    }
}


export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access this resource</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account doesn't have the required permissions to access this page.
              Please contact an administrator if you believe this is a mistake.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
              <Button
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
