import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookingDraft {
  locationId: string | null;
  serviceId: string | null;
  staffId: string | null;
  startAt: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes: string;
  acceptDeposit: boolean;
}

interface BookingDraftState extends BookingDraft {
  setField: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void;
  reset: () => void;
}

const initial: BookingDraft = {
  locationId: null,
  serviceId: null,
  staffId: null,
  startAt: null,
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientNotes: "",
  acceptDeposit: false,
};

export const useBookingDraftStore = create<BookingDraftState>()(
  persist(
    (set) => ({
      ...initial,
      setField: (key, value) => set({ [key]: value } as Partial<BookingDraftState>),
      reset: () => set(initial),
    }),
    {
      name: "glam-room-booking-draft",
    },
  ),
);
