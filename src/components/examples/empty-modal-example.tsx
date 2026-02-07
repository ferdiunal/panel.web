/**
 * Empty Component Kullanım Örnekleri
 *
 * Bu dosya, Empty componentinin Responsive Modal ve diğer senaryolarda
 * nasıl kullanılacağını gösteren örnek implementasyonları içerir.
 *
 * @example
 * ```tsx
 * import { EmptyModalExample } from '@/components/examples/empty-modal-example'
 *
 * // Boş modal içeriği
 * <EmptyModalExample />
 * ```
 */

import { ResponsiveModal } from "@/components/ui/responsive-modal"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Database, FileX, Search, Inbox } from "lucide-react"

/**
 * Boş Modal İçeriği Örneği
 *
 * Modal içinde veri bulunamadığında gösterilecek Empty component örneği.
 * Kullanıcıya durumu açıklayan ve eylem seçenekleri sunan bir arayüz sağlar.
 */
export function EmptyModalExample() {
    return (
        <ResponsiveModal
            title="Kayıt Detayları"
            description="Seçili kaydın detay bilgileri"
            trigger={<Button>Modal Aç</Button>}
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Database className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Veri Bulunamadı</EmptyTitle>
                    <EmptyDescription>
                        Seçili kayıt için detay bilgisi bulunamadı. Kayıt silinmiş veya erişim izniniz olmayabilir.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" className="w-full">
                        Listeye Dön
                    </Button>
                </EmptyContent>
            </Empty>
        </ResponsiveModal>
    )
}

/**
 * Boş Arama Sonucu Modal Örneği
 *
 * Arama sonucunda hiç kayıt bulunamadığında gösterilecek Empty component.
 * Kullanıcıya alternatif arama önerileri sunar.
 */
export function EmptySearchModalExample() {
    return (
        <ResponsiveModal
            title="Arama Sonuçları"
            description="Arama kriterlerinize uygun sonuçlar"
            trigger={<Button>Arama Sonuçları</Button>}
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Search className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Sonuç Bulunamadı</EmptyTitle>
                    <EmptyDescription>
                        Arama kriterlerinize uygun kayıt bulunamadı. Farklı anahtar kelimeler veya filtreler deneyebilirsiniz.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button className="w-full">
                        Yeni Arama Yap
                    </Button>
                </EmptyContent>
            </Empty>
        </ResponsiveModal>
    )
}

/**
 * Boş Dosya Listesi Modal Örneği
 *
 * Dosya yükleme veya listeleme modalında hiç dosya olmadığında gösterilir.
 * Kullanıcıya dosya yükleme seçeneği sunar.
 */
export function EmptyFileListModalExample() {
    return (
        <ResponsiveModal
            title="Dosyalar"
            description="Yüklenen dosyaların listesi"
            trigger={<Button>Dosyaları Görüntüle</Button>}
            variant="sheet"
            side="right"
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileX className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Henüz Dosya Yok</EmptyTitle>
                    <EmptyDescription>
                        Bu kayıt için henüz dosya yüklenmemiş. Dosya yüklemek için aşağıdaki butonu kullanabilirsiniz.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button className="w-full">
                        Dosya Yükle
                    </Button>
                </EmptyContent>
            </Empty>
        </ResponsiveModal>
    )
}

/**
 * Boş Bildirim Modal Örneği
 *
 * Bildirim listesinde hiç bildirim olmadığında gösterilir.
 * Kullanıcıya durumu pozitif bir şekilde iletir.
 */
export function EmptyNotificationModalExample() {
    return (
        <ResponsiveModal
            title="Bildirimler"
            description="Tüm bildirimleriniz"
            trigger={<Button>Bildirimleri Görüntüle</Button>}
            variant="drawer"
        >
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Inbox className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Tüm Bildirimler Okundu</EmptyTitle>
                    <EmptyDescription>
                        Harika! Şu anda okunmamış bildiriminiz bulunmuyor. Yeni bildirimler geldiğinde burada görünecek.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </ResponsiveModal>
    )
}

/**
 * Outline Stil ile Boş Modal Örneği
 *
 * Border utility sınıfları kullanarak outline stil Empty component.
 * Daha belirgin bir görsel ayrım sağlar.
 */
export function EmptyModalOutlineExample() {
    return (
        <ResponsiveModal
            title="Kayıt Detayları"
            trigger={<Button variant="outline">Outline Stil</Button>}
        >
            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Database className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Veri Bulunamadı</EmptyTitle>
                    <EmptyDescription>
                        Bu kayıt için detay bilgisi mevcut değil.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" className="w-full">
                        Geri Dön
                    </Button>
                </EmptyContent>
            </Empty>
        </ResponsiveModal>
    )
}

/**
 * Arka Plan Renkli Boş Modal Örneği
 *
 * Background gradient kullanarak görsel olarak zenginleştirilmiş Empty component.
 * Özel durumlar veya vurgu gerektiren senaryolar için uygundur.
 */
export function EmptyModalBackgroundExample() {
    return (
        <ResponsiveModal
            title="Özel Durum"
            trigger={<Button variant="outline">Arka Plan Renkli</Button>}
        >
            <Empty className="bg-gradient-to-br from-muted/50 to-muted/20 border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Database className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Özel Durum</EmptyTitle>
                    <EmptyDescription>
                        Bu alan özel bir durum için ayrılmıştır ve şu anda içerik bulunmamaktadır.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        </ResponsiveModal>
    )
}
