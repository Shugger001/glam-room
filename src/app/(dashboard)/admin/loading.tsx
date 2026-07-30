import { PageLoader } from "@/components/ui/page-loader";

/** Shown inside the admin shell while navigating between /admin pages. */
export default function AdminLoading() {
  return <PageLoader label="Loading…" compact tone="dark" />;
}
