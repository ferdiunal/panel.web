import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Loader2, ExternalLink } from "lucide-react";
import { FieldLayout } from "../FieldLayout";
import type { DetailFieldProps } from "@/types"; // DetailFieldProps kullan
import { RelationshipHoverCard } from "../RelationshipHoverCard";
import { useQuery } from "@tanstack/react-query";

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
export function BelongsToDetailField({ field, record, onResourceClick }: DetailFieldProps) {
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

    // Options ve eager loading kontrolü
    const hasOptions = !!field.props?.options;
    const nestedData = record[field.key.replace('_id', '')];
    const hasEagerData = nestedData && typeof nestedData === 'object';

    // React Query: İlişkili kayıt verilerini fetch et
    const { data: fetchedData, isLoading } = useQuery({
        queryKey: ['resource', relatedResource, relatedId],
        queryFn: async () => {
            const res = await axios.get(`/resource/${relatedResource}/${relatedId}`);
            return res.data.data;
        },
        enabled: !!relatedId && !!relatedResource && !hasOptions && !hasEagerData,
        staleTime: 5 * 60 * 1000, // 5 dakika cache
    });

    // Data processing
    useEffect(() => {
        if (!relatedId || !relatedResource) {
            setDisplayLabel("");
            setRelatedData(null);
            return;
        }

        // 1. Önce props.options kontrol et
        if (field.props?.options) {
            const options = field.props.options as Record<string, string> | Array<{label: string, value: any}>;

            if (Array.isArray(options)) {
                const option = options.find(opt => String(opt.value) === String(relatedId));
                if (option) {
                    setDisplayLabel(option.label);
                    return;
                }
            } else {
                const label = options[String(relatedId)];
                if (label) {
                    setDisplayLabel(label);
                    return;
                }
            }
        }

        // 2. Eğer eager loading varsa, onu kullan
        if (hasEagerData) {
            const label = nestedData[displayKey]?.data || nestedData[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(nestedData);
            return;
        }

        // 3. Fetch edilen veriyi kullan
        if (fetchedData) {
            const label = fetchedData?.[displayKey]?.data || fetchedData?.[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(fetchedData);
        } else if (!isLoading) {
            setDisplayLabel(`#${relatedId}`);
        }
    }, [relatedId, relatedResource, displayKey, field.props?.options, hasEagerData, nestedData, fetchedData, isLoading]);

    const finalLabel = displayLabel || (relatedId ? `#${relatedId}` : '');

    // Link element'i oluştur
    const linkElement = isLoading ? (
        <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Yükleniyor...</span>
        </div>
    ) : relatedId ? (
        onResourceClick ? (
            <button
                type="button"
                onClick={() => onResourceClick(relatedResource, relatedId)}
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
            >
                {finalLabel}
                <ExternalLink className="h-3.5 w-3.5" />
            </button>
        ) : (
            <Link
                to={`/resource/${relatedResource}/${relatedId}/show`}
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
                {finalLabel}
                <ExternalLink className="h-3.5 w-3.5" />
            </Link>
        )
    ) : (
        <span className="text-muted-foreground">—</span>
    );

    // Hover card ile wrap et (eğer aktifse ve veri varsa)
    const content = hoverCardConfig && hoverCardConfig.enabled && relatedData && !isLoading ? (
        <RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
            {linkElement}
        </RelationshipHoverCard>
    ) : (
        linkElement
    );

    return (
        <FieldLayout
            name={field.key}
            label={field.label || field.name}
            helpText={field.help_text}
        >
            {content}
        </FieldLayout>
    );
}
