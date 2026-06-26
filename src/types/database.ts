export type ProfileRole = "client" | "admin" | "staff";

export type BookingStatus =
  | "pending"
  | "awaiting_approval"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export type BookingLocation = "studio" | "home";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: ProfileRole;
  assigned_location_id: string | null;
  crm_tags: string[] | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  base_price: number;
  currency: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  location_type: BookingLocation;
  address: string | null;
  add_ons: Record<string, unknown> | null;
  client_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  inventory: number;
  images: string[] | null;
  variants: Record<string, unknown> | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  paystack_reference: string | null;
  subtotal: number;
  total: number;
  currency: string;
  shipping_address: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
}

export interface StaffRow {
  id: string;
  profile_id: string | null;
  name: string;
  role: string;
  bio: string | null;
  experience: string | null;
  specialty: string[] | null;
  image_url: string | null;
  instagram_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryRow {
  id: string;
  src: string;
  alt: string;
  category: string;
  width: number;
  height: number;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface TestimonialRow {
  id: string;
  name: string;
  service: string | null;
  rating: number;
  quote: string;
  image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface PromotionRow {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read_at: string | null;
  created_at: string;
}
