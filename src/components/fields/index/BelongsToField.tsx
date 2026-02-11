import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import type { FieldData } from "@/types";
import { RelationshipHoverCard } from "../RelationshipHoverCard";
import { FieldLayout } from "../FieldLayout";

/**
 * BelongsToIndexFieldProps - BelongsTo field için index sayfası props
 */
interface BelongsToIndexFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

/**
 * BelongsToIndexField - BelongsTo field için index sayfası component'ı
 *
 * Bu component, BelongsTo ilişkisini index sayfasında görüntüler.
 * Hover card desteği ile ilişkili kaydın detaylarını gösterir.
 *
 * # Özellikler
 *
 * - **Hover Card**: Backend'den gelen config ile hover card desteği
 * - **Link**: İlişkili kaydın detail sayfasına yönlendirme
 * - **Lazy Loading**: İlişkili kayıt verilerini ihtiyaç anında yükler
 * - **Display Field**: Backend'den gelen display field'ı kullanır
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <BelongsToIndexField
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
export function BelongsToIndexField({ field, record }: BelongsToIndexFieldProps) {
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

    const finalLabel = displayLabel || (relatedId ? `#${relatedId}` : '');

    // Link element'i oluştur
    const linkElement = relatedId ? (
        <Link
            to={`/resources/${relatedResource}/${relatedId}`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
        >
            {loading ? '...' : finalLabel}
        </Link>
    ) : (
        <span className="text-muted-foreground text-sm">—</span>
    );

    // Hover card ile wrap et (eğer aktifse ve veri varsa)
    const content = hoverCardConfig && hoverCardConfig.enabled && relatedData ? (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    ) : (
        linkElement
    );

    return (
        <FieldLayout
            name={field.key}
            label={field.name || field.label}
            helpText={field.help_text}
            hideLabel={true}
        >
            {content}
        </FieldLayout>
    );
}
