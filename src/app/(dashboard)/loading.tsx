import { PageLoader } from "@/components/ui/page-loader";

export default function DashboardLoading() {
  return (
    <div className="min-h-[40vh] bg-[#0A1A2F]">
      <PageLoader label="Loading dashboard…" compact tone="dark" />
    </div>
  );
}
