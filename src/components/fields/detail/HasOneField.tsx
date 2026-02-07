import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { FieldData } from "@/types";
import { ExternalLink } from "lucide-react";
import { RelationshipHoverCard } from "../RelationshipHoverCard";

/**
 * HasOneDetailFieldProps - HasOne field için detail sayfası props
 */
interface HasOneDetailFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

/**
 * HasOneDetailField - HasOne field için detail sayfası component'ı
 *
 * Bu component, HasOne ilişkisini detail sayfasında görüntüler.
 * Hover card desteği ile ilişkili kaydın detaylarını gösterir.
 *
 * # Özellikler
 *
 * - **Hover Card**: Backend'den gelen config ile hover card desteği
 * - **Link**: İlişkili kaydın detail sayfasına yönlendirme
 * - **External Link Icon**: Dış link ikonu ile görsel feedback
 * - **Loading State**: Yükleme durumu gösterimi
 * - **Display Field**: Backend'den gelen display field'ı kullanır
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <HasOneDetailField
 *   field={{
 *     key: 'profile',
 *     name: 'Profile',
 *     props: {
 *       related_resource: 'profiles',
 *       hover_card: {
 *         enabled: true,
 *         show_avatar: true,
 *         avatar_field: 'avatar',
 *         show_grid: true,
 *         grid_fields: [
 *           { key: 'bio', label: 'Bio', type: 'text' },
 *         ],
 *       },
 *     },
 *   }}
 *   record={{
 *     id: 1,
 *     profile: { id: 5, bio: 'Developer' },
 *   }}
 * />
 * ```
 */
export function HasOneDetailField({ field, record }: HasOneDetailFieldProps) {
    const [displayLabel, setDisplayLabel] = useState<string>("");
    const [relatedData, setRelatedData] = useState<Record<string, any> | null>(null);

    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // Display field'ı al (varsayılan: name)
    const displayKey = (field.props?.display_key as string) || 'name';

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    // İlişkili kayıt verilerini al
    useEffect(() => {
        if (!relatedResource) {
            setDisplayLabel("");
            setRelatedData(null);
            return;
        }

        // Eğer record'da ilişkili veri zaten varsa (eager loading), onu kullan
        const nestedData = record[field.key];
        if (nestedData && typeof nestedData === 'object') {
            const relatedId = nestedData.id?.data || nestedData.id;
            const label = nestedData[displayKey]?.data || nestedData[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(nestedData);
            return;
        }

        // HasOne için API'den fetch etmek gerekebilir
        // Ancak genellikle eager loading ile gelir
        setDisplayLabel("");
        setRelatedData(null);
    }, [relatedResource, displayKey, field.key, record]);

    // İlişkili kayıt yoksa
    if (!relatedData) {
        return <span className="text-muted-foreground">-</span>;
    }

    const relatedId = relatedData.id?.data || relatedData.id;
    const finalLabel = displayLabel || `#${relatedId}`;

    // Link element'i oluştur
    const linkElement = (
        <Link
            to={`/resources/${relatedResource}/${relatedId}`}
            className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
        >
            {finalLabel}
            <ExternalLink className="h-3.5 w-3.5" />
        </Link>
    );

    // Hover card devre dışıysa veya config yoksa sadece link'i render et
    if (!hoverCardConfig || !hoverCardConfig.enabled) {
        return linkElement;
    }

    // Hover card ile render et
    return (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    );
}
