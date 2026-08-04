# React + TypeScript + Vite
s
This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Line & İba Kuaför randevu sistemi

Uygulama Vite/React arayüzünü Vercel'de, randevu verisi ve sunucu işlemlerini Supabase üzerinde çalıştırır.

### Yerel kurulum

1. `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase URL/publishable key değerlerini girin. Eski `VITE_SUPABASE_ANON_KEY` adı da geriye dönük desteklenir.
2. Supabase CLI ile `supabase start` ve `supabase db reset` çalıştırın.
3. `supabase/functions/.env.example` dosyasını `supabase/functions/.env.local` olarak kopyalayın. Yerelde Cloudflare'ın her zaman başarılı test anahtarları kullanılabilir.
4. Fonksiyonları `supabase functions serve --env-file supabase/functions/.env.local` ile başlatın.
5. Siteyi `npm run dev` ile açın. Müşteri akışı `/randevu`, işletme paneli `/yonetim/randevular` adresindedir.

### Canlı ortam değişkenleri

Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_TURNSTILE_SITE_KEY`

Supabase Function Secrets:

- `ALLOWED_ORIGINS`
- `TURNSTILE_SECRET` ve `TURNSTILE_EXPECTED_HOSTNAMES`
- `INTERNAL_FUNCTION_SECRET`
- `META_GRAPH_API_VERSION`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_TEMPLATE`
- `META_WEBHOOK_VERIFY_TOKEN`
- `META_APP_SECRET`
- `ADMIN_PANEL_URL`

Secret'ları yüklemek için `supabase secrets set --env-file supabase/functions/.env.production` kullanın. `.env.production` dosyasını repoya eklemeyin.

### İlk yönetici

Supabase Dashboard > Authentication bölümünden işletme kullanıcısını oluşturun. Ardından SQL Editor'da kullanıcıyı yetkilendirin:

```sql
insert into public.admin_profiles (user_id, role, display_name)
select id, 'owner', 'Line & İba Kuaför'
from auth.users
where email = 'isletme@example.com';
```

### WhatsApp Cloud API

Meta Business hesabında ayrı bir Cloud API gönderici numarası kurun. `new_appointment_owner_tr` utility şablonunun body alanında sırasıyla şu sekiz değişken bulunmalıdır: referans, tarih, saat, hizmet, müşteri adı, telefon, not, yönetim paneli bağlantısı.

Webhook URL'si `https://<project-ref>.supabase.co/functions/v1/whatsapp-webhook` olmalı; doğrulama tokenı `META_WEBHOOK_VERIFY_TOKEN` ile aynı olmalıdır. Uygulamayı WABA'ya abone edin.

`send-whatsapp-notifications` fonksiyonunu Supabase Cron üzerinden her 15 dakikada bir `POST` ile çağırın ve `x-internal-secret` başlığına `INTERNAL_FUNCTION_SECRET` değerini verin. İlk deneme randevu oluşturulurken yapılır; cron yalnız başarısız outbox kayıtlarını yeniden işler. Otomatik denemeler en fazla 5 kez yapılır; sonrasında işletme panelinden manuel tekrar gönderilebilir.

KVKK saklama süresini işletmek için `select public.anonymize_expired_appointments();` çağrısını Supabase Cron ile ayda bir çalıştırın. Varsayılan süre `booking_settings.retention_months` alanında 12 aydır.

### Turnstile

Canlı widget için Cloudflare hesabında `localhost`, `127.0.0.1` ve üretim alan adını içeren managed Turnstile widget oluşturun. Site anahtarını Vercel'e, secret'ı yalnız Supabase Function Secrets'a koyun. Sunucu doğrulaması `booking-create` içinde canonical `siteverify` çağrısıyla ve `turnstile-spin-v2` action kontrolüyle yapılır.

Geçici test modunda Turnstile kapalıdır. Yeniden etkinleştirmek için Vercel'de `VITE_TURNSTILE_ENABLED=true`, Supabase Function Secrets içinde `TURNSTILE_ENABLED=true` ayarlayın ve iki uygulamayı yeniden deploy edin.

### Doğrulama

```bash
npm run build
npm run lint
deno check supabase/functions/*/index.ts
npm run test:edge
supabase test db
npm run test:concurrency
```

Eşzamanlılık testi yerel Supabase veritabanını (`127.0.0.1:54322`) hedefler ve aynı saate paralel 20 istekten tam olarak birinin kayıt oluşturduğunu doğrular. Farklı bir test veritabanı için `BOOKING_TEST_DB_URL` kullanabilirsiniz.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
