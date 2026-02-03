"use client"

import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

interface ErrorPageProps {
    code: number
    title: string
    description: string
    showRefresh?: boolean
}

export function ErrorPage({ code, title, description, showRefresh = false }: ErrorPageProps) {
    const getErrorIcon = () => {
        switch (code) {
            case 404:
                return (
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                        <path d="M8 8l6 6" strokeLinecap="round" />
                        <path d="M14 8l-6 6" strokeLinecap="round" />
                    </svg>
                )
            case 403:
                return (
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                )
            case 500:
                return (
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 9v4" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                )
            case 503:
                return (
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                )
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Animated Error Icon */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span className="text-[200px] md:text-[280px] font-bold text-foreground leading-none select-none">
                            {code}
                        </span>
                    </div>
                    <div className="relative z-10 flex items-center justify-center py-16">
                        {getErrorIcon()}
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance">
                        {title}
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
                        {description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button asChild variant="default" size="lg" className="gap-2">
                        <Link to="/">
                            <Home className="w-4 h-4" />
                            Ana Sayfa
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Geri Dön
                    </Button>
                    {showRefresh && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="gap-2"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Yenile
                        </Button>
                    )}
                </div>

                {/* Error Code Badge */}
                <div className="pt-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        Hata Kodu: {code}
                    </span>
                </div>
            </div>
        </div>
    )
}
