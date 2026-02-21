import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { UniversalResourceForm } from '@/components/forms/UniversalResourceForm';
import { toast } from 'sonner';
import type { FieldDefinition } from '@/types/form';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickCreateModalProps {
  resourceSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (createdResource: any) => void;
  parentResourceId?: string | number; // Parent resource ID (edit modunda kullanılır)
  parentResourceSlug?: string; // Parent resource slug (form resourceType)
  depth?: number; // Nested modal depth kontrolü için (default: 0)
}

const normalizeResourceToken = (value: string): string => (
  value.trim().toLowerCase().replace(/[_\s]+/g, '-')
);

const toSnakeCase = (value: string): string => (
  normalizeResourceToken(value).replace(/-/g, '_')
);

const singularizeToken = (value: string): string => {
  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
};

const isMorphToFieldDefinition = (field: any): boolean => {
  const view = typeof field?.view === 'string' ? field.view : '';
  const type = typeof field?.type === 'string' ? field.type : '';
  return view.startsWith('morph-to-field') || type === 'morph-to';
};

const resolveMorphTypeForResource = (
  field: any,
  normalizedCurrentResource: string
): string | undefined => {
  const rawTypes = field?.props?.types;
  if (!Array.isArray(rawTypes)) return undefined;

  const matched = rawTypes.find((typeDef: any) => {
    const slug = typeof typeDef?.slug === 'string' ? normalizeResourceToken(typeDef.slug) : '';
    return slug === normalizedCurrentResource;
  });

  const typeValue = matched?.value;
  if (typeValue === undefined || typeValue === null || String(typeValue).trim().length === 0) {
    return undefined;
  }

  return String(typeValue);
};

const resolveParentFieldAssignments = (
  fields: any[],
  currentResource?: string,
  parentResourceId?: string | number
): Record<string, unknown> => {
  if (!currentResource || !Array.isArray(fields) || parentResourceId === undefined || parentResourceId === null) {
    return {};
  }

  const normalizedCurrentResource = normalizeResourceToken(currentResource);
  const assignments: Record<string, unknown> = {};

  fields.forEach((field: any) => {
    const key = typeof field?.key === 'string' ? field.key : '';
    if (!key) return;

    const relatedResource = field?.props?.related_resource;
    if (
      typeof relatedResource === 'string' &&
      normalizeResourceToken(relatedResource) === normalizedCurrentResource
    ) {
      assignments[key] = parentResourceId;
      return;
    }

    if (isMorphToFieldDefinition(field)) {
      const morphType = resolveMorphTypeForResource(field, normalizedCurrentResource);
      if (morphType) {
        assignments[key] = { type: morphType, id: parentResourceId };
      }
    }
  });

  if (Object.keys(assignments).length > 0) {
    return assignments;
  }

  // Fallback for conventional FK names (e.g. menu_group_id)
  const snakeCurrentResource = toSnakeCase(currentResource);
  const singularCurrentResource = singularizeToken(snakeCurrentResource);
  const candidateKeys = new Set([
    `${snakeCurrentResource}_id`,
    `${singularCurrentResource}_id`,
  ]);

  fields.forEach((field: any) => {
    const fieldKey = String(field?.key ?? '');
    if (!fieldKey) return;
    if (candidateKeys.has(fieldKey)) {
      assignments[fieldKey] = parentResourceId;
    }
  });

  // Final fallback: even if create fields do not expose the FK field,
  // inject the conventional singular FK name (e.g. area_id, menu_group_id).
  const inferredSingularKey = `${singularCurrentResource}_id`;
  if (!assignments[inferredSingularKey]) {
    assignments[inferredSingularKey] = parentResourceId;
  }

  return assignments;
};

const extractResourceRouteContext = (pathname: string, search: string): {
  resource?: string;
  recordId?: string;
} => {
  const parts = pathname.split('/').filter(Boolean);
  const resourceIndex = parts.lastIndexOf('resource');
  if (resourceIndex === -1) {
    return {};
  }

  const resource = parts[resourceIndex + 1];
  const recordIdCandidate = parts[resourceIndex + 2];
  const actionCandidate = parts[resourceIndex + 3];

  const recordId =
    recordIdCandidate && (actionCandidate === 'edit' || actionCandidate === 'show')
      ? recordIdCandidate
      : undefined;

  if (!resource) {
    return {};
  }

  const params = new URLSearchParams(search);
  const legacyDetailId = params.get('detail_id')?.trim() || undefined;

  return {
    resource,
    recordId: recordId ?? legacyDetailId,
  };
};

