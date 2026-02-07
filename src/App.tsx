import { createBrowserRouter, RouterProvider, Navigate, Outlet, redirect } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/sonner"
import LoginPage, {loader as loginloader} from "@/pages/auth/login"
import RegisterPage, { loader as registerLoader } from "@/pages/auth/register"
import ForgotPasswordPage, { loader as forgotPasswordLoader } from "@/pages/auth/forgot-password"
import UnauthorizedPage, { loader as unauthorizedLoader } from "@/pages/auth/unauthorized"
import { useAuthStore } from "@/stores/auth"
import { useAppStore } from "@/stores/app"
import DashboardLayout from "@/layouts/dashboard-layout"
import ResourceIndexPage, { loader as resourceLoader } from "@/pages/resource/index"
import SettingsPage, { loader as settingsLoader } from "@/pages/settings/index"
import PageViewer, { loader as pageViewerLoader } from "@/pages/common/page-viewer"
import { usePageTitle } from "@/hooks/use-page-title"
import { GlobalLoader } from "@/components/global-loader"
import { ErrorPage } from "@/pages/error"
import { ThemeProvider } from "@/components/theme-provider"

// Protected Route Wrapper Component
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <GlobalLoader />
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        hydrateFallbackElement: <GlobalLoader />,
        children: [
            {
                index: true,
                loader: async () => {
                    try {
                        const { isAuthenticated } = useAuthStore.getState()
                        return redirect(isAuthenticated ? "/dashboard" : "/login")
                    } catch (error) {
                        console.error('Index loader error:', error)
                        return redirect("/login")
                    }
                }
            },
            {
                path: "/login",
                element: <LoginPage />,
                loader: loginloader,
                handle: {
                    title: () => {
                        try {
                            const { settings } = useAppStore.getState()
                            const siteName = settings.site_name || "Panel"
                            return `Giriş Yap | ${siteName}`
                        } catch {
                            return "Giriş Yap | Panel"
                        }
                    }
                }
            },
            {
                path: "/register",
                element: <RegisterPage />,
                loader: registerLoader,
                handle: {
                    title: () => {
                        try {
                            const { settings } = useAppStore.getState()
                            const siteName = settings.site_name || "Panel"
                            return `Kayıt Ol | ${siteName}`
                        } catch {
                            return "Kayıt Ol | Panel"
                        }
                    }
                }
            },
            {
                path: "/forgot-password",
                element: <ForgotPasswordPage />,
                loader: forgotPasswordLoader,
                handle: {
                    title: () => {
                        try {
                            const { settings } = useAppStore.getState()
                            const siteName = settings.site_name || "Panel"
                            return `Şifremi Unuttum | ${siteName}`
                        } catch {
                            return "Şifremi Unuttum | Panel"
                        }
                    }
                }
            },
            {
                path: "/unauthorized",
                element: <UnauthorizedPage />,
                loader: unauthorizedLoader,
                handle: {
                    title: () => {
                        try {
                            const { settings } = useAppStore.getState()
                            const siteName = settings.site_name || "Panel"
                            return `Yetkisiz Erişim | ${siteName}`
                        } catch {
                            return "Yetkisiz Erişim | Panel"
                        }
                    }
                }
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
                                handle: {
                                    title: () => {
                                        try {
                                            const { settings } = useAppStore.getState()
                                            const siteName = settings.site_name || "Panel"
                                            return `Ayarlar | ${siteName}`
                                        } catch {
                                            return "Ayarlar | Panel"
                                        }
                                    }
                                }
                            },
                            {
                                path: "/resource/:resource",
                                element: <ResourceIndexPage />,
                                loader: resourceLoader,
                                handle: {
                                    title: (params: any) => {
                                        try {
                                            const { settings } = useAppStore.getState()
                                            const siteName = settings.site_name || "Panel"
                                            return `${capitalize(params.resource || "")} | ${siteName}`
                                        } catch {
                                            return `${capitalize(params.resource || "")} | Panel`
                                        }
                                    }
                                }
                            },

                            // {
                            //     path: "/resource/:resource",
                            //     element: <ResourceIndexPage />,
                            //     loader: resourceLoader,
                            //     handle: {
                            //         title: (params: any) => {
                            //             try {
                            //                 const { settings } = useAppStore.getState()
                            //                 const siteName = settings.site_name || "Panel"
                            //                 return `${capitalize(params.resource || "")} | ${siteName}`
                            //             } catch {
                            //                 return `${capitalize(params.resource || "")} | Panel`
                            //             }
                            //         }
                            //     }
                            // },
                            {
                                path: "/:page",
                                element: <PageViewer />,
                                loader: pageViewerLoader,
                                handle: {
                                    title: (params: any) => {
                                        try {
                                            const { settings } = useAppStore.getState()
                                            const siteName = settings.site_name || "Panel"
                                            return `${capitalize(params.page || "")} | ${siteName}`
                                        } catch {
                                            return `${capitalize(params.page || "")} | Panel`
                                        }
                                    }
                                }
                            },
                        ]
                    }
                ]
            },
            {
                path: "*",
                element: <ErrorPage code={404} title="Sayfa Bulunamadı" description="Aradığınız sayfa mevcut değil veya taşınmış olabilir." />,
                handle: { title: "404 | Sayfa Bulunamadı" }
            }
        ]
    }
])

const queryClient = new QueryClient()

export default function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="panel-ui-theme">
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
    )
}