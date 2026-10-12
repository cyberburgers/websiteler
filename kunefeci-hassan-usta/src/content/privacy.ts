import type { Locale } from "@/i18n/config";

/**
 * Gizlilik / KVKK aydınlatma metni. Sitenin bugünkü hâlini anlatır: form, üyelik,
 * analiz çerezi yok. Analiz aracı, iletişim formu vb. eklenirse bu metin
 * güncellenmelidir. Yayından önce bir hukukçuya kontrol ettirmeniz önerilir.
 */
export const privacyUpdatedAt = "2026-10-12";

type Section = { title: string; body: string[] };

export const privacy: Record<Locale, { intro: string; sections: Section[] }> = {
  tr: {
    intro:
      "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, sitemizi ziyaret ettiğinizde hangi verilerin nasıl işlendiğini açıklar.",
    sections: [
      {
        title: "Veri sorumlusu",
        body: ["Künefeci Hassan Usta. Adresimiz sayfanın altında yer alır."],
      },
      {
        title: "Topladığımız veriler",
        body: [
          "Sitemizde üyelik, sipariş veya iletişim formu yoktur; adınız, telefonunuz gibi bilgileri site üzerinden toplamıyoruz.",
          "Sitemiz reklam veya ziyaretçi takibi amaçlı çerez kullanmaz.",
          "Masa numaranız ve menü görünümü tercihiniz yalnızca kendi tarayıcınızda saklanır; bize gönderilmez.",
          "Sitenin barındırıldığı sunucu sağlayıcısı, güvenlik ve hizmetin sürekliliği için IP adresi, tarayıcı türü ve ziyaret zamanı gibi teknik kayıtları kısa süreliğine tutabilir.",
        ],
      },
      {
        title: "Üçüncü taraf hizmetler",
        body: [
          "Instagram: Sayfanın altındaki Instagram bağlantısı Instagram'ı yeni sekmede açar. Bu andan itibaren Meta'nın gizlilik koşulları geçerlidir.",
        ],
      },
      {
        title: "Haklarınız",
        body: [
          "KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.",
          "Taleplerinizi dükkânımızda ya da sayfanın altındaki adrese yazılı olarak bize iletebilirsiniz.",
        ],
      },
    ],
  },
  en: {
    intro:
      "This notice explains, under Turkey's Personal Data Protection Law No. 6698 (KVKK), what data is processed when you visit our website and how.",
    sections: [
      {
        title: "Data controller",
        body: ["Künefeci Hassan Usta. Our address is at the bottom of the page."],
      },
      {
        title: "What we collect",
        body: [
          "There are no accounts, orders or contact forms on this site; we do not collect your name or phone number through it.",
          "We do not use advertising or visitor-tracking cookies.",
          "Your table number and menu view preference are kept only in your own browser; they are never sent to us.",
          "Our hosting provider may briefly keep technical logs such as IP address, browser type and time of visit for security and reliability.",
        ],
      },
      {
        title: "Third-party services",
        body: [
          "Instagram: the Instagram link at the bottom of the page opens Instagram in a new tab. From then on, Meta's privacy terms apply.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "Under Article 11 of the KVKK you may ask whether your data is processed, request information, ask for correction or deletion, and object to processing.",
          "You can make requests in person at the shop or in writing to the address at the bottom of the page.",
        ],
      },
    ],
  },
};
