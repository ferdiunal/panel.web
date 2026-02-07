import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import type { FieldData } from "@/types";
import { Loader2, ExternalLink } from "lucide-react";
import { RelationshipHoverCard } from "../RelationshipHoverCard";

/**
 * BelongsToDetailFieldProps - BelongsTo field için detail sayfası props
 */
interface BelongsToDetailFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

/**
 * BelongsToDetailField - BelongsTo field için detail sayfası component'ı
 *
 * Bu component, BelongsTo ilişkisini detail sayfasında görüntüler.
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
 * <BelongsToDetailField
 *   field={{
 *     key: 'author_id',
 *     name: 'Author',
 *     props: {
 *       related_resource: 'authors',
 *       display_key: 'name',
 *       hover_card: {
 *         enabled: true,
 *         show_avatar: true,
 *         avatar_field: 'avatar',
 *         show_grid: true,
 *         grid_fields: [
 *           { key: 'email', label: 'Email', type: 'email', icon: 'mail' },
 *         ],
 *       },
 *     },
 *   }}
 *   record={{
 *     id: 1,
 *     author_id: 5,
 *   }}
 * />
 * ```
 */
export function BelongsToDetailField({ field, record }: BelongsToDetailFieldProps) {
    const [displayLabel, setDisplayLabel] = useState<string>("");
    const [relatedData, setRelatedData] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);

    // İlişkili kayıt ID'sini al
    const relatedId = record[field.key]?.data || record[field.key];

    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // Display field'ı al
    const displayKey = (field.props?.display_key as string) || 'name';

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    // İlişkili kayıt verilerini fetch et
    useEffect(() => {
        if (!relatedId || !relatedResource) {
            setDisplayLabel("");
            setRelatedData(null);
            return;
        }

        // Eğer record'da ilişkili veri zaten varsa (eager loading), onu kullan
        const nestedData = record[field.key.replace('_id', '')];
        if (nestedData && typeof nestedData === 'object') {
            const label = nestedData[displayKey]?.data || nestedData[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(nestedData);
            return;
        }

        // API'den fetch et
        const fetchRelatedData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/resource/${relatedResource}/${relatedId}`);
                const item = res.data.data;

                // Display label'ı al
                const label = item?.[displayKey]?.data || item?.[displayKey] || `#${relatedId}`;
                setDisplayLabel(label);

                // Hover card için tüm veriyi sakla
                setRelatedData(item);
            } catch (e) {
                console.error('Failed to fetch related data:', e);
                setDisplayLabel(`#${relatedId}`);
                setRelatedData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedData();
    }, [relatedId, relatedResource, displayKey, field.key, record]);

    // İlişkili kayıt yoksa
    if (!relatedId) {
        return <span className="text-muted-foreground">-</span>;
    }

    const finalLabel = displayLabel || `#${relatedId}`;

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Yükleniyor...</span>
            </div>
        );
    }

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
    if (!hoverCardConfig || !hoverCardConfig.enabled || !relatedData) {
        return linkElement;
    }

    // Hover card ile render et
    return (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    );
}