/**
 * QuickCreateModal Component
 *
 * Hızlı kayıt oluşturma modal'ı. Relationship field'larının yanındaki "+" butonundan açılır.
 * İlgili resource'un create form'unu gösterir ve yeni kayıt oluşturur.
 */
export function QuickCreateModal({
  resourceSlug,
  open,
  onOpenChange,
  onSuccess,
  parentResourceId,
  parentResourceSlug,
}: QuickCreateModalProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [resourceTitle, setResourceTitle] = useState('');
  const [parentFieldAssignments, setParentFieldAssignments] = useState<Record<string, unknown>>({});
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const routeContext = useMemo(
    () => extractResourceRouteContext(location.pathname, location.search),
    [location.pathname, location.search]
  );
  const currentResource = parentResourceSlug ?? routeContext.resource
  const effectiveParentResourceId = parentResourceId ?? routeContext.recordId

  const localizedResourceTitle = useMemo(() => {
    const keyFromSlug = t(`resources.${resourceSlug}.title`, '')
    if (keyFromSlug) return keyFromSlug

    const normalizedSlug = resourceSlug.replace(/-/g, '_')
    const keyFromNormalizedSlug = t(`resources.${normalizedSlug}.title`, '')
    if (keyFromNormalizedSlug) return keyFromNormalizedSlug

    return resourceTitle || resourceSlug
  }, [resourceSlug, resourceTitle, t])

  // Create endpoint'inden field'ları fetch et
  useEffect(() => {
    console.log([open, resourceSlug])
    if (!open || !resourceSlug) return;

    const fetchFields = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentResource) {
          queryParams.set('viaResource', currentResource);
        }

        const createUrl = queryParams.toString()
          ? `/resource/${resourceSlug}/create?${queryParams.toString()}`
          : `/resource/${resourceSlug}/create`;

        const response = await axios.get(createUrl);
        const data = response.data.data || response.data;
        const availableFields = Array.isArray(data.fields) ? data.fields : [];

        console.log('QuickCreate - API Response:', data);

        // Resource title'ı al (API dönerse fallback olarak kullanılır)
        setResourceTitle(data.title || data?.meta?.title || '');

        // Parent resource context'e göre otomatik ilişki alanlarını hazırla
        const resolvedAssignments = resolveParentFieldAssignments(
          availableFields,
          currentResource,
          effectiveParentResourceId as string | number | undefined
        );
        setParentFieldAssignments(resolvedAssignments);
        if (Object.keys(resolvedAssignments).length > 0) {
          console.log('QuickCreate - Parent Field Assignments:', resolvedAssignments);
        }

        // Field'ları al ve sadece form'da gösterilecek olanları filtrele
        const formFields = availableFields.filter((field: any) => {
          // ID, timestamps ve hidden field'ları gösterme
          const excludedKeys = ['id', 'created_at', 'updated_at', 'deleted_at'];
          return !excludedKeys.includes(field.key) && field.view !== 'hidden-field';
        });

        console.log('QuickCreate - Filtered Fields:', formFields);
        setFields(formFields);
      } catch (error) {
        console.error('Failed to fetch create fields:', error);
        toast.error('Form yüklenemedi');
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [open, resourceSlug, onOpenChange, currentResource, effectiveParentResourceId]);

  // Form submit handler
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Eğer parent resource ID varsa ve ignore edilen field key'i bulunduysa, formData'ya ekle
      const submitData = { ...data };
      if (Object.keys(parentFieldAssignments).length > 0) {
        Object.entries(parentFieldAssignments).forEach(([fieldKey, fieldValue]) => {
          submitData[fieldKey] = fieldValue;
        });
        console.log('QuickCreate - Applying parent field assignments:', parentFieldAssignments);
      }

      const response = await axios.post(`/resource/${resourceSlug}`, submitData);
      const createdResource = response.data.data || response.data;

      console.log('QuickCreate - Created Resource:', createdResource);
      toast.success('Kayıt başarıyla oluşturuldu');

      onSuccess(createdResource);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create resource:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Kayıt oluşturulamadı';
      toast.error(errorMessage);
      throw error; // Re-throw to let UniversalResourceForm handle it
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <ResponsiveModal
        open={open}
        onOpenChange={onOpenChange}
        title={`Yeni ${localizedResourceTitle} Oluştur`}
        description="Hızlı kayıt oluşturma formu"
        ref={setContainer}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : fields.length > 0 ? (
          <UniversalResourceForm
            resourceType={resourceSlug}
            ignoreResourceField={currentResource}
            mode="create"
            fields={fields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            container={container}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Form alanları bulunamadı
          </p>
        )}
      </ResponsiveModal>
    </>
  );
}
