import type { FieldData } from "@/types";
import { RelationshipTable } from "@/components/RelationshipTable";

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
 * Bu component, BelongsToMany ilişkisini detail sayfasında tablo formatında görüntüler.
 * Laravel Nova'nın yaklaşımına uygun olarak ResourceIndex (tablo) kullanır.
 *
 * # Özellikler
 *
 * - **Tablo Gösterimi**: İlişkili kayıtları tablo formatında gösterir
 * - **Pagination**: Sayfalama desteği (varsayılan 5 kayıt)
 * - **Sorting**: Sütun bazlı sıralama
 * - **Filtering**: Sütun bazlı filtreleme
 * - **Collapsable**: Açılır/kapanır panel
 * - **Attach Button**: Yeni kayıt ekleme butonu (opsiyonel)
 * - **Actions**: View/Edit/Delete/Detach işlemleri
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
 *   }}
 * />
 * ```
 */
export function BelongsToManyDetailField({ field, record }: BelongsToManyDetailFieldProps) {
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
            viaResource={field.props?.via_resource as string || 'unknown'}
            viaResourceId={recordId}
            viaRelationship={field.key}
            relationshipType="belongsToMany"
            title={field.name || field.label}
            collapsable={true}
            defaultOpen={true}
            showAttachButton={true}
            perPageOptions={[5, 10, 25]}
            defaultPerPage={5}
        />
    );
}
