# Field Components - Micro Frontend Architecture

Bu dizin, Panel.go projesinin tüm field component'lerini içerir. Tüm field'lar **Micro Frontend Pattern** kullanarak **FieldLayout** wrapper'ı ile tutarlı bir yapıda organize edilmiştir.

## 📁 Dizin Yapısı

```
fields/
├── form/           # Düzenlenebilir form field'ları (FormFieldProps)
├── detail/         # Read-only detail view field'ları (DetailFieldProps)
├── index/          # Tablo görünümü field'ları (IndexFieldProps)
├── FieldLayout.tsx # Tüm field'lar için ortak layout wrapper
└── README.md       # Bu dosya
```

## 🎯 Field Variant'ları

Her field için **3 variant** bulunur:

### 1. Form Variant (`/form/`)
Düzenlenebilir input field'ları. Kullanıcı girişi alır.

**Props Interface:**
```typescript
interface FormFieldProps {
  field: FieldData;
  name: string;
  label?: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}
```

**Örnek Kullanım:**
```tsx
<EmailFormField
  field={{ key: 'email' }}
  name="email"
  label="E-posta"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

### 2. Detail Variant (`/detail/`)
Read-only görünüm. Kayıt detaylarını gösterir.

**Props Interface:**
```typescript
interface DetailFieldProps {
  field: FieldData;
  record: Record<string, any>;
}
```

**Örnek Kullanım:**
```tsx
<EmailDetailField
  field={{
    key: 'email',
    name: 'E-posta',
  }}
  record={{ email: 'ornek@email.com' }}
/>
```

### 3. Index Variant (`/index/`)
Tablo görünümü. Minimal, salt okunur görünüm. `hideLabel={true}` kullanır.

**Props Interface:**
```typescript
interface IndexFieldProps {
  field: FieldData;
  record: Record<string, any>;
}
```

**Örnek Kullanım:**
```tsx
<EmailIndexField
  field={{
    key: 'email',
    name: 'E-posta',
    text_align: 'left',
  }}
  record={{ email: 'ornek@email.com' }}
/>
```

## 📦 Mevcut Field'lar (21 Field)

### Temel Input Field'ları
| Field | Form | Detail | Index | Açıklama |
|-------|------|--------|-------|----------|
| **TextInput** | ✅ | ✅ | ✅ | Basit metin girişi |
| **EmailInput** | ✅ | ✅ | ✅ | Email girişi + mailto link |
| **NumberInput** | ✅ | ✅ | ✅ | Sayı girişi + increment/decrement |
| **PasswordInput** | ✅ | ✅ | ✅ | Şifre girişi + show/hide toggle |
| **TelInput** | ✅ | ✅ | ✅ | Telefon numarası + tel link |
| **URLInput** | ✅ | ✅ | ✅ | URL girişi + external link |
| **TextareaField** | ✅ | ✅ | ✅ | Çok satırlı metin |

### Tarih/Saat Field'ları
| Field | Form | Detail | Index | Açıklama |
|-------|------|--------|-------|----------|
| **DateField** | ✅ | ✅ | ✅ | Tarih girişi |
| **TimeField** | ✅ | ✅ | ✅ | Saat girişi |
| **DateTimeField** | ✅ | ✅ | ✅ | Tarih + saat girişi |

### Seçim Field'ları
| Field | Form | Detail | Index | Açıklama |
|-------|------|--------|-------|----------|
| **SelectField** | ✅ | ✅ | ✅ | Dropdown select |
| **ComboboxField** | ✅ | ✅ | ✅ | Searchable select |
| **AsyncComboboxField** | ✅ | ✅ | ✅ | Async searchable select |
| **RadioGroupField** | ✅ | ✅ | ✅ | Radio button grubu |
| **CheckboxField** | ✅ | ✅ | ✅ | Tek checkbox (boolean) |
| **SwitchField** | ✅ | ✅ | ✅ | Toggle switch |
| **BooleanGroupField** | ✅ | ✅ | ✅ | Multiple checkbox grubu |

### Özel Field'lar
| Field | Form | Detail | Index | Açıklama |
|-------|------|--------|-------|----------|
| **ColorField** | ✅ | ✅ | ✅ | Renk seçici |
| **CodeField** | ✅ | ✅ | ✅ | Kod editörü |
| **RichTextField** | ✅ | ✅ | ✅ | Zengin metin editörü |
| **BadgeField** | ✅ | ✅ | ✅ | Badge display |
| **DialogField** | ✅ | ✅ | ✅ | Dialog field |
| **PanelField** | ✅ | ✅ | ✅ | Panel field |

### Relationship Field'ları
| Field | Form | Detail | Index | Açıklama |
|-------|------|--------|-------|----------|
| **BelongsToField** | ❌ | ✅ | ✅ | Tek ilişki (N:1) |
| **HasOneField** | ❌ | ✅ | ✅ | Tek ilişki (1:1) |
| **HasManyField** | ❌ | ✅ | ✅ | Çoklu ilişki (1:N) |
| **BelongsToManyField** | ❌ | ✅ | ✅ | Çoklu ilişki (N:N) |
| **MorphToField** | ✅ | ✅ | ✅ | Polymorphic ilişki |
| **MorphToManyField** | ✅ | ✅ | ✅ | Polymorphic many-to-many |

## 🏗️ FieldLayout Pattern

Tüm field'lar **FieldLayout** component'ini kullanır. Bu, tutarlı layout ve props interface sağlar.

**FieldLayout Props:**
```typescript
interface FieldLayoutProps {
  name: string;              // Field adı (required)
  label?: string;            // Label metni
  required?: boolean;        // Zorunlu mu?
  error?: string;            // Hata mesajı
  helpText?: string;         // Yardım metni
  disabled?: boolean;        // Devre dışı mı?
  children: React.ReactNode; // Field içeriği
  className?: string;        // Ek CSS class
  hideLabel?: boolean;       // Label'ı gizle (index view için)
}
```

**Örnek:**
```tsx
<FieldLayout
  name="email"
  label="E-posta"
  error={error}
  required={true}
  helpText="Geçerli bir e-posta adresi girin"
