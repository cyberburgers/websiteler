import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { privacy, privacyUpdatedAt } from "@/content/privacy";
import { site } from "@/content/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/gizlilik">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/gizlilik",
    title: dict.meta.privacyTitle,
    description: privacy[locale].intro,
  });
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/gizlilik">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const content = privacy[locale];

  return (
    <>
      <PageHero eyebrow={site.name} title={dict.meta.privacyTitle} />
      <section className="grain bg-krem-100 py-16 md:py-24">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-xl leading-relaxed text-zumrut-800/85">{content.intro}</p>
            <div className="mt-12 space-y-12">
              {content.sections.map((section) => (
                <div key={section.title}>
                  <h2 className="font-display text-3xl font-medium text-zumrut-800">{section.title}</h2>
                  <div className="mt-4 space-y-3 text-[17px] leading-relaxed text-zumrut-800/75">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-14 border-t border-zumrut-800/10 pt-6 text-sm text-zumrut-800/55">
              {dict.menu.updated}: {formatDate(privacyUpdatedAt, locale)}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
