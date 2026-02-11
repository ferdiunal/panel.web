import { Link } from "react-router-dom";
import type { FieldData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FieldLayout } from "../FieldLayout";

/**
 * HasManyIndexFieldProps - HasMany field için index sayfası props
 */
interface HasManyIndexFieldProps {
    field: FieldData;
    record: Record<string, any>;
}

/**
 * HasManyIndexField - HasMany field için index sayfası component'ı
 *
 * Bu component, HasMany ilişkisini index sayfasında görüntüler.
 * İlişkili kayıtların sayısını badge olarak gösterir ve tıklanabilir link sağlar.
 *
 * # Özellikler
 *
 * - **Count Badge**: İlişkili kayıt sayısını gösterir
 * - **Link**: İlişkili kayıtların listesine yönlendirme
 * - **Eager Loading**: İlişkili kayıt verilerini eager loading ile alır
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <HasManyIndexField
 *   field={{
 *     key: 'posts',
 *     name: 'Posts',
 *     props: {
 *       related_resource: 'posts',
 *     },
 *   }}
 *   record={{
 *     id: 1,
 *     posts: [{ id: 1 }, { id: 2 }, { id: 3 }],
 *   }}
 * />
 * ```
 */
export function HasManyIndexField({ field, record }: HasManyIndexFieldProps) {
    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // İlişkili kayıtları al
    const relatedData = record[field.key];

    // Kayıt sayısını hesapla
    let count = 0;
    if (Array.isArray(relatedData)) {
        count = relatedData.length;
    } else if (relatedData && typeof relatedData === 'object') {
        // Eğer data property'si varsa (JSON:API format)
        const data = (relatedData as any).data;
        if (Array.isArray(data)) {
            count = data.length;
        }
    }

    // Ana kaydın ID'sini al
    const recordId = record.id?.data || record.id;

    // Link element'i oluştur
    const content = count === 0 ? (
        <span className="text-muted-foreground text-sm">—</span>
    ) : (
        <Link
            to={`/resources/${relatedResource}?filter[${field.key}]=${recordId}`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
        >
            <Badge variant="secondary" className="font-normal">
                {count}
            </Badge>
            <span>{count === 1 ? 'kayıt' : 'kayıt'}</span>
        </Link>
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
