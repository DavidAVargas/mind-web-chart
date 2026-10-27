import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The app itself needs an account; the landing page and sign-in pages don't.
const isAppRoute = createRouteMatcher(["/charts(.*)", "/chart(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isAppRoute(req)) await auth.protect();
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
