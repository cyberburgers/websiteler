import type { Locale } from "@/i18n/config";

/**
 * Gizlilik / KVKK aydınlatma metni. Sitenin bugünkü hâlini anlatır: form, üyelik,
 * analiz çerezi yok. Analiz aracı, iletişim formu vb. eklenirse bu metin
 * güncellenmelidir. Yayından önce bir hukukçuya kontrol ettirmeniz önerilir.
 */
export const privacyUpdatedAt = "2026-10-11";

type Section = { title: string; body: string[] };

export const privacy: Record<Locale, { intro: string; sections: Section[] }> = {
  tr: {
    intro:
      "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, sitemizi ziyaret ettiğinizde hangi verilerin nasıl işlendiğini açıklar.",
    sections: [
      {
        title: "Veri sorumlusu",
        body: ["Künefeci Hassan Usta. Adres ve iletişim bilgilerimiz sayfanın altında yer alır."],
      },
      {
        title: "Topladığımız veriler",
        body: [
          "Sitemizde üyelik, sipariş veya iletişim formu yoktur; adınız, telefonunuz gibi bilgileri site üzerinden toplamıyoruz.",
          "Sitemiz reklam veya ziyaretçi takibi amaçlı çerez kullanmaz.",
          "Sitenin barındırıldığı sunucu sağlayıcısı, güvenlik ve hizmetin sürekliliği için IP adresi, tarayıcı türü ve ziyaret zamanı gibi teknik kayıtları kısa süreliğine tutabilir.",
        ],
      },
      {
        title: "Üçüncü taraf hizmetler",
        body: [
          'Harita: Google Haritalar yalnızca siz "Haritayı göster" düğmesine bastığınızda yüklenir. Bu andan itibaren Google\'ın gizlilik politikası geçerlidir.',
          "WhatsApp ve telefon: Bize WhatsApp üzerinden yazdığınızda ya da aradığınızda paylaştığınız bilgiler yalnızca talebinizi yanıtlamak için kullanılır. WhatsApp kullanımı Meta'nın gizlilik koşullarına tabidir.",
        ],
      },
      {
        title: "Haklarınız",
        body: [
          "KVKK'nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.",
          "Taleplerinizi sayfanın altındaki iletişim bilgilerinden bize iletebilirsiniz.",
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
        body: ["Künefeci Hassan Usta. Our address and contact details are at the bottom of the page."],
      },
      {
        title: "What we collect",
        body: [
          "There are no accounts, orders or contact forms on this site; we do not collect your name or phone number through it.",
          "We do not use advertising or visitor-tracking cookies.",
          "Our hosting provider may briefly keep technical logs such as IP address, browser type and time of visit for security and reliability.",
        ],
      },
      {
        title: "Third-party services",
        body: [
          'Map: Google Maps loads only when you press "Show map". From then on, Google\'s privacy policy applies.',
          "WhatsApp and phone: anything you share when you message or call us is used only to answer your request. WhatsApp is subject to Meta's privacy terms.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "Under Article 11 of the KVKK you may ask whether your data is processed, request information, ask for correction or deletion, and object to processing.",
          "You can send requests using the contact details at the bottom of the page.",
        ],
      },
    ],
  },
};
