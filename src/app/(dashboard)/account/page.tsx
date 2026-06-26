import { redirect } from "next/navigation";

/** Client accounts are not used — booking is guest-only like theasantewaa.com */
export default function AccountPage() {
  redirect("/book");
}
