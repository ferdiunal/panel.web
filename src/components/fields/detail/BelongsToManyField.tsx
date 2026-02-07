import { Link } from "react-router-dom";
import type { FieldData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

/**
 * BelongsToManyDetailFieldProps - BelongsToMany field için detail sayfası props
 */
interface BelongsToManyDetailFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

/**
 * BelongsToManyDetailField - BelongsToMany field için detail sayfası component'ı
 *
 * Bu component, BelongsToMany ilişkisini detail sayfasında görüntüler.
 * İlişkili kayıtların sayısını ve listesini gösterir.
 *
 * # Özellikler
 *
 * - **Count Badge**: İlişkili kayıt sayısını gösterir
 * - **Link**: İlişkili kayıtların listesine yönlendirme
 * - **External Link Icon**: Dış link ikonu ile görsel feedback
 * - **Display Field**: Backend'den gelen display field'ı kullanır
 * - **Item Links**: Her bir kayıt için ayrı link
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <BelongsToManyDetailField
 *   field={{
 *     key: 'roles',
 *     name: 'Roles',
 *     props: {
 *       related_resource: 'roles',
 *     },
 *   }}
 *   record={{
 *     id: 1,
 *     roles: [
 *       { id: 1, name: 'Admin' },
 *       { id: 2, name: 'Editor' },
 *     ],
 *   }}
 * />
 * ```
 */
export function BelongsToManyDetailField({ field, record }: BelongsToManyDetailFieldProps) {
    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // İlişkili kayıtları al
    const relatedData = record[field.key];

    // Kayıt sayısını hesapla
    let count = 0;
    let items: any[] = [];

    if (Array.isArray(relatedData)) {
        count = relatedData.length;
        items = relatedData;
    } else if (relatedData && typeof relatedData === 'object') {
        // Eğer data property'si varsa (JSON:API format)
        const data = (relatedData as any).data;
        if (Array.isArray(data)) {
            count = data.length;
            items = data;
        }
    }

    // İlişkili kayıt yoksa
    if (count === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    // Ana kaydın ID'sini al
    const recordId = record.id?.data || record.id;

    // Display field'ı al (varsayılan: name)
    const displayKey = (field.props?.display_key as string) || 'name';

    return (
        <div className="flex flex-col gap-2">
            <Link
                to={`/resources/${relatedResource}?filter[${field.key}]=${recordId}`}
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
                <Badge variant="secondary" className="font-normal">
                    {count}
                </Badge>
                <span>{count} kayıt</span>
                <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Tüm kayıtları göster (badge olarak) */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                        const itemId = item.id?.data || item.id;
                        const itemLabel = item[displayKey]?.data || item[displayKey] || `#${itemId}`;

                        return (
                            <Link
                                key={itemId}
                                to={`/resources/${relatedResource}/${itemId}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-accent transition-colors"
                                >
                                    {itemLabel}
                                </Badge>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
