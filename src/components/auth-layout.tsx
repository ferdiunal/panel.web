/**
 * Auth Layout
 * Ortak auth sayfası layout'u — login, register, forgot-password için.
 * Logo ve site adı dinamik olarak useAppStore'dan okunur.
 * Footer'da hizmet koşulları/gizlilik politikası linkleri useTranslation'dan gelir.
 */
import { Command } from "lucide-react"
import { useAppStore } from "@/stores/app"
import { useTranslation } from "@/hooks/useTranslation"

interface AuthLayoutProps {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { settings } = useAppStore()
    const { t } = useTranslation()

    const siteName = settings?.site_name || "Panel.go"
    const siteLogo = settings?.logo || null

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex items-center gap-2 self-center font-medium">
                    {siteLogo ? (
                        <div className="flex size-6 items-center justify-center rounded-md overflow-hidden">
                            <img src={siteLogo} alt={siteName} className="size-6 object-contain" />
                        </div>
                    ) : (
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Command className="size-4" />
                        </div>
                    )}
                    {siteName}
                </div>
                {children}
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                    {t("auth.terms")
                        .replace("{termsLink}", `<a href="#">${t("auth.termsOfService")}</a>`)
                        .replace("{privacyLink}", `<a href="#">${t("auth.privacyPolicy")}</a>`)
                        .split(/(<a[^>]*>.*?<\/a>)/)
                        .map((part, i) =>
                            part.startsWith("<a") ? (
                                <a key={i} href="#" dangerouslySetInnerHTML={{ __html: part.replace(/<\/?a[^>]*>/g, '') }} />
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        )
                    }
                </div>
            </div>
        </div>
    )
}
