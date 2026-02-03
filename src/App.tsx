import { createBrowserRouter, RouterProvider, Navigate, Outlet, redirect } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/sonner"
import LoginPage, { loader as loginLoader } from "@/pages/auth/login"
import RegisterPage, { loader as registerLoader } from "@/pages/auth/register"
import ForgotPasswordPage, { loader as forgotPasswordLoader } from "@/pages/auth/forgot-password"
import { useAuthStore } from "@/stores/auth"
import DashboardLayout from "@/layouts/dashboard-layout"
import ResourceIndexPage, { loader as resourceLoader } from "@/pages/resource/index"
import SettingsPage, { loader as settingsLoader } from "@/pages/settings/index"
import PageViewer, { loader as pageViewerLoader } from "@/pages/common/page-viewer"
import { usePageTitle } from "@/hooks/use-page-title"
import { GlobalLoader } from "@/components/global-loader"

// Protected Route Wrapper Component
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <div>Yükleniyor...</div>
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

// Public Route (just passes through, but allows loaders)
// We need a Layout to handle global things like Toaster
const RootLayout = () => {
    usePageTitle()
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}

const rootLoader = async () => {
    await useAuthStore.getState().checkSession()
    return null
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        loader: rootLoader,
        hydrateFallbackElement: <GlobalLoader />,
        children: [
            {
                index: true,
                loader: () => {
                    const { isAuthenticated } = useAuthStore.getState()
                    return redirect(isAuthenticated ? "/dashboard" : "/login")
                }
            },
            {
                path: "/login",
                element: <LoginPage />,
                loader: loginLoader,
                handle: { title: "Giriş Yap | Panel" }
            },
            {
                path: "/register",
                element: <RegisterPage />,
                loader: registerLoader,
                handle: { title: "Kayıt Ol | Panel" }
            },
            {
                path: "/forgot-password",
                element: <ForgotPasswordPage />,
                loader: forgotPasswordLoader,
                handle: { title: "Şifremi Unuttum | Panel" }
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <DashboardLayout />,
                        children: [
                            {
                                path: "/settings",
                                element: <SettingsPage />,
                                loader: settingsLoader,
                                handle: { title: "Settings | Panel" }
                            },
                            {
                                path: "/resource/:resource",
                                element: <ResourceIndexPage />,
                                loader: resourceLoader,
                                handle: {
                                    title: (params: any) => `${capitalize(params.resource || "")} | Panel`
                                }
                            },
                            {
                                path: "/:page",
                                element: <PageViewer />,
                                loader: pageViewerLoader,
                                handle: {
                                    title: (params: any) => `${capitalize(params.page || "")} | Panel`
                                }
                            },
                        ]
                    }
                ]
            }
        ]
    }
])

const queryClient = new QueryClient()

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    )
}