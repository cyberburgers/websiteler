import type { PhotoKey } from "./photos";

/**
 * MENÜ — fiyatları, ürünleri ve açıklamaları buradan güncelleyin.
 *
 * - Fiyatlar Türk Lirası, KDV dahil, tam sayı yazılır (220 = ₺220).
 * - Şu anki fiyatlar ÖRNEKTİR; yayından önce gerçek fiyatlarla değiştirin.
 * - Bir ürünü geçici olarak kaldırmak için `available: false` yazın.
 * - Her metnin üç dili var: tr (Türkçe), en (İngilizce), ar (Arapça).
 */

export type Text = { tr: string; en: string; ar: string };

export type Allergen = "gluten" | "sut" | "kabuklu" | "yumurta";
export type Tag = "imza" | "populer" | "urfa" | "sicak" | "mevsim" | "siparis";

export type Price = { amount: number; label?: Text };

export type MenuItem = {
  id: string;
  name: Text;
  description: Text;
  prices: Price[];
  allergens: Allergen[];
  tags?: Tag[];
  image?: PhotoKey;
  /** Ana sayfadaki "İmza lezzetler" bölümünde gösterilsin mi? */
  featured?: boolean;
  available?: boolean;
};

export type MenuCategory = {
  id: string;
  name: Text;
  description?: Text;
  /** "cards": fotoğraflı kartlar. "list": klasik menü satırları (içecekler gibi). */
  layout: "cards" | "list";
  items: MenuItem[];
};

/** Menünün en son ne zaman güncellendiği (YYYY-AA-GG). Menü sayfasında gösterilir. */
export const menuUpdatedAt = "2026-10-11";

const portion: Text = { tr: "Porsiyon", en: "Portion", ar: "حصة" };
const kilo: Text = { tr: "1 kg", en: "1 kg", ar: "١ كغ" };

