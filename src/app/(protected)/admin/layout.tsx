import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Admin-only section — the middleware already redirects non-admins,
 * this layout is the server-side safety net.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
