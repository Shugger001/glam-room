"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("contact_messages").insert({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        subject: values.subject,
        message: values.message,
      });
      if (error) throw error;
      toast.success("Message sent. We'll be in touch shortly.");
      form.reset();
    } catch {
      toast.error("Unable to send message. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-glam-border bg-glam-secondary px-4 py-3 text-sm text-glam-primary transition focus:border-glam-accent focus:outline-none focus:ring-1 focus:ring-glam-accent";

  return (
    <Reveal>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input id="contact-name" className={inputClass} {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className={inputClass}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium">
            Phone (optional)
          </label>
          <input id="contact-phone" type="tel" className={inputClass} {...form.register("phone")} />
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium">
            Subject
          </label>
          <input id="contact-subject" className={inputClass} {...form.register("subject")} />
          {form.formState.errors.subject ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.subject.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={5}
            className={inputClass}
            {...form.register("message")}
          />
          {form.formState.errors.message ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
          ) : null}
        </div>
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </Reveal>
  );
}
