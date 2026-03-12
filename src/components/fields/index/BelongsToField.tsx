import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import type { FieldData } from "@/types";
import { RelationshipHoverCard } from "../RelationshipHoverCard";
import { FieldLayout } from "../FieldLayout";
import { useQuery } from "@tanstack/react-query";

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

    // İlişkili kayıt ID'sini al
    const relatedId = record[field.key]?.data || record[field.key];

    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // Display field'ı al
    const displayKey = (field.props?.display_key as string) || 'name';

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    // Eager loading kontrolü
    const nestedData = record[field.key.replace('_id', '')];
    const hasEagerData = nestedData && typeof nestedData === 'object';

    // React Query: İlişkili kayıt verilerini fetch et
    const { data: fetchedData, isLoading } = useQuery({
        queryKey: ['resource', relatedResource, relatedId],
        queryFn: async () => {
            const res = await axios.get(`/resource/${relatedResource}/${relatedId}`);
            return res.data.data;
        },
        enabled: !!relatedId && !!relatedResource && !hasEagerData,
        staleTime: 5 * 60 * 1000, // 5 dakika cache
    });

    // Data processing
    useEffect(() => {
        if (!relatedId || !relatedResource) {
            setDisplayLabel("");
            setRelatedData(null);
            return;
        }

        // Eğer eager loading varsa, onu kullan
        if (hasEagerData) {
            const label = nestedData[displayKey]?.data || nestedData[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(nestedData);
            return;
        }

        // Fetch edilen veriyi kullan
        if (fetchedData) {
            const label = fetchedData?.[displayKey]?.data || fetchedData?.[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(fetchedData);
        } else if (!isLoading) {
            setDisplayLabel(`#${relatedId}`);
        }
    }, [relatedId, relatedResource, displayKey, hasEagerData, nestedData, fetchedData, isLoading]);

    const finalLabel = displayLabel || (relatedId ? `#${relatedId}` : '');

    // Link element'i oluştur
    const linkElement = relatedId ? (
        <Link
            to={`/resource/${relatedResource}/${relatedId}/show`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
        >
            {isLoading ? '...' : finalLabel}
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
