import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import {
  getLiveFaqs,
  getLiveLocations,
  getLiveSalonConfig,
} from "@/lib/data/live-site-content";
import {
  parseFaqsFromForm,
  parseLocationsFromForm,
  parseSalonConfigFromForm,
} from "@/lib/validation/admin-site-content";
import {
  AdminBtnPrimary,
  AdminPanel,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

async function upsertSetting(key: string, value: unknown) {
  const admin = createAdminClient();
  await admin.from("site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });
}

function revalidateSitePaths() {
  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/book");
}

async function saveFaqs(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const faqs = parseFaqsFromForm(formData);
  if (faqs.length === 0) return;
  await upsertSetting("faqs", faqs);
  revalidateSitePaths();
}

async function saveLocations(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const locations = parseLocationsFromForm(formData);
  if (locations.length === 0) return;
  await upsertSetting("locations", locations);
  revalidateSitePaths();
}

async function saveSalonConfig(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const config = parseSalonConfigFromForm(formData);
  if (!config) return;
  await upsertSetting("salon_config", config);
  revalidateSitePaths();
}

export default async function AdminContentPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Site content" />;
  }

  await requireSuperAdmin();
  const [faqs, locations, salonConfig] = await Promise.all([
    getLiveFaqs(),
    getLiveLocations(),
    getLiveSalonConfig(),
  ]);

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Site content</h1>
      <p className="mt-3 max-w-3xl text-sm text-white/55">
        Edit FAQs, locations, opening hours, braids notice, and booking time slots without a code
        deploy. Changes appear on the public site within a few minutes.
      </p>

      <section className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="font-display text-xl">FAQs</h2>
        <form
          action={async (formData) => {
            "use server";
            const items = faqs.map((faq, i) => ({
              id: String(formData.get(`faq_id_${i}`) ?? faq.id),
              question: String(formData.get(`faq_q_${i}`) ?? ""),
              answer: String(formData.get(`faq_a_${i}`) ?? ""),
            }));
            formData.set("faqs_json", JSON.stringify(items));
            await saveFaqs(formData);
          }}
          className="mt-4 space-y-4"
        >
          {faqs.map((faq, i) => (
            <div key={faq.id} className="rounded-xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-wider text-white/40">FAQ {i + 1}</p>
              <input type="hidden" name={`faq_id_${i}`} defaultValue={faq.id} />
              <label className="mt-3 block text-xs text-white/55">
                Question
                <input name={`faq_q_${i}`} defaultValue={faq.question} required className={inputClass} />
              </label>
              <label className="mt-3 block text-xs text-white/55">
                Answer
                <textarea
                  name={`faq_a_${i}`}
                  rows={3}
                  defaultValue={faq.answer}
                  required
                  className={inputClass}
                />
              </label>
            </div>
          ))}
          <AdminBtnPrimary>Save FAQs</AdminBtnPrimary>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="font-display text-xl">Locations</h2>
        <form
          action={async (formData) => {
            "use server";
            const items = locations.map((loc, i) => ({
              id: String(formData.get(`loc_id_${i}`) ?? loc.id),
              name: String(formData.get(`loc_name_${i}`) ?? loc.name),
              area: String(formData.get(`loc_area_${i}`) ?? loc.area),
              address: String(formData.get(`loc_address_${i}`) ?? loc.address),
              city: String(formData.get(`loc_city_${i}`) ?? loc.city),
              country: String(formData.get(`loc_country_${i}`) ?? loc.country),
              mapUrl: String(formData.get(`loc_map_${i}`) ?? loc.mapUrl),
              hours: String(formData.get(`loc_hours_${i}`) ?? loc.hours),
              image: String(formData.get(`loc_image_${i}`) ?? loc.image),
              badge: String(formData.get(`loc_badge_${i}`) ?? "") || undefined,
            }));
            formData.set("locations_json", JSON.stringify(items));
            await saveLocations(formData);
          }}
          className="mt-4 space-y-6"
        >
          {locations.map((loc, i) => (
            <div key={loc.id} className="rounded-xl border border-white/10 p-4">
              <p className="font-medium text-white">{loc.area}</p>
              <input type="hidden" name={`loc_id_${i}`} defaultValue={loc.id} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-white/55">
                  Area name
                  <input name={`loc_area_${i}`} defaultValue={loc.area} required className={inputClass} />
                </label>
                <label className="block text-xs text-white/55">
                  Badge <span className="text-white/35">optional</span>
                  <input name={`loc_badge_${i}`} defaultValue={loc.badge ?? ""} className={inputClass} />
                </label>
                <label className="block text-xs text-white/55 sm:col-span-2">
                  Address
                  <input name={`loc_address_${i}`} defaultValue={loc.address} required className={inputClass} />
                </label>
                <label className="block text-xs text-white/55 sm:col-span-2">
                  Map URL
                  <input name={`loc_map_${i}`} defaultValue={loc.mapUrl} className={inputClass} />
                </label>
                <label className="block text-xs text-white/55">
                  Hours label
                  <input name={`loc_hours_${i}`} defaultValue={loc.hours} required className={inputClass} />
                </label>
                <label className="block text-xs text-white/55">
                  Image path
                  <input name={`loc_image_${i}`} defaultValue={loc.image} required className={inputClass} />
                </label>
                <input type="hidden" name={`loc_name_${i}`} defaultValue={loc.name} />
                <input type="hidden" name={`loc_city_${i}`} defaultValue={loc.city} />
                <input type="hidden" name={`loc_country_${i}`} defaultValue={loc.country} />
              </div>
            </div>
          ))}
          <AdminBtnPrimary>Save locations</AdminBtnPrimary>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
        <h2 className="font-display text-xl">Salon hours & booking</h2>
        <form
          action={async (formData) => {
            "use server";
            const slots = salonConfig.bookingTimeSlots.map((slot, i) => ({
              value: String(formData.get(`slot_value_${i}`) ?? slot.value),
              label: String(formData.get(`slot_label_${i}`) ?? slot.label),
            }));
            formData.set("time_slots_json", JSON.stringify(slots));
            await saveSalonConfig(formData);
          }}
          className="mt-4 grid gap-4 sm:grid-cols-2"
        >
          <label className="block text-xs text-white/55">
            Open hour (24h)
            <input type="number" name="open_hour" min={0} max={23} defaultValue={salonConfig.openHour} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Close hour (24h)
            <input type="number" name="close_hour" min={1} max={24} defaultValue={salonConfig.closeHour} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Hours label (shown on site)
            <input name="hours_label" defaultValue={salonConfig.hoursLabel} required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Braids notice
            <textarea name="braids_notice" rows={3} defaultValue={salonConfig.braidsNotice} required className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-white/75">Booking time slots</p>
            <div className="mt-3 space-y-3">
              {salonConfig.bookingTimeSlots.map((slot, i) => (
                <div key={slot.value} className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-white/55">
                    Value (HH:MM)
                    <input name={`slot_value_${i}`} defaultValue={slot.value} required className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55">
                    Label
                    <input name={`slot_label_${i}`} defaultValue={slot.label} required className={inputClass} />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <AdminBtnPrimary>Save hours & slots</AdminBtnPrimary>
          </div>
        </form>
      </section>
    </AdminPanel>
  );
}
