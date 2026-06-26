import { getSalonServices } from "@/lib/data/live-services";
import { getLiveGallery } from "@/lib/data/live-gallery";
import { getStaffMembers } from "@/lib/data/live-staff";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";

export async function getSalonPageData() {
  const [services, gallery, staff, testimonials] = await Promise.all([
    getSalonServices(),
    getLiveGallery(),
    getStaffMembers(),
    getLiveTestimonials(),
  ]);
  return { services, gallery, staff, testimonials };
}
