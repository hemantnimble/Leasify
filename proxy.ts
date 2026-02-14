// middleware.ts  ← root of project, same level as auth.ts

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Landlord trying to access tenant dashboard
    if (pathname.startsWith("/dashboard/tenant") && role !== "TENANT") {
      return NextResponse.redirect(new URL("/dashboard/landlord", req.url));
    }

    // Tenant trying to access landlord dashboard
    if (pathname.startsWith("/dashboard/landlord") && role !== "LANDLORD") {
      return NextResponse.redirect(new URL("/dashboard/tenant", req.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === "/login" && isLoggedIn) {
    if (role === "LANDLORD") {
      return NextResponse.redirect(new URL("/dashboard/landlord", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard/tenant", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
