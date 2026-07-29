import { Reveal } from "@/components/motion/reveal";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Section, SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

const ABOUT_IMAGE = "/images/asantewaa-gown-smile.png";

export function AboutPreview() {
  return (
    <Section id="about" background="default">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative aspect-[4/5] overflow-hidden lg:col-span-5 lg:col-start-1">
          <ParallaxImage
            src={ABOUT_IMAGE}
            alt="Asantewaa at Glam Room by Asantewaa"
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="absolute inset-0"
            yRange={["-6%", "6%"]}
            scaleRange={[1.06, 1.1]}
          />
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeader
            eyebrow="Glam Room"
            title="About us"
            description={BRAND.copy.aboutIntro[0]}
            className="!mb-6"
          />
          <Reveal delay={0.12}>
            <p className="max-w-md text-base leading-relaxed text-glam-muted">
              {BRAND.copy.aboutIntro[1]}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