>
  <Input type="email" value={value} onChange={onChange} />
</FieldLayout>
```

## 🎨 Önemli Pattern'ler

### 1. Value Extraction
```typescript
// Backend'den gelen value farklı format'larda olabilir
const value = record[field.key]?.data || record[field.key] || '';
```

### 2. Text Alignment (Index View)
```typescript
const textAlign = field.text_align || 'left';
const alignmentClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}[textAlign] || 'text-left';
```

### 3. Empty Value Display
```typescript
// Boş değerler için '—' karakteri kullan
{value || '—'}
```

### 4. Error Styling
```typescript
className={cn(
  error && 'border-destructive focus-visible:ring-destructive/20'
)}
```

### 5. Options Normalization
```typescript
// Options farklı format'larda gelebilir (object veya array)
const normalizedOptions = useMemo((): Option[] => {
  const rawOptions = field.props?.options;

  if (Array.isArray(rawOptions)) {
    return rawOptions.map((opt) => ({
      value: String(opt.value),
      label: String(opt.label),
    }));
  }

  if (typeof rawOptions === 'object') {
    return Object.entries(rawOptions).map(([value, label]) => ({
      value: String(value),
      label: String(label),
    }));
  }

  return [];
}, [field.props?.options]);
```

## 🔗 Relationship Field'ları

Relationship field'ları özel özellikler içerir:

### RelationshipHoverCard
İlişkili kaydın detaylarını hover card ile gösterir.

```tsx
<RelationshipHoverCard config={hoverCardConfig} data={relatedData}>
  <Link to={`/resources/${slug}/${id}`}>
    {label}
  </Link>
</RelationshipHoverCard>
```

### Link Navigation
İlişkili kayıtlara link ile navigation.

```tsx
<Link
  to={`/resources/${relatedResource}/${relatedId}`}
  className="text-primary hover:underline"
>
  {label}
  <ExternalLink className="h-3.5 w-3.5" />
</Link>
```

### Count Display
Çoklu ilişkilerde kayıt sayısı gösterimi.

```tsx
<Badge variant="secondary">{count}</Badge>
<span>{count} kayıt</span>
```

## 📝 Yeni Field Ekleme

Yeni bir field eklemek için:

1. **3 variant oluştur:**
   - `/form/YourField.tsx`
   - `/detail/YourField.tsx`
   - `/index/YourField.tsx`

2. **FieldLayout kullan:**
```tsx
export const YourFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  error,
  ...props
}) => {
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={props.required}
      helpText={props.helpText}
      disabled={props.disabled}
    >
      {/* Your field implementation */}
    </FieldLayout>
  );
};
```

3. **Props interface'lerini kullan:**
   - Form: `FormFieldProps`
   - Detail: `DetailFieldProps`
   - Index: `IndexFieldProps`

4. **displayName ekle:**
```tsx
YourFormField.displayName = 'YourFormField';
```

## 🚀 Migration Guide

Eski field'lardan yeni field'lara geçiş:

### Eski Yapı (PanelItem/DefaultField)
```tsx
<PanelItem field={field} copyable={true}>
  <p>{value}</p>
</PanelItem>
```

### Yeni Yapı (FieldLayout)
```tsx
<FieldLayout
  name={field.key}
  label={field.name || field.label}
  helpText={field.help_text}
>
  <p className="text-sm text-foreground">{value || '—'}</p>
</FieldLayout>
```

## 📊 İstatistikler

- **Toplam Field:** 21 field
- **Toplam Dosya:** 63 dosya (21 field × 3 variant)
- **Form Field'ları:** 25 dosya
- **Detail Field'ları:** 29 dosya
- **Index Field'ları:** 29 dosya

## 🔧 Bakım ve Geliştirme

### Tutarlılık Kuralları
1. Tüm field'lar FieldLayout kullanmalı
2. Props interface'leri standart olmalı (FormFieldProps, DetailFieldProps, IndexFieldProps)
3. Empty value'lar için `—` karakteri kullanılmalı
4. Error styling tutarlı olmalı
5. Index field'ları `hideLabel={true}` kullanmalı

### Test Edilmesi Gerekenler
- [ ] Value extraction (farklı format'lar)
- [ ] Error handling ve gösterimi
- [ ] Empty value display
- [ ] Text alignment (index view)
- [ ] Disabled state
- [ ] Required field validation

## 📚 İlgili Dosyalar

- `FieldLayout.tsx` - Ortak layout wrapper
- `@/types` - Props interface'leri (FormFieldProps, DetailFieldProps, IndexFieldProps)
- `@/components/ui/*` - Shadcn UI component'leri

---

**Son Güncelleme:** 2026-02-09
**Oluşturan:** Claude Opus 4.6
**Versiyon:** 1.0.0
