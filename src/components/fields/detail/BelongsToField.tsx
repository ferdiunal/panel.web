import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/lib/axios";
import { Loader2, ExternalLink } from "lucide-react";
import { FieldLayout } from "../FieldLayout";
import type { DetailFieldProps } from "@/types"; // DetailFieldProps kullan
import { RelationshipHoverCard } from "../RelationshipHoverCard";

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
    const [loading, setLoading] = useState(false);

    // İlişkili kayıt ID'sini al
    const relatedId = record[field.key]?.data || record[field.key];

    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // Display field'ı al
    const displayKey = (field.props?.display_key as string) || 'name';

    // Hover card config'ini al
    const hoverCardConfig = field.props?.hover_card as any;

    // İlişkili kayıt verilerini fetch et veya options'dan al
    useEffect(() => {
        if (!relatedId || !relatedResource) {
            setDisplayLabel("");
            setRelatedData(null);
            return;
        }

        // 1. Önce props.options kontrol et (En hızlı yöntem)
        // Backend bazen options içinde { "16": "Test Şirket" } gibi veriyi gönderiyor
        if (field.props?.options) {
            const options = field.props.options as Record<string, string> | Array<{label: string, value: any}>;
            
            // Array format: [{label: 'Test', value: 16}]
            if (Array.isArray(options)) {
                const option = options.find(opt => String(opt.value) === String(relatedId));
                if (option) {
                    setDisplayLabel(option.label);
                    return;
                }
            } 
            // Object format: { "16": "Test" }
            else {
                const label = options[String(relatedId)];
                if (label) {
                    setDisplayLabel(label);
                    return;
                }
            }
        }

        // 2. Eğer record'da ilişkili veri zaten varsa (eager loading), onu kullan
        const nestedData = record[field.key.replace('_id', '')];
        if (nestedData && typeof nestedData === 'object') {
            const label = nestedData[displayKey]?.data || nestedData[displayKey] || `#${relatedId}`;
            setDisplayLabel(label);
            setRelatedData(nestedData);
            return;
        }

        // 3. Hiçbiri yoksa API'den fetch et
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
    }, [relatedId, relatedResource, displayKey, field.key, record, field.props?.options]);

    const finalLabel = displayLabel || (relatedId ? `#${relatedId}` : '');

    // Link element'i oluştur
    // Detay sayfası olmadığı için listeleme sayfasına yönlendirip query param ile modalı açıyoruz
    // Veya onResourceClick varsa onu kullanıyoruz (modal içinde modal açmak yerine content değiştirme)
    const linkElement = loading ? (
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
    const content = hoverCardConfig && hoverCardConfig.enabled && relatedData && !loading ? (
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
