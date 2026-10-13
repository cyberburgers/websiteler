import { z } from "zod";
import { MAX_PAIRING, allergenIds, tagIds } from "@/content/menu";
import { isPhotoKey, isUploadedPhoto } from "@/content/photos";

/** Everything the panel can change, checked again on the server before it is stored. */

const text = (max: number) => z.string().trim().max(max);
const bilingual = (max: number) => z.object({ tr: text(max).min(1, "Türkçe metin boş olamaz"), en: text(max) });
const optionalBilingual = (max: number) => z.object({ tr: text(max), en: text(max) });

const photo = z
  .string()
  .refine((v) => isPhotoKey(v) || isUploadedPhoto(v), "Fotoğraf adresi tanınmadı")
  .optional();

const id = z.string().regex(/^[a-z0-9-]{1,60}$/, "Geçersiz kimlik");

const price = z.object({
  amount: z.number().int("Fiyat tam sayı olmalı").min(0).max(1_000_000),
  label: optionalBilingual(40).optional(),
});

const item = z.object({
  id,
  name: bilingual(80),
  shortName: optionalBilingual(40).optional(),
  description: optionalBilingual(400),
  prices: z.array(price).min(1, "Her ürünün en az bir fiyatı olmalı").max(6),
  allergens: z.array(z.enum(allergenIds as [string, ...string[]])).max(8),
  tags: z.array(z.enum(tagIds as [string, ...string[]])).max(6).optional(),
  image: photo,
  available: z.boolean().optional(),
  soldOutSince: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  soldOutOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pairing: z.array(id).max(MAX_PAIRING).optional(),
});

const category = z.object({
  id,
  name: bilingual(60),
  description: optionalBilingual(200).optional(),
  layout: z.enum(["cards", "list"]),
  image: photo,
  items: z.array(item).max(80),
});

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat 10:00 gibi yazılmalı");

const info = z.object({
  phone: z.string().regex(/^\+\d{8,15}$/, "Telefon numarası anlaşılamadı"),
  phoneDisplay: text(30).min(1, "Telefon boş olamaz"),
  whatsapp: z.string().regex(/^\d{8,15}$/).optional(),
  instagram: z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Instagram kullanıcı adı anlaşılamadı"),
  address: z.object({
    street: text(120).min(1, "Adres boş olamaz"),
    district: text(60),
    city: text(60).min(1, "İl boş olamaz"),
    postalCode: text(10),
    country: z.literal("TR"),
  }),
  geo: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  hours: z
    .array(z.object({ day: z.number().int().min(1).max(7), open: time, close: time }))
    .max(7)
    .refine((h) => new Set(h.map((d) => d.day)).size === h.length, "Bir gün iki kez yazılmış"),
});

export const contentSchema = z
  .object({
    info,
    menu: z.array(category).max(30),
    featuredId: id.optional(),
    notice: optionalBilingual(160).optional(),
    tableOrders: z.boolean().optional(),
    tables: z.number().int().min(1).max(999).optional(),
    pairing: z.array(id).max(MAX_PAIRING).optional(),
    menuUpdatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    savedAt: z.string().optional(),
  })
  .superRefine((content, ctx) => {
    // Dishes open by their id in the address bar, and the home page lists them all, so ids are unique site-wide.
    const seen = new Set<string>();
    for (const c of content.menu) {
      if (seen.has(c.id)) ctx.addIssue({ code: "custom", message: `"${c.name.tr}" kategorisi iki kez var` });
      seen.add(c.id);
    }
    const items = new Set<string>();
    for (const i of content.menu.flatMap((c) => c.items)) {
      if (items.has(i.id)) ctx.addIssue({ code: "custom", message: `"${i.name.tr}" iki kez var` });
      items.add(i.id);
    }
  });

export type StoredContent = z.infer<typeof contentSchema>;
