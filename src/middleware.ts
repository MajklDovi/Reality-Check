import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/** Routes that require an authenticated user. */
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings", "/admin"];

/** Routes that a logged-in user should not see again. */
const AUTH_PREFIXES = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (AUTH_PREFIXES.some((p) => path.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (PROTECTED_PREFIXES.some((p) => path.startsWith(p)) && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and the Auth.js API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
