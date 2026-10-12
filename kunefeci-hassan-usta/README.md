# Künefeci Hassan Usta — Web Sitesi

Şanlıurfa'daki Künefeci Hassan Usta için iki dilli (Türkçe, İngilizce) web sitesi.
Önceliği menü olan, telefonda hızlı açılan, Google'da işletme bilgileri doğru görünen bir site.

**Teknoloji:** Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript

## Sayfalar

| Adres | İçerik |
| --- | --- |
| `/tr` | Ana sayfa = menü: arama, kategori çubuğu, ürün detayı, tatlı çarkı, alerjenler, yazdırılabilir. Adres, telefon ve saatler sayfanın altında |
| `/tr/gizlilik` | Gizlilik ve KVKK aydınlatma metni |
| `/tr/qr` | Masalara konacak yazdırılabilir QR kartı (Google'a kapalı) |

Site açılırken bir an işletmenin logosu görünür (her ziyarette bir kez; sayfa yenilenince tekrar
çıkmaz). Logo dosyası `src/assets/brand/logo.png`, açılış `src/components/Splash.tsx` içindedir.

`/en/...` İngilizce sürümdür. Önek olmadan gelen her adres Türkçeye yönlenir.
Eski `/menu` adresleri (ör. basılmış bir QR kodu) ana sayfaya, yani menüye yönlenir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # yayın öncesi kontrol
npm run lint
```

## İçeriği güncelleme

Her şey `src/content/` klasöründedir; kod bilmeden düzenlenebilecek şekilde açıklamalıdır.

| Dosya | Ne var? |
| --- | --- |
| `src/content/site.ts` | Telefon, WhatsApp, adres, konum, çalışma saatleri, Instagram |
| `src/content/menu.ts` | Kategoriler, ürünler, fiyatlar, alerjenler, etiketler |
| `src/content/photos.ts` | Hangi fotoğrafın nerede kullanılacağı |
| `src/content/privacy.ts` | Gizlilik / KVKK metni |
| `src/i18n/dictionaries/` | Sitedeki tüm yazılar (tr, en) |

- **Fiyat değiştirmek:** `menu.ts` içinde ürünün `amount` değerini değiştirin (`220` = ₺220).
  Sonra dosyanın başındaki `menuUpdatedAt` tarihini güncelleyin.
- **Ürünü geçici kaldırmak:** ürüne `available: false` ekleyin.
- **Fotoğraf değiştirmek:** şu an sitede Pexels/Unsplash'tan alınmış temsili fotoğraflar var
  (kaynaklar: `src/assets/photos/KAYNAKLAR.md`). Dükkânın kendi fotoğrafını `src/assets/photos/`
  içindeki dosyanın üstüne aynı adla kaydetmek yeterli (örneğin `kunefe1.jpg`). Menünün en
  üstündeki koyu bandın arkasında soluk duran fotoğraf `yapim.jpg`'dir (dükkânın önü).
  En az 1400 piksel, iyi ışıklı fotoğraflar en iyi sonucu verir.

## Yayına almadan önce yapılacaklar

`site.ts` içinde `DOLDURULACAK` yazan her alanı gerçek bilgiyle değiştirin:

- [ ] Telefon ve WhatsApp numarası
- [ ] Açık adres ve haritadaki konum (Google Haritalar'da dükkâna sağ tıklayıp koordinatı kopyalayın)
- [ ] Çalışma saatleri
- [ ] Instagram kullanıcı adı
- [ ] Alan adı (`url`) — ya da Vercel'de `NEXT_PUBLIC_SITE_URL` ortam değişkeni
- [ ] `menu.ts` içindeki **örnek fiyatlar** → gerçek fiyatlar
- [ ] Dükkânın kendi fotoğrafları (künefe, tatlılar, içecekler, dükkân, usta)
- [ ] Hikâye metni (`src/i18n/dictionaries/`) — işletmenin gerçek hikâyesine göre düzenleyin
- [ ] Gizlilik metnini bir hukukçuya kontrol ettirin

## Yayına alma (Vercel)

1. [vercel.com](https://vercel.com) → **Add New Project** → bu GitHub deposunu seçin.
2. **Root Directory** olarak `kunefeci-hassan-usta` klasörünü seçin.
3. Ortam değişkeni: `NEXT_PUBLIC_SITE_URL=https://alanadiniz.com`
4. **Deploy**. Sonra alan adını Vercel'den bağlayın.
5. [Google İşletme Profili](https://business.google.com)'nde web sitesi alanına adresi yazın ve
   [Search Console](https://search.google.com/search-console)'a `https://alanadiniz.com/sitemap.xml` ekleyin.

## Notlar

- **Logo:** `src/components/Logo.tsx`, tabeladaki logonun vektör çizimidir (Berkshire Swash yazı tipiyle).
  Tabelacıdan orijinal vektör dosyası (AI/PDF/SVG) alınırsa onunla değiştirilebilir.
  Tabelanın fotoğrafı `docs/logo-tabela.jpg` içinde.
- **Harita** yalnızca ziyaretçi "Haritayı göster"e basınca yüklenir; böylece izinsiz Google çerezi
  oluşmaz ve sayfa daha hızlı açılır.
- **Çerez / analiz aracı yok.** Google Analytics vb. eklenirse çerez onayı ve gizlilik metni güncellenmelidir.
- **SEO:** Her sayfada başlık/açıklama, dil alternatifleri (hreflang), `sitemap.xml`, `robots.txt` ve
  Google için `Restaurant` + `Menu` yapısal verisi (JSON-LD) vardır.