export const menu: MenuCategory[] = [
  {
    id: "kunefeler",
    name: { tr: "Künefeler", en: "Künefe", ar: "الكنافة" },
    description: {
      tr: "Siparişle hazırlanır, tepsiden sıcak sıcak gelir.",
      en: "Made to order and served piping hot from the tray.",
      ar: "تُحضَّر عند الطلب وتُقدَّم ساخنة من الصينية.",
    },
    layout: "cards",
    items: [
      {
        id: "hassan-usta-ozel",
        name: { tr: "Hassan Usta Özel", en: "Hassan Usta Special", ar: "كنافة حسن أوسطا الخاصة" },
        description: {
          tr: "Ustanın imzası: çifte fıstık, kaymak ve bir top Maraş dondurmasıyla taçlanan künefe.",
          en: "The master's signature: künefe crowned with double pistachio, kaymak and a scoop of Maraş ice cream.",
          ar: "توقيع المعلّم: كنافة مزيّنة بفستق مضاعف وقشطة وكرة من بوظة مرعش.",
        },
        prices: [{ amount: 340 }],
        allergens: ["gluten", "sut", "kabuklu"],
        tags: ["imza"],
        image: "hero",
        featured: true,
      },
      {
        id: "kunefe",
        name: { tr: "Künefe", en: "Classic Künefe", ar: "كنافة كلاسيكية" },
        description: {
          tr: "İnce tel kadayıf, tuzsuz Urfa peyniri ve sadeyağ; üzerine sıcak şerbet ve dövme fıstık.",
          en: "Fine shredded kadayıf, unsalted Urfa cheese and clarified butter, finished with warm syrup and crushed pistachio.",
          ar: "شعيرية رفيعة مع جبن أورفا غير المملح والسمن، يُسكب عليها القطر الدافئ ويُرشّ الفستق المطحون.",
        },
        prices: [{ amount: 220 }],
        allergens: ["gluten", "sut", "kabuklu"],
        tags: ["populer"],
        image: "kunefe1",
        featured: true,
      },
      {
        id: "fistikli-kunefe",
        name: { tr: "Bol Fıstıklı Künefe", en: "Pistachio-Loaded Künefe", ar: "كنافة بالفستق الحلبي" },
        description: {
          tr: "Klasik künefemizin üzeri bolca dövme Antep fıstığıyla kaplanır.",
          en: "Our classic künefe, generously covered in crushed Antep pistachios.",
          ar: "كنافتنا الكلاسيكية مغطاة بسخاء بالفستق الحلبي المطحون.",
        },
        prices: [{ amount: 260 }],
        allergens: ["gluten", "sut", "kabuklu"],
        tags: ["populer"],
        image: "kunefe2",
        featured: true,
      },
      {
        id: "kaymakli-kunefe",
        name: { tr: "Kaymaklı Künefe", en: "Künefe with Kaymak", ar: "كنافة بالقشطة" },
        description: {
          tr: "Sıcak künefenin yanında soğuk, ağızda dağılan taze kaymak.",
          en: "Hot künefe served with cold, silky clotted cream (kaymak).",
          ar: "كنافة ساخنة تُقدَّم مع القشطة الباردة الطازجة.",
        },
        prices: [{ amount: 280 }],
        allergens: ["gluten", "sut", "kabuklu"],
        image: "kunefe3",
      },
      {
        id: "dondurmali-kunefe",
        name: { tr: "Dondurmalı Künefe", en: "Künefe with Ice Cream", ar: "كنافة مع البوظة" },
        description: {
          tr: "Sıcak künefe ve sakızlı Maraş dondurması: sıcak-soğuk uyumunun en lezzetli hâli.",
          en: "Hot künefe with mastic-scented Maraş ice cream — the perfect hot-and-cold pairing.",
          ar: "كنافة ساخنة مع بوظة مرعش بالمستكة — أجمل تناغم بين الساخن والبارد.",
        },
        prices: [{ amount: 290 }],
        allergens: ["gluten", "sut", "kabuklu"],
        image: "dondurma",
      },
      {
        id: "tepsi-kunefe",
        name: { tr: "Tepsi Künefe", en: "Künefe by the Tray", ar: "صينية كنافة" },
        description: {
          tr: "Davetler, mevlitler ve ofis ikramları için bütün tepsi. Lütfen bir gün önceden haber verin.",
          en: "A whole tray for gatherings, celebrations and office treats. Please order a day ahead.",
          ar: "صينية كاملة للمناسبات والعزائم وضيافة المكاتب. يُرجى الطلب قبل يوم.",
        },
        prices: [
          { amount: 850, label: { tr: "4 kişilik", en: "Serves 4", ar: "لـ٤ أشخاص" } },
          { amount: 1250, label: { tr: "6 kişilik", en: "Serves 6", ar: "لـ٦ أشخاص" } },
        ],
        allergens: ["gluten", "sut", "kabuklu"],
        tags: ["siparis"],
        image: "yapim",
      },
    ],
  },
  {
    id: "serbetli-tatlilar",
    name: { tr: "Şerbetli Tatlılar", en: "Syrup Desserts", ar: "حلويات بالقطر" },
    description: {
      tr: "İncecik yufka, bol fıstık, kıvamında şerbet.",
      en: "Paper-thin pastry, plenty of pistachio, syrup cooked just right.",
      ar: "عجين رقيق، فستق وفير، وقطر بقوام مثالي.",
    },
    layout: "cards",
    items: [
      {
        id: "sillik",
        name: { tr: "Şıllık", en: "Şıllık", ar: "شلّيك أورفا" },
        description: {
          tr: "Urfa'ya özgü: sacda pişen ince krepler cevizle sarılır, şerbetle buluşur.",
          en: "An Urfa original: paper-thin griddle crêpes rolled with walnuts and soaked in syrup.",
          ar: "حلوى أورفا الأصيلة: رقائق رفيعة على الصاج تُلفّ بالجوز وتُغمر بالقطر.",
        },
        prices: [{ amount: 200 }],
        allergens: ["gluten", "sut", "yumurta", "kabuklu"],
        tags: ["urfa"],
        image: "sillik",
        featured: true,
      },
      {
        id: "fistikli-baklava",
        name: { tr: "Fıstıklı Baklava", en: "Pistachio Baklava", ar: "بقلاوة بالفستق" },
        description: {
          tr: "Kat kat incecik yufka, Antep fıstığı ve sadeyağ.",
          en: "Layer upon layer of paper-thin pastry, Antep pistachio and clarified butter.",
          ar: "طبقات رقيقة من العجين مع الفستق الحلبي والسمن.",
        },
        prices: [
          { amount: 220, label: portion },
          { amount: 1600, label: kilo },
        ],
        allergens: ["gluten", "sut", "kabuklu"],
        image: "baklava",
      },
      {
        id: "burma-kadayif",
        name: { tr: "Burma Kadayıf", en: "Burma Kadayıf", ar: "كنافة مبرومة" },
        description: {
          tr: "Tel kadayıf bütün fıstıkla sarılır, fırında altın rengine kadar pişer.",
          en: "Shredded pastry wrapped around whole pistachios and baked until golden.",
          ar: "شعيرية ملفوفة حول الفستق الكامل ومخبوزة حتى تصبح ذهبية.",
        },
        prices: [
          { amount: 220, label: portion },
          { amount: 1500, label: kilo },
        ],
        allergens: ["gluten", "sut", "kabuklu"],
        image: "burma",
      },
      {
        id: "sobiyet",
        name: { tr: "Şöbiyet", en: "Şöbiyet", ar: "شعيبيات" },
        description: {
          tr: "Kaymak ve fıstıkla doldurulan üçgen baklava.",
          en: "Triangular baklava filled with kaymak and pistachio.",
          ar: "بقلاوة مثلثة محشوة بالقشطة والفستق.",
        },
        prices: [{ amount: 230, label: portion }],
        allergens: ["gluten", "sut", "kabuklu"],
        image: "sobiyet",
      },
      {
        id: "fistikli-katmer",
        name: { tr: "Fıstıklı Katmer", en: "Pistachio Katmer", ar: "قطمر بالفستق" },
        description: {
          tr: "Sacda pişen incecik hamur, kaymak ve bol fıstık. Sıcak servis edilir.",
          en: "Paper-thin dough with kaymak and pistachio, griddled to order and served hot.",
          ar: "عجينة رقيقة جداً بالقشطة والفستق، تُخبز على الصاج عند الطلب وتُقدَّم ساخنة.",
        },
        prices: [{ amount: 280 }],
        allergens: ["gluten", "sut", "kabuklu"],
        tags: ["sicak"],
        image: "katmer",
      },
    ],
  },
  {
    id: "sutlu-ve-dondurma",
    name: { tr: "Sütlüler & Dondurma", en: "Puddings & Ice Cream", ar: "حلويات بالحليب وبوظة" },
    layout: "cards",
    items: [
      {
        id: "maras-dondurmasi",
        name: { tr: "Maraş Dondurması", en: "Maraş Ice Cream", ar: "بوظة مرعشية" },
        description: {
          tr: "Salep ve sakızla çekilen, bıçakla kesilen meşhur dövme dondurma.",
          en: "The famous stretchy, knife-cut ice cream made with salep and mastic.",
          ar: "البوظة المرعشية الشهيرة المطاطية بالسحلب والمستكة، تُقطَّع بالسكين.",
        },
        prices: [{ amount: 140 }],
        allergens: ["sut"],
        image: "dondurma",
      },
      {
        id: "firin-sutlac",
        name: { tr: "Fırın Sütlaç", en: "Baked Rice Pudding", ar: "أرز بالحليب في الفرن" },
        description: {
          tr: "Üstü fırında kızaran, soğuk servis edilen ev usulü sütlaç.",
          en: "Home-style rice pudding with a caramelised top, served chilled.",
          ar: "أرز بالحليب على الطريقة البيتية بوجه محمّر في الفرن، يُقدَّم بارداً.",
        },
        prices: [{ amount: 140 }],
        allergens: ["sut"],
        image: "sutlac",
      },
    ],
  },
  {
    id: "sicak-icecekler",
    name: { tr: "Sıcak İçecekler", en: "Hot Drinks", ar: "مشروبات ساخنة" },
    layout: "list",
    items: [
      {
        id: "cay",
        name: { tr: "Çay", en: "Turkish Tea", ar: "شاي تركي" },
        description: {
          tr: "İnce belli bardakta, demli.",
          en: "Strong-brewed, in a tulip glass.",
          ar: "شاي ثقيل في كأس الخصر الرفيع.",
        },
        prices: [{ amount: 25 }],
        allergens: [],
        image: "cay",
      },
      {
        id: "mirra",
        name: { tr: "Mırra", en: "Mırra Coffee", ar: "قهوة مُرّة" },
        description: {
          tr: "Urfa'nın meşhur acı kahvesi; küçük fincanda, yudum yudum.",
          en: "Urfa's famous bitter coffee, sipped from tiny cups.",
          ar: "قهوة أورفا المرّة الشهيرة، تُرتشف من فناجين صغيرة.",
        },
        prices: [{ amount: 60 }],
        allergens: [],
        tags: ["urfa"],
        image: "mirra",
      },
      {
        id: "turk-kahvesi",
        name: { tr: "Türk Kahvesi", en: "Turkish Coffee", ar: "قهوة تركية" },
        description: {
          tr: "Közde pişer, lokumla gelir.",
          en: "Slow-brewed and served with Turkish delight.",
          ar: "تُطهى على مهل وتُقدَّم مع راحة الحلقوم.",
        },
        prices: [{ amount: 90 }],
        allergens: [],
        image: "kahve",
      },
      {
        id: "menengic",
        name: { tr: "Menengiç Kahvesi", en: "Menengiç Coffee", ar: "قهوة البطم" },
        description: {
          tr: "Yabani fıstıktan, sütle pişen kafeinsiz kahve.",
          en: "Caffeine-free brew of wild terebinth berries, cooked with milk.",
          ar: "مشروب خالٍ من الكافيين من حبوب البطم البرية، يُطهى بالحليب.",
        },
        prices: [{ amount: 100 }],
        allergens: ["sut"],
      },
      {
        id: "sahlep",
        name: { tr: "Sahlep", en: "Salep", ar: "سحلب" },
        description: {
          tr: "Tarçınla, kış aylarında.",
          en: "Warm and creamy with cinnamon, in winter.",
          ar: "ساخن وكريمي مع القرفة، في الشتاء.",
        },
        prices: [{ amount: 110 }],
        allergens: ["sut"],
        tags: ["mevsim"],
      },
    ],
  },
  {
    id: "soguk-icecekler",
    name: { tr: "Soğuk İçecekler", en: "Cold Drinks", ar: "مشروبات باردة" },
    layout: "list",
    items: [
      {
        id: "ayran",
        name: { tr: "Ayran", en: "Ayran", ar: "عيران" },
        description: {
          tr: "Köpüklü, yayık ayranı.",
          en: "Frothy, salted yoghurt drink.",
          ar: "لبن مخفوق برغوة كثيفة.",
        },
        prices: [{ amount: 40 }],
        allergens: ["sut"],
      },
      {
        id: "meyan-serbeti",
        name: { tr: "Meyan Şerbeti", en: "Licorice Root Sherbet", ar: "عرق السوس" },
        description: {
          tr: "Urfa yazlarının vazgeçilmezi; buz gibi, mevsiminde.",
          en: "The taste of an Urfa summer — ice-cold, in season.",
          ar: "رفيق صيف أورفا — بارد كالثلج، في موسمه.",
        },
        prices: [{ amount: 50 }],
        allergens: [],
        tags: ["urfa", "mevsim"],
      },
      {
        id: "limonata",
        name: { tr: "Ev Yapımı Limonata", en: "Homemade Lemonade", ar: "ليموناضة منزلية" },
        description: {
          tr: "Taze sıkım limon, nane.",
          en: "Freshly squeezed lemon and mint.",
          ar: "ليمون معصور طازج ونعناع.",
        },
        prices: [{ amount: 70 }],
        allergens: [],
      },
      {
        id: "maden-suyu",
        name: { tr: "Maden Suyu", en: "Sparkling Water", ar: "مياه غازية طبيعية" },
        description: { tr: "Sade veya meyveli.", en: "Plain or fruit-flavoured.", ar: "سادة أو بنكهة الفواكه." },
        prices: [{ amount: 30 }],
        allergens: [],
      },
      {
        id: "mesrubat",
        name: { tr: "Meşrubat", en: "Soft Drinks", ar: "مشروبات غازية" },
        description: { tr: "Kola, gazoz, meyve suyu.", en: "Cola, soda, fruit juice.", ar: "كولا، صودا، عصير." },
        prices: [{ amount: 50 }],
        allergens: [],
      },
      {
        id: "su",
        name: { tr: "Su", en: "Water", ar: "ماء" },
        description: { tr: "0,5 lt.", en: "0.5 l.", ar: "٠٫٥ لتر." },
        prices: [{ amount: 15 }],
        allergens: [],
      },
    ],
  },
];

