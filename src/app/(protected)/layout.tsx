import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Second layer of protection for private pages — the middleware redirects
 * unauthenticated visitors, this layout guards direct server rendering.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">{children}</div>;
}
