import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/appointments(.*)",
  "/diagnostics(.*)",
  "/doctor(.*)",
  "/start(.*)",
  "/analytics(.*)",
  "/tests(.*)",
  "/settings(.*)",
]);

// Doctor-only routes
const isDoctorRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analytics(.*)",
  "/doctor(.*)",
]);

// Patient-only routes
const isPatientRoute = createRouteMatcher([
  "/start(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If user is not logged in and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Role-based routing for authenticated users
  // DEMO MODE: Disabled role restrictions for doctor dashboard access
  // if (userId && sessionClaims) {
  //   // Access publicMetadata from sessionClaims
  //   const role = (sessionClaims.publicMetadata as { role?: string })?.role || "patient";

  //   // Doctor accessing patient-only routes → redirect to dashboard
  //   if (role === "doctor" && isPatientRoute(req)) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }

  //   // Patient accessing doctor-only routes → redirect to start
  //   if (role !== "doctor" && isDoctorRoute(req)) {
  //     return NextResponse.redirect(new URL("/start", req.url));
  //   }
  // }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
