# Künefeci Hassan Usta — Web Sitesi

Şanlıurfa'daki Künefeci Hassan Usta için iki dilli (Türkçe, İngilizce) web sitesi.
Önceliği menü olan, telefonda hızlı açılan, Google'da işletme bilgileri doğru görünen bir site.

**Teknoloji:** Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript

## Sayfalar

Site, masadaki QR kodla açılan bir menü gibi çalışır.

| Adres | İçerik |
| --- | --- |
| `/tr` | Ana sayfa: dükkân fotoğraflı karşılama, arama, hızlı filtreler, tatlı çarkı ve altında menüdeki bütün ürünler (kategori düğmeleriyle) |
| `/tr/menu/kunefeler` | Bir kategorinin ürünleri: büyük kartlar ya da liste. Ürüne dokununca ayrıntı penceresi açılır |
| `/tr/menu/kunefeler#kunefe` | Ürünün ayrıntısı doğrudan açık gelir (paylaşılan bağlantılar böyle görünür) |
| `/tr/ara` | Menüde arama ve filtreler: Fıstıklı, Sıcak, Soğuk, ₺250 altı, Paylaşmalık (Google'a kapalı) |
| `/tr/gizlilik` | Gizlilik ve KVKK aydınlatma metni |
| `/tr/qr` | Masalara konacak yazdırılabilir QR kartları (Google'a kapalı) |
| `/yonetim` | Yönetici paneli: menü, fiyatlar, fotoğraflar, saatler, iletişim (şifreli, Google'a kapalı) |

**Ürün penceresi:** fotoğraf, fiyat, alerjenler, "Yanında iyi gider" (çay, mırra), **Garsona göster**
(ürünün Türkçe adını ve masa numarasını büyük yazıyla gösterir; yabancı misafirler için) ve Paylaş.
Telefonda aşağı kaydırarak ya da geri tuşuyla kapanır.

**Masa numarası:** `/tr/qr?masa=7` adresi 7 numaralı masanın kartını, `/tr/qr?masa=1-12` on iki
kartı birden basar. Kart okutulunca menü açılır, karşılama kartında ve "Garsona göster" ekranında
"Masa 7" yazar.

Site açılırken bir an işletmenin logosu görünür (her ziyarette bir kez; sayfa yenilenince tekrar
çıkmaz). Logo dosyası `src/assets/brand/logo.png`; açılışta kullanılan küçük kopyası
`src/app/splash-logo.css`, açılış `src/components/Splash.tsx` içindedir.

`/en/...` İngilizce sürümdür. Önek olmadan gelen her adres Türkçeye yönlenir.
Eski `/menu` adresleri (ör. basılmış bir QR kodu) ana sayfaya yönlenir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # yayın öncesi kontrol
npm run lint
```

## Yönetici paneli (`/yonetim`)

Menü ve işletme bilgileri kod bilmeden, telefondan değiştirilir. Adres: `https://alanadiniz.com/yonetim`

| Bölüm | Neler değişir? |
| --- | --- |
| **Menü** | Fiyatlar (doğrudan kutudan), ürünü gizleme/gösterme ("bugün yok"), yeni ürün, silme, sıralama, fotoğraf yükleme, Türkçe/İngilizce ad ve açıklama, Porsiyon / 1 kg gibi fiyat seçenekleri, etiketler, alerjenler; kategori ekleme, silme, sıralama, kapak fotoğrafı |
| **Duyuru** | Ana sayfanın üstündeki kısa not (ör. bayram kapanışı) |
| **İşletme bilgileri** | Telefon, WhatsApp, Instagram, adres, harita konumu, çalışma saatleri |

Değişiklikler alttaki **Kaydet** ile kaydedilir ve sitede hemen görünür. İngilizce alanlar boş
bırakılırsa İngilizce menüde Türkçesi gösterilir. Telefondan yüklenen fotoğraflar küçültülür,
düzeltilir ve içindeki konum bilgisi silinir.

### Kurulum (bir kez)

1. **Şifre:** Vercel → proje → **Settings → Environment Variables** → `ADMIN_PASSWORD` ekleyin.
   En az 8 karakter; uzun ve tahmin edilmesi zor olsun (ör. üç-dört kelimelik bir cümle).
   Şifreyi değiştirince herkesin oturumu kapanır.
2. **Kayıt yeri:** Vercel → proje → **Storage → Create → Blob** → projeye bağlayın.
   Vercel `BLOB_READ_WRITE_TOKEN` ayarını kendisi ekler. Menü ve yüklenen fotoğraflar burada durur;
   her kayıtta son 20 sürüm yedek olarak saklanır.
3. **Redeploy** edin, sonra `/yonetim` adresinden girin.

Vercel dışında kendi sunucunuzda çalıştırırsanız Blob gerekmez: içerik proje klasöründeki `.data/`
klasörüne yazılır (bu klasörü yedekleyin).

### Başlangıç içeriği

Panelden ilk kayıt yapılana kadar site `src/content/menu.ts` (menü) ve `src/content/site.ts`
(`defaultInfo`: telefon, adres, saatler) dosyalarındaki başlangıç içeriğini gösterir. İlk kayıttan
sonra bu dosyalar okunmaz.

| Dosya | Ne var? |
| --- | --- |
| `src/content/photos.ts` | Siteyle gelen fotoğraflar (`src/assets/photos/`) |
| `src/content/privacy.ts` | Gizlilik / KVKK metni |
| `src/i18n/dictionaries/` | Sitedeki sabit yazılar (tr, en) |

## Yayına almadan önce yapılacaklar

Panelden:

- [ ] Telefon, WhatsApp, Instagram, açık adres ve harita konumu
- [ ] Çalışma saatleri
- [ ] **Örnek fiyatlar** → gerçek fiyatlar
- [ ] Dükkânın kendi fotoğrafları

Kodda / Vercel'de:

- [ ] Alan adı: Vercel'de `NEXT_PUBLIC_SITE_URL` ortam değişkeni
- [ ] Gizlilik metnini bir hukukçuya kontrol ettirin

## Yayına alma (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → bu GitHub deposunu seçin.
2. **Root Directory** olarak `kunefeci-hassan-usta` klasörünü seçin.
3. Ortam değişkenleri: `NEXT_PUBLIC_SITE_URL=https://alanadiniz.com` ve `ADMIN_PASSWORD=…`
4. **Storage → Blob** deposu oluşturup projeye bağlayın (panelin kayıt yeri).
5. **Deploy**. Sonra alan adını Vercel'den bağlayın.
6. [Google İşletme Profili](https://business.google.com)'nde web sitesi alanına adresi yazın ve
   [Search Console](https://search.google.com/search-console)'a `https://alanadiniz.com/sitemap.xml` ekleyin.

## Notlar

- **Logo:** `src/components/Logo.tsx`, tabeladaki logonun vektör çizimidir (Berkshire Swash yazı tipiyle).
  Tabelacıdan orijinal vektör dosyası (AI/PDF/SVG) alınırsa onunla değiştirilebilir.
  Tabelanın fotoğrafı `docs/logo-tabela.jpg` içinde.
- **Çerez / analiz aracı yok.** Ziyaretçilere çerez konmaz; yalnızca panele giren kişiye oturum çerezi konur.
  Google Analytics vb. eklenirse çerez onayı ve gizlilik metni güncellenmelidir.
- **SEO:** Her sayfada başlık/açıklama, dil alternatifleri (hreflang), `sitemap.xml`, `robots.txt` ve
  Google için `Restaurant` + `Menu` yapısal verisi (JSON-LD) vardır.
