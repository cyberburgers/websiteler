import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";
import { Logo } from "./Logo";
import { HoursList } from "./OpenStatus";
import { links, site } from "@/content/site";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const nav = [
    { href: localePath(locale), label: dict.nav.home },
    { href: localePath(locale, "/menu"), label: dict.nav.menu },
    { href: `${localePath(locale)}#hikaye`, label: dict.nav.story },
    { href: `${localePath(locale)}#tepsi`, label: dict.nav.trays },
    { href: `${localePath(locale)}#ziyaret`, label: dict.nav.visit },
  ];

  return (
    <footer className="print-hidden pattern-star relative overflow-hidden bg-lacivert-950 pb-28 pt-20 text-krem-100 md:pb-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-karamel-500/15 blur-3xl"
      />
      <div className="container-page relative">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo id="footer-logo" className="w-40" />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-krem-100/70">{dict.footer.tagline}</p>
            <div className="mt-6 flex gap-3">
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-11 place-items-center rounded-full bg-krem-50/[0.07] text-krem-50 ring-1 ring-krem-50/10 transition hover:bg-krem-50/15"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href={links.whatsapp(dict.actions.whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid size-11 place-items-center rounded-full bg-krem-50/[0.07] text-krem-50 ring-1 ring-krem-50/10 transition hover:bg-krem-50/15"
              >
                <WhatsAppIcon className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sari-300">{dict.footer.explore}</h2>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-krem-100/80 transition hover:text-krem-50">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sari-300">{dict.visit.contact}</h2>
            <ul className="mt-5 space-y-4 text-krem-100/80">
              <li>
                <a
                  href={links.mapsSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 hover:text-krem-50"
                >
                  <MapPin className="mt-0.5 size-5 shrink-0 text-karamel-300" aria-hidden="true" />
                  <span>
                    {site.address.street}
                    <br />
                    {site.address.district} / {site.address.city}
                  </span>
                </a>
              </li>
              <li>
                <a href={links.tel} className="flex gap-3 hover:text-krem-50">
                  <Phone className="mt-0.5 size-5 shrink-0 text-karamel-300" aria-hidden="true" />
                  <span dir="ltr">{site.phoneDisplay}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-sari-300">{dict.visit.hours}</h2>
            <div className="mt-3">
              <HoursList days={dict.days} labels={dict.status} />
            </div>
          </div>
        </div>

        <p
          className="font-brand mt-20 select-none text-center text-[clamp(2.75rem,10vw,8.5rem)] leading-none text-krem-50/[0.06]"
          aria-hidden="true"
        >
          Künefeci Hassan Usta
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-krem-50/10 pt-6 text-sm text-krem-100/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {site.name}. {dict.footer.rights}
          </p>
          <div className="flex gap-5">
            <span>{dict.footer.photoNote}</span>
            <Link
              href={localePath(locale, "/gizlilik")}
              className="underline-offset-4 hover:text-krem-50 hover:underline"
            >
              {dict.footer.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
