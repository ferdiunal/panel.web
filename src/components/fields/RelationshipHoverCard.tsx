import React from 'react';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';

/**
 * HoverCardConfig - Backend'den gelen hover card konfigürasyonu
 *
 * Bu tip, backend'deki HoverCardConfig struct'ına karşılık gelir.
 */
interface HoverCardConfig {
  enabled: boolean;
  show_avatar?: boolean;
  avatar_field?: string;
  avatar_fallback?: string;
  show_label?: boolean;
  label_field?: string;
  show_grid?: boolean;
  grid_fields?: HoverCardGridField[];
  grid_layout?: '2-column' | '3-column' | 'list';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  open_delay?: number;
  close_delay?: number;
}

/**
 * HoverCardGridField - Grid'de gösterilecek field konfigürasyonu
 */
interface HoverCardGridField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'url' | 'date' | 'badge' | 'boolean';
  icon?: string;
  format?: string;
}

/**
 * RelationshipHoverCardProps - Component props
 */
interface RelationshipHoverCardProps {
  /** Hover card konfigürasyonu (backend'den gelir) */
  config?: HoverCardConfig;
  /** İlişkili kayıt verisi */
  data?: Record<string, any>;
  /** Trigger element (hover yapılacak element) */
  children: React.ReactNode;
  /** Ek CSS class'ları */
  className?: string;
}

/**
 * getInitials - İsimden baş harfleri alır (avatar fallback için)
 *
 * @param name - İsim
 * @returns Baş harfler (örn. "Ferdi Ünal" -> "FÜ")
 */
function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

/**
 * formatFieldValue - Field değerini tipine göre formatlar
 *
 * @param value - Field değeri
 * @param field - Field konfigürasyonu
 * @returns Formatlanmış değer
 */
function formatFieldValue(value: any, field: HoverCardGridField): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  switch (field.type) {
    case 'email':
      return (
        <a href={`mailto:${value}`} className="text-primary hover:underline">
          {value}
        </a>
      );

    case 'url':
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      );

    case 'date':
      try {
        const date = new Date(value);
        const formatStr = field.format || 'dd/MM/yyyy';
        return format(date, formatStr, { locale: tr });
      } catch {
        return String(value);
      }

    case 'badge':
      return <Badge variant="secondary">{String(value)}</Badge>;

    case 'boolean':
      return value ? (
        <Badge variant="default" className="bg-green-500">Evet</Badge>
      ) : (
        <Badge variant="secondary">Hayır</Badge>
      );

    case 'text':
    default:
      return String(value);
  }
}

/**
 * getIcon - Icon adından Lucide icon component'ını döndürür
 *
 * @param iconName - Icon adı (örn. "mail", "phone", "map-pin")
 * @returns Lucide icon component veya null
 */
function getIcon(iconName?: string): React.ComponentType<any> | null {
  if (!iconName) return null;

  // Icon adını PascalCase'e çevir (örn. "map-pin" -> "MapPin")
  const pascalCase = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // @ts-ignore - Lucide icons dinamik olarak erişiliyor
  return LucideIcons[pascalCase] || null;
}

/**
 * RelationshipHoverCard - İlişki field'ları için hover card component'ı
 *
 * Bu component, hasOne, belongsTo ve morphTo field'larının index ve detail
 * sayfalarında hover card ile görüntülenmesini sağlar.
 *
 * # Özellikler
 *
 * - **Avatar Desteği**: İlişkili kaydın avatar'ını gösterir
 * - **Label Desteği**: İlişkili kaydın adını/başlığını gösterir
 * - **Grid Layout**: Birden fazla field'ı grid layout'ta gösterir
 * - **Configurable**: Backend'den gelen config ile özelleştirilebilir
 * - **Icon Desteği**: Grid field'larında icon gösterimi
 * - **Type Formatting**: Email, URL, Date, Badge, Boolean gibi tipleri formatlar
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <RelationshipHoverCard
 *   config={{
 *     enabled: true,
 *     show_avatar: true,
 *     avatar_field: 'avatar',
 *     show_label: true,
 *     label_field: 'name',
 *     show_grid: true,
 *     grid_fields: [
 *       { key: 'email', label: 'Email', type: 'email', icon: 'mail' },
 *       { key: 'phone', label: 'Telefon', type: 'text', icon: 'phone' },
 *     ],
 *     grid_layout: '2-column',
 *   }}
 *   data={{
 *     id: 1,
 *     name: 'Ferdi Ünal',
 *     avatar: 'https://example.com/avatar.jpg',
 *     email: 'ferdi@example.com',
 *     phone: '+90 555 123 4567',
 *   }}
 * >
 *   <span className="cursor-pointer hover:underline">Ferdi Ünal</span>
 * </RelationshipHoverCard>
 * ```
 */
export const RelationshipHoverCard: React.FC<RelationshipHoverCardProps> = ({
  config,
  data,
  children,
  className,
}) => {
  // Hover card devre dışıysa veya config yoksa sadece children'ı render et
  if (!config || !config.enabled || !data) {
    return <>{children}</>;
  }

  // Width class'ını belirle
  const widthClass = {
    sm: 'w-56',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96',
  }[config.width || 'md'];

  // Avatar değerini al
  const avatarUrl = config.show_avatar && config.avatar_field
    ? data[config.avatar_field]
    : null;

  // Label değerini al
  const labelValue = config.show_label && config.label_field
    ? data[config.label_field]
    : null;

  // Avatar fallback değerini al
  const avatarFallback = config.avatar_fallback
    ? data[config.avatar_fallback]
    : labelValue
    ? getInitials(String(labelValue))
    : '?';

  // Grid layout class'ını belirle
  const gridLayoutClass = {
    '2-column': 'grid-cols-2',
    '3-column': 'grid-cols-3',
    'list': 'grid-cols-1',
  }[config.grid_layout || '2-column'];

  return (
    <HoverCard
      openDelay={config.open_delay || 200}
      closeDelay={config.close_delay || 300}
    >
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className={cn(widthClass, className)}>
        <div className="flex flex-col gap-3">
          {/* Avatar ve Label */}
          {(config.show_avatar || config.show_label) && (
            <div className="flex items-center gap-3">
              {config.show_avatar && (
                <Avatar size="default">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={String(labelValue || '')} />}
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              )}
              {config.show_label && labelValue && (
                <div className="flex-1 min-w-0">
                  <Label className="text-base font-semibold truncate block">
                    {String(labelValue)}
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Grid Fields */}
          {config.show_grid && config.grid_fields && config.grid_fields.length > 0 && (
            <div className={cn('grid gap-3', gridLayoutClass)}>
              {config.grid_fields.map((field) => {
                const Icon = getIcon(field.icon);
                const value = data[field.key];

                return (
                  <div key={field.key} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      <Label className="text-xs text-muted-foreground font-medium">
                        {field.label}
                      </Label>
                    </div>
                    <div className="text-sm break-words">
                      {formatFieldValue(value, field)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default RelationshipHoverCard;
