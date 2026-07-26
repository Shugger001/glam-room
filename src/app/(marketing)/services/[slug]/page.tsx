import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_DESCRIPTIONS,
} from "@/lib/constants/services";
import {
  getSalonServiceBySlug,
  getSalonServiceSlugs,
  getSalonServices,
} from "@/lib/data/live-services";
import { formatShopPrice } from "@/lib/format/money";
import { ServiceCard } from "@/components/services/service-card";

export const revalidate = 300;

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getSalonServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getSalonServiceBySlug(slug);
  if (!service) {
    return { title: "Service" };
  }

  return {
    title: service.name,
    description: `${service.description} From ${formatShopPrice(service.price)} at ${BRAND.fullName} in Accra.`,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getSalonServiceBySlug(slug);
  if (!service) notFound();

  const related = (await getSalonServices())
    .filter((item) => item.category === service.category && item.id !== service.id)
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={SERVICE_CATEGORIES[service.category]}
        title={service.name}
        description={SERVICE_CATEGORY_DESCRIPTIONS[service.category]}
      />

      <section className="container-narrow pb-16 sm:pb-24">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-premium">
            <Image
              src={service.image}
              alt={service.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
              {service.durationMinutes} minutes
            </p>
            <h2 className="heading-display mt-3 text-3xl text-glam-primary sm:text-4xl">
              {service.name}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-glam-muted">
              {service.description}
            </p>
            <p className="mt-6 text-2xl font-semibold text-glam-primary">
              {formatShopPrice(service.price)}
            </p>
            {service.category === "braids" ? (
              <p className="mt-4 text-sm text-glam-muted" role="note">
                {BRAND.copy.braidsNotice}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={`/book?service=${service.id}`}
                variant="accent"
                size="lg"
                className="justify-center"
              >
                Book this service
              </ButtonLink>
              <ButtonLink href="/services" variant="outline" size="lg" className="justify-center">
                All services
              </ButtonLink>
            </div>

            <p className="mt-8 text-sm text-glam-muted">
              Prefer WhatsApp?{" "}
              <Link
                href={BRAND.links.whatsapp}
                className="font-medium text-glam-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Message Glam Room
              </Link>
            </p>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-20">
            <h3 className="heading-display text-center text-2xl text-glam-primary sm:text-3xl">
              More in {SERVICE_CATEGORIES[service.category]}
            </h3>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {related.map((item, index) => (
                <ServiceCard key={item.id} service={item} index={index} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <CtaBand />
    </>
  );
}
