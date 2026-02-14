import { useAppStore } from "@/stores/app";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSelector() {
    const { i18n } = useAppStore();

    // i18n config yoksa veya desteklenen dil sayısı 1'den azsa gösterme
    if (!i18n || !i18n.supported_languages || i18n.supported_languages.length <= 1) {
        return null;
    }

    const currentLang = i18n.lang;

    const changeLanguage = (newLang: string) => {
        const currentPath = window.location.pathname;
        const defaultLang = i18n.default_language;

        // Mevcut dil prefix'ini kaldır
        let cleanPath = currentPath;
        i18n.supported_languages.forEach((lang) => {
            const prefix = `/api/${lang.code}`;
            if (currentPath.startsWith(prefix)) {
                cleanPath = currentPath.substring(prefix.length);
            }
        });

        // Yeni dil prefix'ini ekle (varsayılan dil değilse ve URL prefix kullanılıyorsa)
        let newPath = cleanPath;
        if (i18n.use_url_prefix && (!i18n.url_prefix_optional || newLang !== defaultLang)) {
            newPath = `/api/${newLang}${cleanPath}`;
        }

        // Cookie'ye kaydet
        document.cookie = `lang=${newLang}; path=/; max-age=31536000`;

        // URL'yi değiştir ve sayfayı yenile
        window.location.href = newPath;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Dil Seçimi</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {i18n.supported_languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={currentLang === lang.code ? "bg-accent" : ""}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
