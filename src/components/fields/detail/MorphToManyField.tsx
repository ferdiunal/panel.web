/**
 * MorphToManyDetailField - Mikro Frontend Pattern
 * Polymorphic many-to-many relationship display
 * 
 * Bu component, MorphToMany ilişkisini detail sayfasında tablo formatında görüntüler.
 * Bu yaklaşımda ResourceIndex (tablo) kullanır.
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
 */

import React from 'react';
import type { DetailFieldProps } from '@/types';
import { RelationshipTable } from '@/components/RelationshipTable';

export const MorphToManyDetailField: React.FC<DetailFieldProps> = ({ field, record, resourceName }) => {
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
      relationshipType="morphToMany"
      title={field.name || field.label}
      collapsable={true}
      defaultOpen={true}
      showAttachButton={true}
      perPageOptions={[5, 10, 25]}
      defaultPerPage={5}
    />
  );
};

MorphToManyDetailField.displayName = 'MorphToManyDetailField';
