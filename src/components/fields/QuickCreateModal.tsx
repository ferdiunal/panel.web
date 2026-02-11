import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { UniversalResourceForm } from '@/components/forms/UniversalResourceForm';
import { toast } from 'sonner';
import type { FieldDefinition } from '@/types/form';
import { useLocation } from 'react-router-dom';

interface QuickCreateModalProps {
  resourceSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (createdResource: any) => void;
  parentResourceId?: string | number; // Parent resource ID (edit modunda kullanılır)
  depth?: number; // Nested modal depth kontrolü için (default: 0)
}

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
}: QuickCreateModalProps) {
  const location = useLocation()
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [resourceTitle, setResourceTitle] = useState('');
  const [ignoredFieldKey, setIgnoredFieldKey] = useState<string | null>(null);

  const currentResource = location.pathname.split("/").filter(Boolean)[1]

  // Create endpoint'inden field'ları fetch et
  useEffect(() => {
    console.log([open, resourceSlug])
    if (!open || !resourceSlug) return;

    const fetchFields = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/resource/${resourceSlug}/create`);
        const data = response.data.data || response.data;

        console.log('QuickCreate - API Response:', data);

        // Resource title'ı al
        setResourceTitle(data.title || resourceSlug);

        // Ignore edilen field'ın key'ini bul (parent resource için)
        const ignoredField = (data.fields || []).find((field: any) =>
          field.props?.related_resource === currentResource
        );
        if (ignoredField) {
          setIgnoredFieldKey(ignoredField.key);
          console.log('QuickCreate - Ignored Field Key:', ignoredField.key);
        }

        // Field'ları al ve sadece form'da gösterilecek olanları filtrele
        const formFields = (data.fields || []).filter((field: any) => {
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
  }, [open, resourceSlug, onOpenChange]);

  // Form submit handler
  const handleSubmit = async (data: Record<string, any>) => {
    try {
      // Eğer parent resource ID varsa ve ignore edilen field key'i bulunduysa, formData'ya ekle
      const submitData = { ...data };
      if (parentResourceId && ignoredFieldKey) {
        submitData[ignoredFieldKey] = parentResourceId;
        console.log('QuickCreate - Adding parent resource ID:', { [ignoredFieldKey]: parentResourceId });
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
        title={`Yeni ${resourceTitle} Oluştur`}
        description="Hızlı kayıt oluşturma formu"
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
