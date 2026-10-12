"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { Field, Section, Toggle, inputClass } from "./fields";

type Update = (change: (draft: SiteContent) => void) => void;

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

/** "0414 123 45 67" → "+904141234567". Turkish numbers may be typed with or without the leading 0 or 90. */
export function internationalDigits(value: string): string {
  const d = value.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("90") && d.length >= 12) return d;
  if (d.startsWith("0")) return `90${d.slice(1)}`;
  return `90${d}`;
}

export function InfoEditor({ content, update }: { content: SiteContent; update: Update }) {
  const { info } = content;
  const [geo, setGeo] = useState(`${info.geo.lat}, ${info.geo.lng}`);
  const geoMatch = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(geo);

  return (
    <div className="space-y-4">
      <Section title="İletişim" hint="Telefon Google'da işletme bilgisi olarak görünür; Instagram sitenin altında.">
        <Field label="Telefon" hint={info.phone ? `Arama bağlantısı: ${info.phone}` : undefined}>
          <input
            type="tel"
            value={info.phoneDisplay}
            placeholder="0 (414) 123 45 67"
            onChange={(e) =>
              update((d) => {
                d.info.phoneDisplay = e.target.value;
                d.info.phone = `+${internationalDigits(e.target.value)}`;
              })
            }
            className={inputClass}
          />
        </Field>
        <Field label="Instagram kullanıcı adı">
          <input
            value={info.instagram}
            placeholder="kunefecihassanusta"
            onChange={(e) =>
              update(
                (d) =>
                  void (d.info.instagram = e.target.value
                    .trim()
                    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
                    .replace(/^@/, "")
                    .replace(/\/.*$/, "")),
              )
            }
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Adres ve konum">
        <Field label="Açık adres">
          <input
            value={info.address.street}
            placeholder="Mahalle, cadde, no"
            onChange={(e) => update((d) => void (d.info.address.street = e.target.value))}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="İlçe">
            <input
              value={info.address.district}
              onChange={(e) => update((d) => void (d.info.address.district = e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="İl">
            <input
              value={info.address.city}
              onChange={(e) => update((d) => void (d.info.address.city = e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Posta kodu">
            <input
              inputMode="numeric"
              value={info.address.postalCode}
              onChange={(e) => update((d) => void (d.info.address.postalCode = e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <Field
          label="Harita konumu"
          hint={
            <>
              Google Haritalar&apos;da dükkâna basılı tutun, çıkan <b>37.15…, 38.79…</b> sayılarını kopyalayıp buraya
              yapıştırın. {geoMatch ? null : <b className="text-red-700">Konum anlaşılamadı.</b>}
            </>
          }
        >
          <span className="flex gap-2">
            <input
              value={geo}
              onChange={(e) => {
                setGeo(e.target.value);
                const m = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(e.target.value);
                if (m) update((d) => void (d.info.geo = { lat: Number(m[1]), lng: Number(m[2]) }));
              }}
              className={inputClass}
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${info.geo.lat},${info.geo.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold ring-1 ring-zumrut-800/15"
            >
              Haritada aç <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </span>
        </Field>
      </Section>

      <Section
        title="Çalışma saatleri"
        hint="Gece yarısından sonra kapanıyorsa kapanışa 01:00 gibi yazın. Kapalı günü kapatın."
      >
        <ul className="divide-y divide-zumrut-800/10">
          {DAYS.map((name, index) => {
            const day = index + 1;
            const hours = info.hours.find((h) => h.day === day);
            return (
              <li key={day} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-24 text-sm font-bold">{name}</span>
                <Toggle
                  checked={Boolean(hours)}
                  label={hours ? "Açık" : "Kapalı"}
                  showLabel
                  onChange={(open) =>
                    update((d) => {
                      d.info.hours = d.info.hours.filter((h) => h.day !== day);
                      if (open) {
                        const like = d.info.hours[0] ?? { open: "10:00", close: "00:00" };
                        d.info.hours.push({ day, open: like.open, close: like.close });
                        d.info.hours.sort((a, b) => a.day - b.day);
                      }
                    })
                  }
                />
                {hours && (
                  <span className="ms-auto flex items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${name} açılış`}
                      value={hours.open}
                      onChange={(e) =>
                        update((d) => void (d.info.hours.find((h) => h.day === day)!.open = e.target.value || "00:00"))
                      }
                      className={`${inputClass} w-28`}
                    />
                    <span aria-hidden="true">–</span>
                    <input
                      type="time"
                      aria-label={`${name} kapanış`}
                      value={hours.close}
                      onChange={(e) =>
                        update((d) => void (d.info.hours.find((h) => h.day === day)!.close = e.target.value || "00:00"))
                      }
                      className={`${inputClass} w-28`}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
