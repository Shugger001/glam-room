import { BRAND } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

type SocialIconProps = {
  className?: string;
};

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.92A3.12 3.12 0 1 1 12 8.88a3.12 3.12 0 0 1 0 6.24Z" />
      <path d="M17.52 6.12a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0Z" />
      <path d="M12 2.4c-2.62 0-2.95.01-3.98.06-1.02.05-1.72.21-2.33.45a4.72 4.72 0 0 0-1.7 1.1 4.72 4.72 0 0 0-1.1 1.7c-.24.61-.4 1.31-.45 2.33C2.41 9.05 2.4 9.38 2.4 12s.01 2.95.06 3.98c.05 1.02.21 1.72.45 2.33a4.72 4.72 0 0 0 1.1 1.7 4.72 4.72 0 0 0 1.7 1.1c.61.24 1.31.4 2.33.45 1.03.05 1.36.06 3.98.06s2.95-.01 3.98-.06c1.02-.05 1.72-.21 2.33-.45a4.72 4.72 0 0 0 1.7-1.1 4.72 4.72 0 0 0 1.1-1.7c.24-.61.4-1.31.45-2.33.05-1.03.06-1.36.06-3.98s-.01-2.95-.06-3.98c-.05-1.02-.21-1.72-.45-2.33a4.72 4.72 0 0 0-1.1-1.7 4.72 4.72 0 0 0-1.7-1.1c-.61-.24-1.31-.4-2.33-.45C14.95 2.41 14.62 2.4 12 2.4Zm0 1.68c2.57 0 2.88.01 3.9.06.94.04 1.45.2 1.79.33.45.17.77.38 1.11.72.34.34.55.66.72 1.11.13.34.29.85.33 1.79.05 1.02.06 1.33.06 3.9s-.01 2.88-.06 3.9c-.04.94-.2 1.45-.33 1.79-.17.45-.38.77-.72 1.11-.34.34-.66.55-1.11.72-.34.13-.85.29-1.79.33-1.02.05-1.33.06-3.9.06s-2.88-.01-3.9-.06c-.94-.04-1.45-.2-1.79-.33a2.98 2.98 0 0 1-1.11-.72 2.98 2.98 0 0 1-.72-1.11c-.13-.34-.29-.85-.33-1.79-.05-1.02-.06-1.33-.06-3.9s.01-2.88.06-3.9c.04-.94.2-1.45.33-1.79.17-.45.38-.77.72-1.11.34-.34.66-.55 1.11-.72.34-.13.85-.29 1.79-.33 1.02-.05 1.33-.06 3.9-.06Z" />
    </svg>
  );
}

function TikTokIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.76 2.89 2.89 0 0 1-2.94-2.84 2.89 2.89 0 0 1 2.94-2.85c.3 0 .6.05.88.13v-3.4a6.37 6.37 0 0 0-.88-.06A6.34 6.34 0 0 0 3.15 15.4a6.34 6.34 0 0 0 12.68.08V8.9a8.2 8.2 0 0 0 4.76 1.52V6.98a4.84 4.84 0 0 1-1-.29Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2a9.94 9.94 0 0 0-8.55 14.94L2 22l5.2-1.36A9.94 9.94 0 1 0 12.04 2Zm0 18.16a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.09.81.82-3.01-.2-.31a8.22 8.22 0 1 1 6.95 3.84Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: BRAND.links.instagram,
    Icon: InstagramIcon,
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: BRAND.links.tiktok,
    Icon: TikTokIcon,
  },
  {
    id: "youtube",
    label: "YouTube",
    href: BRAND.links.youtube,
    Icon: YouTubeIcon,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: BRAND.links.whatsapp,
    Icon: WhatsAppIcon,
  },
] as const;

type SocialLinksProps = {
  className?: string;
  iconClassName?: string;
};

export function SocialLinks({ className, iconClassName }: SocialLinksProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex h-11 w-11 items-center justify-center text-glam-primary/70 transition duration-200 hover:text-glam-accent active:scale-[0.97]"
          >
            <Icon className={cn("h-5 w-5", iconClassName)} />
          </a>
        </li>
      ))}
    </ul>
  );
}
