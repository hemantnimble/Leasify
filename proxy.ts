// middleware.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // always public
  if (
    pathname === "/" ||
    pathname === "/login" ||       // ← add this
    pathname === "/test-auth" ||   // ← add this
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/properties")
  ) {
    return NextResponse.next();
  }

  // not signed in → back to landing
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // landlord trying to access tenant routes or vice versa
  if (pathname.startsWith("/dashboard/landlord") && session.user.role !== "LANDLORD") {
    return NextResponse.redirect(new URL("/dashboard/tenant", req.url));
  }

  if (pathname.startsWith("/dashboard/tenant") && session.user.role !== "TENANT") {
    return NextResponse.redirect(new URL("/dashboard/landlord", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
