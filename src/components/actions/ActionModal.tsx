import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useActionStore } from '@/stores/action-store';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActionModalProps {
  resource: string;
}

export function ActionModal({ resource }: ActionModalProps) {
  const {
    selectedAction,
    selectedIds,
    actionModalOpen,
    closeActionModal,
    executeAction,
    loading,
  } = useActionStore();

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  if (!selectedAction) return null;

  const handleConfirm = async () => {
    try {
      await executeAction(resource, selectedAction.slug, selectedIds, fieldValues);
      setFieldValues({});
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleCancel = () => {
    closeActionModal();
    setFieldValues({});
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.key] || '';

    switch (field.view) {
      case 'text-field':
      case 'email-field':
      case 'number-field':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.view === 'number-field' ? 'number' : field.view === 'email-field' ? 'email' : 'text'}
              value={value}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.key]: e.target.value })
              }
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'textarea-field':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) =>
                setFieldValues({ ...fieldValues, [field.key]: e.target.value })
              }
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'switch-field':
        return (
          <div key={field.key} className="flex items-center justify-between space-y-2">
            <Label htmlFor={field.key}>{field.name}</Label>
            <Switch
              id={field.key}
              checked={value}
              onCheckedChange={(checked) =>
                setFieldValues({ ...fieldValues, [field.key]: checked })
              }
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'select-field':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) =>
                setFieldValues({ ...fieldValues, [field.key]: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveModal
      open={actionModalOpen}
      onOpenChange={handleCancel}
      title={selectedAction.name}
      description={
        selectedAction.confirmText ||
        `Are you sure you want to run this action on ${selectedIds.length} item(s)?`
      }
    >
      <div className="space-y-4">
        {selectedAction.destructive && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              This action cannot be undone.
            </p>
          </div>
        )}

        {/* Action Fields */}
        {selectedAction.fields && selectedAction.fields.length > 0 && (
          <div className="space-y-3">
            {selectedAction.fields.map((field) => renderField(field))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            {selectedAction.cancelButtonText || 'Cancel'}
          </Button>
          <Button
            variant={selectedAction.destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : selectedAction.confirmButtonText || 'Confirm'}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
