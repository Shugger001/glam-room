import { getLiveGallery } from "@/lib/data/live-gallery";
import { getSalonServices } from "@/lib/data/live-services";
import { getStaffMembers } from "@/lib/data/live-staff";
import { getLiveSiteContent } from "@/lib/data/live-site-content";

export async function getSalonPageData() {
  const [services, gallery, staff, siteContent] = await Promise.all([
    getSalonServices(),
    getLiveGallery(),
    getStaffMembers(),
    getLiveSiteContent(),
  ]);
  return { services, gallery, staff, ...siteContent };
}
