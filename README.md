# Panel.go - Web Frontend

Bu proje, **Panel.go** SDK'sının varsayılan yönetim paneli arayüzüdür. Go uygulamanızın içine gömülerek (embedded) çalışmak üzere tasarlanmış modern bir React uygulamasıdır.

## 🚀 Teknolojiler

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Forms:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

## 🛠 Kurulum ve Geliştirme

Bağımlılıkları yükleyin:

```bash
npm install
# veya
bun install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır. Backend API'sine bağlanmak için `.env` dosyasını yapılandırmanız gerekebilir (varsayılan olarak aynı host üzerinden `/api` path'ini kullanır).

## 📦 Build ve Deployment

Panel.go backend'i ile dağıtılmak üzere build almak için:

```bash
npm run build
```

Bu işlem `dist/` (veya `../pkg/panel/ui` gibi yapılandırılmış output) klasörüne optimize edilmiş statik dosyaları çıkarır. Bu dosyalar Go tarafında `embed.FS` ile binary içine dahil edilir.

## 📂 Proje Yapısı

- `src/components`: UI bileşenleri (shadcn/ui elementleri `ui` altında).
- `src/widgets`: Dashboard ve Resource sayfalarında kullanılan metrik bileşenleri.
- `src/pages`: Sayfa görünümleri (Auth, Resource listeleri, Dashboard vb.).
- `src/services`: API isteklerini yöneten servis katmanı.
- `src/stores`: Global state yönetimi (Auth, Config vb.).
- `src/lib`: Yardımcı fonksiyonlar ve Axios yapılandırması.
- `src/hooks`: Custom React hook'ları.
