import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import { PageHero } from "@/components/PageHero";
import { buttonStyles } from "@/components/ui";
import { defaultLocale, isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const value = await localeParam();
  const locale = value && isLocale(value) ? value : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero eyebrow="404" title={dict.notFound.title} />
      <section className="grain bg-krem-100 py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-xl leading-relaxed text-lacivert-800/80">{dict.notFound.text}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={localePath(locale)} className={buttonStyles.navy}>
                {dict.actions.seeMenu}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
