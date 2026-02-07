# Frontend Bileşenleri Dokümantasyonu

Bu dokümantasyon, Panel.go frontend uygulamasında kullanılan özel bileşenleri açıklar.

## 📋 İçindekiler

- [Input Bileşenleri](#input-bileşenleri)
  - [TextInput - Maskeli Metin Girişi](#textinput---maskeli-metin-girişi)
  - [TelInput - Telefon Numarası Girişi](#telinput---telefon-numarası-girişi)
  - [PhoneInput - Uluslararası Telefon Girişi](#phoneinput---uluslararası-telefon-girişi)
- [Tarih ve Saat Bileşenleri](#tarih-ve-saat-bileşenleri)
  - [DateField - Tarih Seçimi](#datefield---tarih-seçimi)
  - [DateTimeField - Tarih ve Saat Seçimi](#datetimefield---tarih-ve-saat-seçimi)
  - [TimeField - Saat Seçimi](#timefield---saat-seçimi)
- [Seçim Bileşenleri](#seçim-bileşenleri)
  - [CheckboxField - Checkbox Seçimi](#checkboxfield---checkbox-seçimi)
  - [RadioGroupField - Radio Button Seçimi](#radiogroupfield---radio-button-seçimi)
- [Kurulum](#kurulum)
- [Kullanım Örnekleri](#kullanım-örnekleri)

---

## Input Bileşenleri

### TextInput - Maskeli Metin Girişi

**Konum:** `src/components/fields/TextInput.tsx`

TextInput bileşeni, `react-input-mask` kütüphanesi kullanarak maskeli metin girişi desteği sağlar.

#### Özellikler

- ✅ Input maskesi desteği (telefon, TC kimlik, tarih, kredi kartı, IBAN)
- ✅ Özelleştirilebilir mask karakteri
- ✅ Maskeyi her zaman gösterme seçeneği
- ✅ Label, hata mesajı ve yardım metni desteği
- ✅ Erişilebilirlik özellikleri (ARIA)
- ✅ Shadcn/ui Input entegrasyonu

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `value` | `string` | - | Input değeri (required) |
| `onChange` | `(value: string) => void` | - | Değişiklik callback'i (required) |
| `mask` | `string` | `undefined` | Input maskesi formatı |
| `maskChar` | `string` | `"_"` | Boş karakterler için gösterilecek karakter |
| `alwaysShowMask` | `boolean` | `false` | Maskeyi her zaman göster |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `placeholder` | `string` | `undefined` | Placeholder metni |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### Maske Karakterleri

- **9**: Rakam (0-9)
- **a**: Harf (a-z, A-Z)
- **\***: Alfanumerik (harf veya rakam)

#### Kullanım Örnekleri

```tsx
import { TextInput } from '@/components/fields/TextInput';

// Telefon numarası maskeli
<TextInput
  name="phone"
  label="Telefon Numarası"
  value={phone}
  onChange={setPhone}
  mask="(599) 999 99 99"
  placeholder="(5XX) XXX XX XX"
  required
/>

// TC Kimlik No maskeli
<TextInput
  name="tc_no"
  label="TC Kimlik No"
  value={tcNo}
  onChange={setTcNo}
  mask="99999999999"
  required
/>

// Tarih maskeli
<TextInput
  name="birth_date"
  label="Doğum Tarihi"
  value={birthDate}
  onChange={setBirthDate}
  mask="99/99/9999"
  placeholder="GG/AA/YYYY"
  maskChar="_"
  alwaysShowMask
/>

// Kredi kartı maskeli
<TextInput
  name="card_number"
  label="Kart Numarası"
  value={cardNumber}
  onChange={setCardNumber}
  mask="9999 9999 9999 9999"
  required
/>

// IBAN maskeli
<TextInput
  name="iban"
  label="IBAN"
  value={iban}
  onChange={setIban}
  mask="TR99 9999 9999 9999 9999 9999 99"
  placeholder="TR00 0000 0000 0000 0000 0000 00"
/>
```

---

### TelInput - Telefon Numarası Girişi

**Konum:** `src/components/fields/TelInput.tsx`

TelInput bileşeni, telefon numarası girişi için özel olarak tasarlanmış esnek bir bileşendir. İki farklı mod destekler:

1. **PhoneInput Modu (Gelişmiş)**: Uluslararası telefon numarası girişi
2. **Native Modu (Basit)**: HTML tel input ile opsiyonel mask desteği

#### Özellikler

**PhoneInput Modu:**
- ✅ Ülke bayrağı ve telefon kodu seçimi
- ✅ Otomatik telefon numarası formatlaması
- ✅ E.164 formatında değer döndürme (+905551234567)
- ✅ Arama yapılabilir ülke listesi
- ✅ 200+ ülke desteği

**Native Modu:**
- ✅ Hafif ve hızlı
- ✅ Opsiyonel input mask desteği
- ✅ Mobil cihazlarda sayısal klavye
- ✅ Basit validasyon

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `value` | `string` | - | Input değeri (required) |
| `onChange` | `(value: string) => void` | - | Değişiklik callback'i (required) |
| `usePhoneInput` | `boolean` | `false` | PhoneInput modunu kullan |
| `defaultCountry` | `Country` | `"TR"` | Varsayılan ülke kodu (PhoneInput modu) |
| `mask` | `string` | `undefined` | Input maskesi (Native modu) |
| `maskChar` | `string` | `"_"` | Mask için boş karakter (Native modu) |
| `alwaysShowMask` | `boolean` | `false` | Maskeyi her zaman göster (Native modu) |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `placeholder` | `string` | `undefined` | Placeholder metni |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### Kullanım Örnekleri

```tsx
import { TelInput } from '@/components/fields/TelInput';

// PhoneInput modu (gelişmiş) - Uluslararası telefon numaraları
<TelInput
  name="phone"
  label="Telefon Numarası"
  value={phone}
  onChange={setPhone}
  usePhoneInput
  defaultCountry="TR"
  placeholder="Telefon numaranızı girin"
  required
  helpText="Uluslararası format kullanılacaktır"
/>

// Native modu (maskeli) - Türkiye telefon numaraları
<TelInput
  name="phone"
  label="Telefon Numarası"
  value={phone}
  onChange={setPhone}
  mask="(599) 999 99 99"
  placeholder="(5XX) XXX XX XX"
  required
  helpText="Türkiye cep telefonu numaranızı girin"
/>

// Native modu (maskesiz) - Basit telefon girişi
<TelInput
  name="phone"
  label="Telefon"
  value={phone}
  onChange={setPhone}
  placeholder="05551234567"
/>
```

#### Mod Seçimi Rehberi

**PhoneInput Modunu Kullanın:**
- ✅ Uluslararası kullanıcılar için
- ✅ Farklı ülkelerden telefon numaraları gerekiyorsa
- ✅ E.164 formatında veri saklamak istiyorsanız
- ✅ Otomatik ülke algılama gerekiyorsa

**Native Modunu Kullanın:**
- ✅ Sadece tek ülke için (örn: Türkiye)
- ✅ Hafif ve hızlı bir çözüm istiyorsanız
- ✅ Özel mask formatı gerekiyorsa
- ✅ Bundle boyutunu küçük tutmak istiyorsanız

---

### PhoneInput - Uluslararası Telefon Girişi

**Konum:** `src/components/ui/phone-input.tsx`

PhoneInput, `react-phone-number-input` kütüphanesi kullanarak uluslararası telefon numarası girişi sağlayan alt seviye bir bileşendir. Genellikle TelInput bileşeni içinde kullanılır.

#### Özellikler

- ✅ 200+ ülke desteği
- ✅ Ülke bayrağı gösterimi
- ✅ Arama yapılabilir ülke listesi
- ✅ Otomatik telefon numarası formatlaması
- ✅ E.164 formatında değer döndürme
- ✅ Shadcn/ui bileşenleri ile entegrasyon

#### Kullanım Örneği

```tsx
import { PhoneInput } from '@/components/ui/phone-input';

<PhoneInput
  value={phone}
  onChange={setPhone}
  defaultCountry="TR"
  placeholder="Telefon numaranızı girin"
/>
```

**Not:** Çoğu durumda PhoneInput'u doğrudan kullanmak yerine TelInput bileşenini kullanmanız önerilir.

---

## Kurulum

### Gerekli Paketler

```bash
# Input mask desteği için
npm install react-input-mask
npm install --save-dev @types/react-input-mask

# Uluslararası telefon numarası desteği için
npm install react-phone-number-input

# Shadcn/ui bileşenleri (zaten kurulu olmalı)
npx shadcn@latest add input button command popover scroll-area
```

### Import Örnekleri

```tsx
// TextInput
import { TextInput } from '@/components/fields/TextInput';

// TelInput
import { TelInput } from '@/components/fields/TelInput';

// PhoneInput (alt seviye)
import { PhoneInput } from '@/components/ui/phone-input';
```

---

## Kullanım Örnekleri

### Form Örneği

```tsx
import { useState } from 'react';
import { TextInput } from '@/components/fields/TextInput';
import { TelInput } from '@/components/fields/TelInput';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tcNo: '',
    birthDate: '',
    iban: '',
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validasyonu ve gönderimi
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* İsim */}
      <TextInput
        name="name"
        label="Ad Soyad"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        required
        error={errors.name}
      />

      {/* Telefon (Uluslararası) */}
      <TelInput
        name="phone"
        label="Telefon Numarası"
        value={formData.phone}
        onChange={(value) => setFormData({ ...formData, phone: value })}
        usePhoneInput
        defaultCountry="TR"
        required
        error={errors.phone}
        helpText="Ülke kodunu seçip telefon numaranızı girin"
      />

      {/* TC Kimlik No */}
      <TextInput
        name="tcNo"
        label="TC Kimlik No"
        value={formData.tcNo}
        onChange={(value) => setFormData({ ...formData, tcNo: value })}
        mask="99999999999"
        required
        error={errors.tcNo}
      />

      {/* Doğum Tarihi */}
      <TextInput
        name="birthDate"
        label="Doğum Tarihi"
        value={formData.birthDate}
        onChange={(value) => setFormData({ ...formData, birthDate: value })}
        mask="99/99/9999"
        placeholder="GG/AA/YYYY"
        maskChar="_"
        alwaysShowMask
        required
        error={errors.birthDate}
      />

      {/* IBAN */}
      <TextInput
        name="iban"
        label="IBAN"
        value={formData.iban}
        onChange={(value) => setFormData({ ...formData, iban: value })}
        mask="TR99 9999 9999 9999 9999 9999 99"
        placeholder="TR00 0000 0000 0000 0000 0000 00"
        error={errors.iban}
        helpText="Türkiye IBAN numaranızı giriniz"
      />

      <button type="submit" className="btn-primary">
        Gönder
      </button>
    </form>
  );
}
```

### Validasyon Örneği

```tsx
import { z } from 'zod';

// Validasyon şeması
const contactSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Geçersiz telefon numarası'),
  tcNo: z.string().regex(/^\d{11}$/, 'TC Kimlik No 11 haneli olmalıdır'),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Geçersiz tarih formatı'),
  iban: z.string().regex(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/, 'Geçersiz IBAN'),
});

// Kullanım
const validateForm = (data: any) => {
  try {
    contactSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: {} };
  }
};
```

---

## Best Practices

### 1. Doğru Bileşeni Seçin

```tsx
// ✅ İyi - Telefon numarası için TelInput kullan
<TelInput name="phone" label="Telefon" value={phone} onChange={setPhone} />

// ❌ Kötü - Telefon numarası için TextInput kullanma
<TextInput name="phone" label="Telefon" value={phone} onChange={setPhone} />
```

### 2. Tutarlı Format Kullanın

```tsx
// ✅ İyi - Tüm projede aynı format
<TextInput mask="(599) 999 99 99" />

// ❌ Kötü - Farklı formatlar
<TextInput mask="(599) 999 99 99" />  // Bir yerde
<TextInput mask="599 999 99 99" />    // Başka yerde
```

### 3. Placeholder ve Yardım Metni Ekleyin

```tsx
// ✅ İyi - Kullanıcıyı yönlendir
<TextInput
  mask="(599) 999 99 99"
  placeholder="(5XX) XXX XX XX"
  helpText="Türkiye cep telefonu numaranızı girin"
/>

// ❌ Kötü - Yönlendirme yok
<TextInput mask="(599) 999 99 99" />
```

### 4. Backend'de Formatı Temizleyin

```go
// Backend'de formatı temizle
fields.Tel("Telefon", "phone").
    Modify(func(value interface{}, c *fiber.Ctx) interface{} {
        if phone, ok := value.(string); ok {
            // Sadece rakamları al
            re := regexp.MustCompile(`\D`)
            return re.ReplaceAllString(phone, "")
        }
        return value
    })
```

### 5. Erişilebilirlik Özelliklerini Kullanın

```tsx
// ✅ İyi - Erişilebilirlik özellikleri mevcut
<TextInput
  name="phone"
  label="Telefon Numarası"
  error={error}
  required
/>
// Otomatik olarak aria-invalid, aria-describedby vb. eklenir

// ❌ Kötü - Manuel aria özellikleri eklemeye çalışma
<input aria-invalid="true" aria-describedby="phone-error" />
```

---

## Performans Karşılaştırması

| Bileşen | Bundle Boyutu | İlk Render | Kullanım Senaryosu |
|---------|---------------|------------|---------------------|
| TextInput (maskesiz) | ~1KB | ~10ms | Basit metin girişi |
| TextInput (maskeli) | ~5KB | ~20ms | Formatlanmış veri (TC, tarih, kredi kartı) |
| TelInput (native) | ~5KB | ~20ms | Yerel telefon numaraları |
| TelInput (PhoneInput) | ~50KB | ~100ms | Uluslararası telefon numaraları |

---

## Teknik Detaylar

### Bağımlılıklar

- **react-input-mask**: v2.0.4+
- **@types/react-input-mask**: v3.0.0+
- **react-phone-number-input**: v3.4.0+
- **shadcn/ui**: Input, Button, Command, Popover, ScrollArea

### Bileşen Konumları

```
web/src/
├── components/
│   ├── fields/
│   │   ├── TextInput.tsx          # Maskeli metin girişi
│   │   ├── TelInput.tsx           # Telefon numarası girişi
│   │   ├── TextInput.test.tsx     # TextInput testleri
│   │   └── TelInput.test.tsx      # TelInput testleri
│   └── ui/
│       └── phone-input.tsx        # PhoneInput bileşeni
```

### TypeScript Tipleri

```tsx
// TextInput Props
interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  mask?: string;
  maskChar?: string;
  alwaysShowMask?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

// TelInput Props
interface TelInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  usePhoneInput?: boolean;
  defaultCountry?: Country;
  mask?: string;
  maskChar?: string;
  alwaysShowMask?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}
```

---

## Tarih ve Saat Bileşenleri

### DateField - Tarih Seçimi

**Konum:** `src/components/fields/DateField.tsx`

DateField bileşeni, tarih seçimi için kullanılan esnek bir bileşendir. İki farklı mod destekler.

#### Özellikler

**Dialog Modu (Varsayılan):**
- ✅ Popover içinde takvim arayüzü
- ✅ Tarih seçildiğinde otomatik kapanma
- ✅ Görsel olarak zengin
- ✅ Shadcn/ui Calendar entegrasyonu

**Native Modu:**
- ✅ HTML5 date input
- ✅ Mobil cihazlarda native date picker
- ✅ Hafif ve hızlı
- ✅ Minimal bundle boyutu

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `value` | `Date \| undefined` | - | Tarih değeri (required) |
| `onChange` | `(date: Date \| undefined) => void` | - | Değişiklik callback'i (required) |
| `useNative` | `boolean` | `false` | Native HTML date input kullan |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `placeholder` | `string` | `"Pick a date"` | Placeholder metni |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### Kullanım Örnekleri

```tsx
import { DateField } from '@/components/fields/DateField';

// Dialog modu (varsayılan)
<DateField
  name="published_at"
  label="Yayınlanma Tarihi"
  value={publishedAt}
  onChange={setPublishedAt}
  placeholder="Tarih seçin"
/>

// Native modu
<DateField
  name="birth_date"
  label="Doğum Tarihi"
  value={birthDate}
  onChange={setBirthDate}
  useNative
  required
  helpText="Doğum tarihinizi seçin"
/>
```

---

### DateTimeField - Tarih ve Saat Seçimi

**Konum:** `src/components/fields/DateTimeField.tsx`

DateTimeField bileşeni, tarih ve saat seçimi için kullanılan esnek bir bileşendir. İki farklı mod destekler.

#### Özellikler

**Dialog Modu (Varsayılan):**
- ✅ Popover içinde takvim + saat girişi
- ✅ "Tamam" butonu ile dialog kapanma
- ✅ Saat bilgisini koruma
- ✅ Görsel olarak zengin

**Native Modu:**
- ✅ HTML5 datetime-local input
- ✅ Mobil cihazlarda native datetime picker
- ✅ Hafif ve hızlı
- ✅ Minimal bundle boyutu

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `value` | `Date \| undefined` | - | Tarih ve saat değeri (required) |
| `onChange` | `(date: Date \| undefined) => void` | - | Değişiklik callback'i (required) |
| `useNative` | `boolean` | `false` | Native HTML datetime-local input kullan |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `placeholder` | `string` | `"Pick a date and time"` | Placeholder metni |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### Kullanım Örnekleri

```tsx
import { DateTimeField } from '@/components/fields/DateTimeField';

// Dialog modu (varsayılan)
<DateTimeField
  name="created_at"
  label="Oluşturulma Tarihi"
  value={createdAt}
  onChange={setCreatedAt}
  placeholder="Tarih ve saat seçin"
/>

// Native modu
<DateTimeField
  name="appointment_at"
  label="Randevu Tarihi ve Saati"
  value={appointmentAt}
  onChange={setAppointmentAt}
  useNative
  required
  helpText="Randevu tarihi ve saatini seçin"
/>
```

---

### TimeField - Saat Seçimi

**Konum:** `src/components/fields/TimeField.tsx`

TimeField bileşeni, saat seçimi için kullanılan esnek bir bileşendir. İki farklı mod destekler.

#### Özellikler

**Dialog Modu (Varsayılan):**
- ✅ Popover içinde saat girişi
- ✅ "Tamam" butonu ile dialog kapanma
- ✅ Görsel olarak zengin
- ✅ Geçici değer yönetimi

**Native Modu:**
- ✅ HTML5 time input
- ✅ Mobil cihazlarda native time picker
- ✅ Hafif ve hızlı
- ✅ Minimal bundle boyutu

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `value` | `string` | - | Saat değeri HH:mm formatında (required) |
| `onChange` | `(time: string) => void` | - | Değişiklik callback'i (required) |
| `useNative` | `boolean` | `false` | Native HTML time input kullan |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `placeholder` | `string` | `"Saat seçin"` | Placeholder metni |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### Kullanım Örnekleri

```tsx
import { TimeField } from '@/components/fields/TimeField';

// Dialog modu (varsayılan)
<TimeField
  name="start_time"
  label="Başlangıç Saati"
  value={startTime}
  onChange={setStartTime}
  placeholder="Saat seçin"
/>

// Native modu
<TimeField
  name="work_hours"
  label="Çalışma Saati"
  value={workHours}
  onChange={setWorkHours}
  useNative
  required
  helpText="Çalışma saatinizi seçin"
/>
```

---

## Seçim Bileşenleri

### CheckboxField - Checkbox Seçimi

**Konum:** `src/components/fields/CheckboxField.tsx`

CheckboxField bileşeni, checkbox seçimi için kullanılan esnek bir bileşendir. Tek checkbox veya checkbox grubu olarak kullanılabilir.

#### Özellikler

**Tek Checkbox Modu:**
- ✅ Boolean değer döndürür
- ✅ Kullanım koşulları, onay kutuları için ideal
- ✅ Label ile entegre
- ✅ Erişilebilirlik desteği

**Checkbox Grubu Modu:**
- ✅ Çoklu seçim desteği
- ✅ Seçili değerlerin array'ini döndürür
- ✅ Her seçenek için ayrı checkbox
- ✅ Seçenekleri devre dışı bırakma

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `checked` | `boolean` | `undefined` | Checkbox durumu (tek checkbox modu) |
| `onCheckedChange` | `(checked: boolean) => void` | `undefined` | Değişiklik callback'i (tek checkbox modu) |
| `options` | `CheckboxOption[]` | `undefined` | Checkbox grubu seçenekleri |
| `value` | `string[]` | `[]` | Seçili değerler (checkbox grubu modu) |
| `onChange` | `(value: string[]) => void` | `undefined` | Değişiklik callback'i (checkbox grubu modu) |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### CheckboxOption Tipi

```tsx
interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

#### Kullanım Örnekleri

```tsx
import { CheckboxField } from '@/components/fields/CheckboxField';

// Tek checkbox
<CheckboxField
  name="terms"
  label="Kullanım koşullarını kabul ediyorum"
  checked={terms}
  onCheckedChange={setTerms}
  required
/>

// Checkbox grubu
<CheckboxField
  name="interests"
  label="İlgi Alanları"
  options={[
    { value: 'sports', label: 'Spor' },
    { value: 'music', label: 'Müzik' },
    { value: 'tech', label: 'Teknoloji' }
  ]}
  value={interests}
  onChange={setInterests}
  helpText="İlgi alanlarınızı seçin"
/>

// Bazı seçenekler devre dışı
<CheckboxField
  name="features"
  label="Özellikler"
  options={[
    { value: 'basic', label: 'Temel Özellikler' },
    { value: 'advanced', label: 'Gelişmiş Özellikler', disabled: true },
    { value: 'premium', label: 'Premium Özellikler' }
  ]}
  value={features}
  onChange={setFeatures}
/>
```

---

### RadioGroupField - Radio Button Seçimi

**Konum:** `src/components/fields/RadioGroupField.tsx`

RadioGroupField bileşeni, birden fazla seçenek arasından tek bir seçim yapmak için kullanılır.

#### Özellikler

- ✅ Tek seçim (mutually exclusive)
- ✅ Yatay veya dikey düzen
- ✅ Her seçenek için opsiyonel açıklama
- ✅ Seçenekleri devre dışı bırakma
- ✅ Erişilebilirlik desteği
- ✅ Shadcn/ui RadioGroup entegrasyonu

#### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `name` | `string` | - | Input adı (required) |
| `label` | `string` | - | Label metni (required) |
| `options` | `RadioOption[]` | - | Radio button seçenekleri (required) |
| `value` | `string` | - | Seçili değer (required) |
| `onChange` | `(value: string) => void` | - | Değişiklik callback'i (required) |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Radio button'ların düzeni |
| `error` | `string` | `undefined` | Hata mesajı |
| `disabled` | `boolean` | `false` | Devre dışı durumu |
| `required` | `boolean` | `false` | Zorunlu alan |
| `helpText` | `string` | `undefined` | Yardım metni |
| `className` | `string` | `undefined` | Özel CSS sınıfı |

#### RadioOption Tipi

```tsx
interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}
```

#### Kullanım Örnekleri

```tsx
import { RadioGroupField } from '@/components/fields/RadioGroupField';

// Dikey düzen (varsayılan)
<RadioGroupField
  name="gender"
  label="Cinsiyet"
  options={[
    { value: 'male', label: 'Erkek' },
    { value: 'female', label: 'Kadın' },
    { value: 'other', label: 'Diğer' }
  ]}
  value={gender}
  onChange={setGender}
  required
/>

// Yatay düzen
<RadioGroupField
  name="status"
  label="Durum"
  options={[
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Pasif' }
  ]}
  value={status}
  onChange={setStatus}
  orientation="horizontal"
/>

// Açıklamalı seçenekler
<RadioGroupField
  name="plan"
  label="Plan Seçimi"
  options={[
    {
      value: 'basic',
      label: 'Temel',
      description: 'Temel özellikler ve 5GB depolama'
    },
    {
      value: 'pro',
      label: 'Pro',
      description: 'Gelişmiş özellikler ve 50GB depolama'
    },
    {
      value: 'enterprise',
      label: 'Enterprise',
      description: 'Tüm özellikler ve sınırsız depolama',
      disabled: true
    }
  ]}
  value={plan}
  onChange={setPlan}
  helpText="İhtiyacınıza uygun planı seçin"
/>
```

---

## Mod Karşılaştırması

### Date, DateTime ve Time Bileşenleri

| Özellik | Dialog Modu | Native Modu |
|---------|-------------|-------------|
| **Görsel** | Zengin takvim/saat arayüzü | Basit HTML input |
| **Mobil Uyumluluk** | İyi | Mükemmel (native picker) |
| **Bundle Boyutu** | Daha büyük (~20KB) | Minimal (~1KB) |
| **Özelleştirme** | Yüksek | Sınırlı |
| **Performans** | Orta | Hızlı |
| **Kullanım Senaryosu** | Desktop uygulamalar | Mobil uygulamalar, basit formlar |
| **Otomatik Kapanma** | ✅ (tarih seçildiğinde) | N/A |
| **Takvim Arayüzü** | ✅ | ❌ (browser native) |

### Mod Seçimi Rehberi

**Dialog Modunu Kullanın:**
- ✅ Desktop uygulamalar için
- ✅ Zengin kullanıcı deneyimi gerekiyorsa
- ✅ Takvim görünümü önemliyse
- ✅ Özelleştirme gerekiyorsa

**Native Modunu Kullanın:**
- ✅ Mobil uygulamalar için
- ✅ Hafif ve hızlı bir çözüm istiyorsanız
- ✅ Bundle boyutunu küçük tutmak istiyorsanız
- ✅ Browser native picker'ı kullanmak istiyorsanız

---

## Sınırlamalar

### TextInput

1. **Dinamik Maskeler**: Mask değeri runtime'da değiştirilemez (component re-render gerektirir)
2. **Karmaşık Formatlar**: Çok karmaşık formatlar için özel regex validasyonu gerekebilir
3. **Mobil Klavye**: Mobil cihazlarda sayısal klavye için `type="tel"` kullanımı önerilir

### TelInput (PhoneInput Modu)

1. **Bundle Boyutu**: Daha büyük bundle boyutu (~50KB)
2. **Performans**: İlk render daha yavaş
3. **Özelleştirme**: Stil özelleştirmesi sınırlı
4. **Mobil**: Mobil cihazlarda bazen klavye sorunları

### TelInput (Native Modu)

1. **Ülke Desteği**: Tek ülke için optimize
2. **Validasyon**: Manuel validasyon gerekli
3. **Format**: Otomatik format düzeltme yok
4. **Uluslararası**: Uluslararası numaralar için uygun değil

---

## Daha Fazla Bilgi

- **Backend Entegrasyonu**: [docs/Fields.md](../docs/Fields.md) - Backend field tanımlamaları ve entegrasyon
- **Genel Dokümantasyon**: [README.md](./README.md) - Proje genel bakış
- **Geliştirici Rehberi**: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Geliştirme rehberi

---

**Son Güncelleme:** 2026-02-08
**Versiyon:** 1.0.0
