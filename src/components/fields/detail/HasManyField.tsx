import type { DetailFieldProps } from "@/types";
import { RelationshipTable } from "@/components/RelationshipTable";

/**
 * HasManyDetailFieldProps - HasMany field için detail sayfası props
 */
/**
 * HasManyDetailField - HasMany field için detail sayfası component'ı
 *
 * Bu component, HasMany ilişkisini detail sayfasında tablo formatında görüntüler.
 * Bu yaklaşımda ResourceIndex (tablo) kullanır.
 *
 * # Özellikler
 *
 * - **Tablo Gösterimi**: İlişkili kayıtları tablo formatında gösterir
 * - **Pagination**: Sayfalama desteği (varsayılan 5 kayıt)
 * - **Sorting**: Sütun bazlı sıralama
 * - **Filtering**: Sütun bazlı filtreleme
 * - **Collapsable**: Açılır/kapanır panel
 * - **Actions**: View/Edit/Delete işlemleri
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <HasManyDetailField
 *   field={{
 *     key: 'posts',
 *     name: 'Posts',
 *     props: {
 *       related_resource: 'posts',
 *     },
 *   }}
 *   record={{
 *     id: 1,
 *   }}
 * />
 * ```
 */
export function HasManyDetailField({ field, record, resourceName }: DetailFieldProps) {
    // İlişkili resource slug'ını al
    const relatedResource = field.props?.related_resource as string;

    // Ana kaydın ID'sini al
    const recordId = record.id?.data || record.id;

    // Eğer related_resource yoksa, basit gösterim yap
    if (!relatedResource || !recordId) {
        return null;
    }

    return (
        <RelationshipTable
            resourceType={relatedResource}
            viaResource={(field.props?.via_resource as string)?.trim() && (field.props?.via_resource as string).toLowerCase() !== 'unknown' ? (field.props?.via_resource as string) : (resourceName || 'unknown')}
            viaResourceId={recordId}
            viaRelationship={field.key}
            relationshipType="hasMany"
            title={field.label || field.name}
            collapsable={true}
            defaultOpen={true}
            perPageOptions={[5, 10, 25]}
            defaultPerPage={5}
        />
    );
}
