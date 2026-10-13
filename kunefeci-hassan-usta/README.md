# Künefeci Hassan Usta — Web Sitesi

Şanlıurfa'daki Künefeci Hassan Usta için iki dilli (Türkçe, İngilizce) web sitesi.
Önceliği menü olan, telefonda hızlı açılan, Google'da işletme bilgileri doğru görünen bir site.

**Teknoloji:** Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript

## Sayfalar

Site, masadaki QR kodla açılan bir menüdür: müşteri zaten dükkândadır. Bu yüzden telefon, yol tarifi
ya da WhatsApp düğmeleri yoktur; sayfanın altında yalnızca Instagram, adres ve saatler durur.

| Adres | İçerik |
| --- | --- |
| `/tr` | Menü tek sayfadır: dükkân fotoğraflı karşılama, hızlı filtreler, tatlı çarkı ve altında bütün ürünler. Üstteki kategori düğmeleri sayfayı o kategorinin başlığına kaydırır; ürüne dokununca ayrıntı penceresi açılır |
| `/tr#kunefe` | Ürünün ayrıntısı doğrudan açık gelir (paylaşılan bağlantılar, arama sonuçları, tatlı çarkı ve "Yanında iyi gider" buraya götürür) |
| `/tr/ara` | Menüde arama ve filtreler: Fıstıklı, Sıcak, Soğuk, Paylaşmalık. Ana sayfada arama çubuğu yok; filtre düğmeleri buraya açılır (Google'a kapalı) |
| `/tr/gizlilik` | Gizlilik ve KVKK aydınlatma metni |
| `/tr/qr` | Masalara konacak yazdırılabilir QR kartları (Google'a kapalı) |
| `/yonetim` | Yönetici paneli: menü, fiyatlar, fotoğraflar, saatler, iletişim (şifreli, Google'a kapalı) |
| `/garson?k=…` | Kasadaki tablet için garson ekranı: çağrılar ve siparişler (adresi panelde) |

Üstte ortada logo, sağda anahtarlı **Yönetici** düğmesi durur (ana sayfa dışında solda geri düğmesi);
dil ve arama düğmesi yoktur. Yönetici düğmesi şifre penceresini menünün üstünde, arkası bulanık açar; giriş
yapılmışsa doğrudan panele geçer.

**Ürün penceresi:** fotoğraf, fiyat, "Yanında iyi gider" (panelden ayarlanır; başlangıçta çay ve mırra) ve Paylaş.
Alerjen bilgisi sitede gösterilmez; panelde ürünün içinde tutulur, müşteri sorarsa oradan bakılır. Masada
**Siparişe ekle** (boy seçimiyle: Porsiyon / 1 kg); masa dışında ya da sipariş kapalıyken **Garsona göster**
(ürünün Türkçe adını büyük yazıyla gösterir; yabancı misafirler için). Telefonda aşağı kaydırarak ya da
geri tuşuyla kapanır.

**Masa numarası:** `/tr/qr?masa=7` adresi 7 numaralı masanın kartını, `/tr/qr?masa=1-12` on iki
kartı birden basar. Kart okutulunca menü açılır, karşılama kartında ve alttaki çubukta "Masa 7" yazar.

**Geniş ekran:** telefonda karşılama yazısı dükkân fotoğrafının üstündedir. Tablet ve bilgisayarda fotoğraf
solda yazısız ve bütün durur; sağ sütunun başında karşılama, altında filtreler ve çark. Menüde bir
kategorinin son satırı yarım kalmasın diye ilk (gerekirse son) ürün iki sütun genişliğinde gösterilir;
sıra panelde verildiği gibi kalır.

Site her açıldığında (QR okutulunca, yeni sekmede, sayfa yenilenince) iki saniyeden kısa bir açılış
oynar: işletmenin logosu ve etrafında çizilen ince altın halka. Site içinde gezerken tekrar çıkmaz. Logo dosyası `src/assets/brand/logo.png`; açılışta kullanılan küçük kopyası
`src/app/splash-logo.css`, açılış `src/components/Splash.tsx` içindedir.

`/en/...` İngilizce sürümdür. Sayfada dil düğmesi yok: önek olmadan gelen adresler (masa QR'ları dahil)
telefonun diline göre açılır; Türkçe telefon `/tr`, diğer diller `/en`. Eski `/menu` adresleri
(ör. basılmış bir QR kodu) ana sayfaya, eski kategori adresleri (`/tr/menu/kunefeler`) menüde o kategorinin
başlığına yönlenir.

## Garson çağırma

Masa QR kartıyla açılan menünün altında **“Garson çağır”** tuşu durur (sayfa kayarken de görünür).
Müşteri “Garson gelsin” ya da “Hesabı istiyorum”u seçer; çağrı kasadaki tabletteki **garson ekranına**
sesli düşer. Garson “Tamam, gidiyorum”a basınca müşterinin telefonunda “Garson çağrınızı gördü” yazar.

- Tuş yalnızca masa numarası bilinen menüde çıkar (`/tr?masa=7` gibi; masa kartları `/tr/qr?masa=1-12`).
- Aynı masa 40 saniyede bir çağırabilir; cevaplanmayan çağrı 2 dakikada sarıya döner, dakikada bir yeniden öter.
- Garson ekranının adresi ve tabletle okutulacak karekodu: panel → **Masalar**. Adresteki anahtar rastgeledir
  (şifreden üretilmez, adresten şifre tahmin edilemez) ve Redis'te durur. Biri işten ayrılırsa ya da tablet
  kaybolursa **Yeni adres oluştur**: eski adres hemen çalışmaz olur. Personel bu adresle menüyü değiştiremez.
- Yönetici paneli açıkken çağrılar panelde de görünür: üstte “Masa 7 · Garson istiyor” kartı çıkar ve
  cihaz öter (panelde bir kez dokunmak sesi açar). Telefon kilitliyken ya da panel kapalıyken ses gelmez;
  sürekli açık duracak cihaz için garson ekranını kullanın.

**Kurulum (Vercel'de bir kez):** Vercel → proje → **Storage → Marketplace → Upstash (Redis)** → projeye
bağlayın (ücretsiz paket bir dükkân için yeter). Vercel `KV_REST_API_URL` ve `KV_REST_API_TOKEN`
ayarlarını kendisi ekler; sonra **Redeploy**. Bu yapılmadan tuş ve sipariş görünmez. Vercel dışında tek
bir sunucuda Redis gerekmez.

## Masadan sipariş

Yalnızca masa QR kartıyla açılan menüde çalışır; masa dışından bakan için site değişmez.

Masada açılan menünün üstünde kısa bir **“Masanızdan sipariş verin”** kartı çıkar: “Ekle” ile seçin →
siparişi gönderin → masanıza gelsin; “Paket ya da eve servis yok.” Müşteri **Anladım** deyince ya da ilk
siparişi gönderince o ziyaret boyunca bir daha çıkmaz. Böylece “Ekle” online/eve sipariş sanılmaz.

1. Kartlarda “Ayrıntı” yerine **+ Ekle** çıkar; eklenince **− 2 +** olur. Boy seçilen ürünlerde (Porsiyon /
   1 kg) **+ Seç** ürün penceresini açar.
2. Alttaki çubukta garson tuşunun yanına **Siparişi gör** gelir (adet, masa ve tutar). Sepet sayfalar arasında
   gezerken kaybolmaz.
3. Sepette adet değiştirilir, kısa bir not yazılır (ör. “şerbeti az olsun”), **Siparişi Masa 7 için gönder**.
   Düğmede masanın adı yazar; siparişin eve değil bu masaya geldiği açıkça görünür.
4. Sipariş garson ekranına ve açık paneldeki kartlara sesli düşer: kalemler, not, tutar.
   **Onayla** → müşterinin telefonunda “Hazırlanıyor”; **Teslim edildi** → “Afiyet olsun!”.

- Fiyatlar sunucuda menüden hesaplanır; telefondan gelen fiyat kullanılmaz. “Bugün yok” denen ya da
  gizlenen ürün sipariş edilemez (sepetten çıkarılır, müşteriye söylenir).
- Ödeme her zamanki gibi masada ya da kasada alınır; sitede ödeme yok.
- Sipariş çalışma saatlerine bağlı değildir: dükkân kapanış saatinden sonra da çalışabildiği için masadaki
  misafir her zaman sipariş verebilir. Kapatmak için panel → **Masalar** → “Müşteriler masadan sipariş verebilsin”.
- Aynı masadan 20 saniyede bir sipariş; bir masada en çok 6 açık sipariş. Teslim edilmeyen sipariş 3 saat
  sonra ekrandan kalkar.
- Panel → **Masalar** → “Müşteriler masadan sipariş verebilsin” ile kapatılır; kapalıyken yalnızca garson
  çağırma kalır.
- Masa numarası QR'dan gelir: biri adresi elle değiştirirse başka masa adına sipariş verebilir. Garson
  masaya gittiğinde anlaşılır. Panel → **Masalar** → **Masa sayısı** yazılırsa ondan büyük masa numarası
  kabul edilmez. Bir bağlantıdan dakikada en çok 30 çağrı/sipariş gelir (dükkânın wifi'sini paylaşan
  misafirler için bol; sahte çağrıyla ekranı doldurmayı durdurur). Masa numarası telefonda 4 saat geçerlidir.
- Fiyat ya da boy sipariş sırasında panelden değiştiyse sipariş gitmez, misafirden sayfayı yenilemesi istenir
  (garson başka, misafir başka fiyat görmesin). Zayıf bağlantıda "Gönder"e iki kez basmak ikinci sipariş açmaz.
- Garson ekranında bir karta hızlıca iki kez dokunmak siparişi "Onayla"dan "Teslim edildi"ye atlatmaz.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # yayın öncesi kontrol
npm run lint
```

## Yönetici paneli (`/yonetim`)

Menü ve işletme bilgileri kod bilmeden, telefondan değiştirilir. Sitenin sağ üstündeki **Yönetici** düğmesiyle
ya da doğrudan `https://alanadiniz.com/yonetim` adresiyle girilir.

| Bölüm | Neler değişir? |
| --- | --- |
| **Siparişler** | Masalardan gelen siparişler ve garson çağrıları: **Onayla** (misafirin telefonunda "Hazırlanıyor") → **Teslim edildi**; çağrıda **Tamam, gidiyorum**. Panel açıkken her sekmede yumuşak bir zil çalar, üstte "bekleyen" satırı çıkar |
| **Menü** | Fiyatlar (doğrudan kutudan), **Bugün yok** düğmesi (ürün menüde kalır, "Bugün yok" yazar; panelden geri alınana kadar öyle kalır, günler geçtiyse panelde "12 Ekim'den beri yok" diye görünür), ürünü menüden gizleme/gösterme, yeni ürün, silme, sıralama, fotoğraf yükleme, ad ve açıklama, Porsiyon / 1 kg gibi fiyat seçenekleri, etiketler, alerjenler (yalnız panelde), ürüne özel "Yanında iyi gider"; kategori ekleme, silme, sıralama |
| **Öneriler** | Tatlıların altında çıkan "Yanında iyi gider" genel listesi (en çok 4 ürün, seçilen sırayla) |
| **Duyuru** | Ana sayfanın üstündeki kısa not (ör. bayram kapanışı) |
| **Masalar** | Masadan sipariş açık/kapalı, garson ekranının adresi ve karekodu, masa sayısı ve her masanın kalıcı karekodu (indir / kartı bastır) |
| **İşletme bilgileri** | Telefon (Google için), Instagram, adres, harita konumu, çalışma saatleri |

Değişiklikler alttaki **Kaydet** ile kaydedilir ve sitede hemen görünür. Panelde yalnızca Türkçe yazılır:
İngilizce menüde, panelden değiştirilen ad ve açıklamaların Türkçesi görünür (eski çeviri kalmaz). Telefondan yüklenen fotoğraflar küçültülür,
düzeltilir ve içindeki konum bilgisi silinir.

### Kurulum (bir kez)

1. **Şifre:** Vercel → proje → **Settings → Environment Variables** → `ADMIN_PASSWORD` ekleyin.
   En az 8 karakter; uzun ve tahmin edilmesi zor olsun (ör. üç-dört kelimelik bir cümle).
   Şifreyi değiştirince herkesin oturumu kapanır. Aynı bağlantıdan 10 yanlış denemeden sonra giriş
   15 dakika kapanır.
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

## Yayına alma (Vercel)

Bir kez, sırasıyla:

1. [vercel.com](https://vercel.com) → **Add New → Project** → GitHub'daki `websiteler` deposunu seçin.
2. **Root Directory**: `kunefeci-hassan-usta`. Framework kendiliğinden Next.js seçilir.
3. **Environment Variables** → `ADMIN_PASSWORD` = panel şifresi (en az 8 karakter). **Deploy**.
4. Proje → **Storage → Create Database → Blob** → projeye bağlayın. Panelin kayıt yeri (menü, fiyatlar,
   yüklenen fotoğraflar).
5. Proje → **Storage → Marketplace → Upstash (Redis)** → ücretsiz plan → projeye bağlayın. Garson çağırma,
   masadan sipariş ve garson ekranı bununla çalışır.
6. Proje → **Deployments** → son kaydın yanındaki **⋯ → Redeploy** (4. ve 5. adımdaki ayarlar ancak yeni bir
   yayında devreye girer).
7. Alan adı varsa: **Settings → Domains** → alan adını ekleyin, Vercel'in gösterdiği DNS kaydını alan adı
   firmanızın panelinde girin, sonra bir kez daha **Redeploy**. Site kendi adresini Vercel'den öğrenir; QR
   kartları, site haritası ve Google bağlantıları o adresi kullanır. (`NEXT_PUBLIC_SITE_URL` yalnızca başka
   bir adres zorlamak için gerekir.)

Yayından sonra:

- [ ] `/yonetim` → giriş → **İşletme bilgileri**: telefon, Instagram, açık adres, harita konumu, çalışma saatleri
- [ ] **Menü**: örnek fiyatlar yerine gerçek fiyatlar; dükkânın kendi fotoğrafları
- [ ] **Masalar**: masa sayısı; garson ekranının karekodunu kasadaki tabletle okutun, **Sesi aç**
- [ ] **Masa kartları**: `/tr/qr?masa=1-12` (kendi masa sayınız). Sayfa kartların hangi adrese götürdüğünü
      yazar; alan adı bağlandıktan sonra basın. Basmadan önce bir kartı telefonla okutup deneyin.
- [ ] [Google İşletme Profili](https://business.google.com)'nde web sitesi alanına adresi yazın;
      [Search Console](https://search.google.com/search-console)'a `https://alanadiniz.com/sitemap.xml` ekleyin.
- [ ] Gizlilik metnini bir hukukçuya kontrol ettirin.

## Notlar

- **Logo:** `src/components/Logo.tsx`, tabeladaki logonun vektör çizimidir (Berkshire Swash yazı tipiyle).
  Tabelacıdan orijinal vektör dosyası (AI/PDF/SVG) alınırsa onunla değiştirilebilir.
  Tabelanın fotoğrafı `docs/logo-tabela.jpg` içinde.
- **Çerez / analiz aracı yok.** Ziyaretçilere çerez konmaz; yalnızca panele giren kişiye oturum çerezi konur.
  Google Analytics vb. eklenirse çerez onayı ve gizlilik metni güncellenmelidir.
- **SEO:** Her sayfada başlık/açıklama, dil alternatifleri (hreflang), `sitemap.xml`, `robots.txt` ve
  Google için `Restaurant` + `Menu` yapısal verisi (JSON-LD) vardır.
