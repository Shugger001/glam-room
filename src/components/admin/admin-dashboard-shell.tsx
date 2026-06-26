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
          className="object-cover object-[center_18%] opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/88 via-glam-primary/74 to-glam-primary/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-glam-primary/55 via-glam-primary/25 to-glam-primary/55" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
