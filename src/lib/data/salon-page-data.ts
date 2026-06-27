import { getSalonServices } from "@/lib/data/live-services";
import { getLiveGallery } from "@/lib/data/live-gallery";
import { getStaffMembers } from "@/lib/data/live-staff";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";
import { getLiveSiteContent } from "@/lib/data/live-site-content";

export async function getSalonPageData() {
  const [services, gallery, staff, testimonials, siteContent] = await Promise.all([
    getSalonServices(),
    getLiveGallery(),
    getStaffMembers(),
    getLiveTestimonials(),
    getLiveSiteContent(),
  ]);
  return { services, gallery, staff, testimonials, ...siteContent };
}
