import { redirect } from "next/navigation";

/** Creating a profile uses the same wizard as onboarding. */
export default function NewSearchProfilePage() {
  redirect("/onboarding");
}
