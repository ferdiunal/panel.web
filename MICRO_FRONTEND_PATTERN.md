# Mikro Frontend Yapısı - Field Component Pattern

## 🎯 Genel Bakış

Bu dokümantasyon, Panel.go frontend'inde mikro frontend yapısını ve standart field component pattern'ini açıklar.

## 📐 Mimari Prensipler

### 1. Modüler Yapı
- Her component bağımsız ve yeniden kullanılabilir
- Minimal bağımlılıklar
- Açık ve net interface'ler

### 2. Tutarlı Layout
- Tüm field'lar `FieldLayout` component'ini kullanır
- Tutarlı label, error, help text gösterimi
- Tutarlı spacing ve styling

### 3. Standart Props Interface
- Tüm field'lar aynı base props'ları kullanır
- Type-safe props interface'i
- Tutarlı naming convention

## 🏗️ Field Component Pattern

### Standart Props Interface

```typescript
interface BaseFieldProps {
  // Temel props
  name: string;
  label?: string;
  value: any;
  onChange: (value: any) => void;

  // Durum props
  error?: string;
  disabled?: boolean;
  required?: boolean;

  // UI props
  placeholder?: string;
  helpText?: string;
  className?: string;

  // Container (portal için)
  container?: HTMLElement | null;
}
```

### Field Component Yapısı

```typescript
// 1. Props Interface
interface MyFieldProps extends BaseFieldProps {
  // Field-specific props
  mySpecificProp?: string;
}

// 2. Component Implementation
export const MyField: React.FC<MyFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  placeholder,
  helpText,
  className,
  mySpecificProp,
}) => {
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      {/* Field-specific implementation */}
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="..."
      />
    </FieldLayout>
  );
};
```

## 📁 Dizin Yapısı

```
web/src/components/fields/
├── FieldLayout.tsx          # Standart layout component
├── base/                    # Base field'lar
│   ├── TextField.tsx
│   ├── NumberField.tsx
│   └── index.ts
├── selection/               # Selection field'lar
│   ├── SelectField.tsx
│   ├── ComboboxField.tsx
│   └── index.ts
├── relationship/            # Relationship field'lar
│   ├── BelongsToField.tsx
│   ├── HasManyField.tsx
│   └── index.ts
└── index.ts                 # Ana export dosyası
```

## 🔄 Migration Guide

### Mevcut Field'ları Güncelleme

**Öncesi:**
```typescript
export const MyField = ({ name, label, value, onChange, error }) => {
  return (
    <div className="space-y-2">
      <label>{label}</label>
      <input value={value} onChange={onChange} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
```

**Sonrası:**
```typescript
export const MyField = ({ name, label, value, onChange, error, ...props }) => {
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={props.required}
      helpText={props.helpText}
      disabled={props.disabled}
    >
      <input
        id={name}
        value={value}
        onChange={onChange}
        disabled={props.disabled}
      />
    </FieldLayout>
  );
};
```

## ✅ Best Practices

### 1. Her Zaman FieldLayout Kullan
```typescript
// ✅ İyi
<FieldLayout name="email" label="Email" error={error}>
  <input {...props} />
</FieldLayout>

// ❌ Kötü
<div>
  <label>Email</label>
  <input {...props} />
</div>
```

### 2. Props Interface'i Extend Et
```typescript
// ✅ İyi
interface MyFieldProps extends BaseFieldProps {
  myProp: string;
}

// ❌ Kötü
interface MyFieldProps {
  name: string;
  label: string;
  // ... tüm props'ları tekrar tanımla
}
```

### 3. Tutarlı Naming Convention
```typescript
// ✅ İyi
TextField, NumberField, SelectField

// ❌ Kötü
TextInput, NumericInput, Dropdown
```

## 🎨 Layout Variants

### Vertical Layout (Varsayılan)
```typescript
<FieldLayout name="email" label="Email">
  <input />
</FieldLayout>
```

### Horizontal Layout
```typescript
<FieldLayoutInline name="email" label="Email">
  <input />
</FieldLayoutInline>
```

## 📝 Örnek: TextField Implementation

```typescript
import { FieldLayout } from './FieldLayout';
import { Input } from '@/components/ui/input';

interface TextFieldProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'url';
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  disabled,
  required,
  placeholder,
  helpText,
  className,
  type = 'text',
}) => {
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldLayout>
  );
};
```

## 🚀 Sonraki Adımlar

1. ✅ FieldLayout component'i oluşturuldu
2. ⏳ Mevcut field'ları FieldLayout kullanacak şekilde güncelle
3. ⏳ Tüm field'lar için tutarlı props interface'i oluştur
4. ⏳ Field component'leri için test suite oluştur
5. ⏳ Storybook stories oluştur

## 📚 İlgili Dokümantasyon

- [Component Library](./COMPONENTS.md)
- [Form System](./FORMS.md)
- [Field Registry](./FIELD_REGISTRY.md)
