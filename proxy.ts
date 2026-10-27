import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAppRoute = createRouteMatcher(["/charts(.*)", "/chart(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isAppRoute(req)) await auth.protect();
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

// Runs only where an account matters: the app and its API. Public pages (the
// landing page, sign-in, privacy, terms, the share image) skip it, so link
// preview bots can read them without being sent through Clerk's sign-in check.
export const config = {
  matcher: ["/charts/:path*", "/chart/:path*", "/(api|trpc)(.*)"],
};
