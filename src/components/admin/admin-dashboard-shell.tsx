import Image from "next/image";
import type { ReactNode } from "react";

const ADMIN_BG = "/images/glam-admin-bg.png";

type AdminDashboardShellProps = {
  children: ReactNode;
};

export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-glam-primary text-white">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <Image
          src={ADMIN_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%] opacity-35"
        />
        <div className="absolute inset-0 bg-glam-primary/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/70 via-transparent to-glam-primary/90" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