export const allergens: Record<Allergen, Text> = {
  gluten: { tr: "Gluten", en: "Gluten", ar: "غلوتين" },
  sut: { tr: "Süt", en: "Milk", ar: "حليب" },
  kabuklu: { tr: "Kabuklu yemiş", en: "Tree nuts", ar: "مكسرات" },
  yumurta: { tr: "Yumurta", en: "Egg", ar: "بيض" },
};

export const tags: Record<Tag, Text> = {
  imza: { tr: "Ustanın imzası", en: "Signature", ar: "توقيع المعلّم" },
  populer: { tr: "En sevilen", en: "Most loved", ar: "الأكثر طلباً" },
  urfa: { tr: "Urfa'ya özgü", en: "Urfa original", ar: "من أورفا" },
  sicak: { tr: "Sıcak servis", en: "Served hot", ar: "يُقدَّم ساخناً" },
  mevsim: { tr: "Mevsimlik", en: "Seasonal", ar: "موسمي" },
  siparis: { tr: "Ön sipariş", en: "Pre-order", ar: "بطلب مسبق" },
};

export function availableMenu(): MenuCategory[] {
  return menu
    .map((c) => ({ ...c, items: c.items.filter((i) => i.available !== false) }))
    .filter((c) => c.items.length > 0);
}

export function featuredItems(): MenuItem[] {
  return availableMenu().flatMap((c) => c.items.filter((i) => i.featured));
}
