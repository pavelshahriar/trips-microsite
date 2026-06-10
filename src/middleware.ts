import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── Type for a vault_crew row ─────────────────────────────────────────────────
interface CrewMember {
  email: string;
  provider: "google" | "facebook" | "email";
  is_admin: boolean;
  is_active: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on /trip-vault routes
  if (!pathname.startsWith("/trip-vault")) {
    return NextResponse.next();
  }

  // Allow unauthenticated access to login page and auth callback
  if (
    pathname === "/trip-vault/login" ||
    pathname.startsWith("/trip-vault/auth/")
  ) {
    return NextResponse.next();
  }

  // Build the response early so we can attach cookie mutations
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session so it doesn't expire mid-visit
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send to login
  if (!session) {
    const loginUrl = new URL("/trip-vault/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const email = session.user.email?.toLowerCase() ?? "";

  // ── Look up this email in vault_crew ───────────────────────────────────────
  // Uses the anon key + RLS policy "authenticated can read vault_crew".
  const { data: crewMember } = await supabase
    .from("vault_crew")
    .select("email, provider, is_admin, is_active")
    .eq("email", email)
    .eq("is_active", true)
    .single<CrewMember>();

  // Not on the crew list (or deactivated) → bounce them out
  if (!crewMember) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/trip-vault/login", request.url);
    loginUrl.searchParams.set("error", "not_crew");
    return NextResponse.redirect(loginUrl);
  }

  // ── Strict provider enforcement ────────────────────────────────────────────
  // Supabase stores the sign-in method in app_metadata.provider.
  // Map Supabase's value ("github", "email", etc.) to our DB values.
  const rawProvider = (session.user.app_metadata?.provider as string) ?? "";
  const usedProvider: CrewMember["provider"] =
    rawProvider === "google"
      ? "google"
      : rawProvider === "facebook"
      ? "facebook"
      : "email"; // covers "email" (magic link) and anything else

  if (usedProvider !== crewMember.provider) {
    // Signed in with the wrong method — sign them out and send back with a hint
    await supabase.auth.signOut();
    const loginUrl = new URL("/trip-vault/login", request.url);
    loginUrl.searchParams.set("error", "wrong_provider");
    loginUrl.searchParams.set("required", crewMember.provider);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin route guard ──────────────────────────────────────────────────────
  if (pathname.startsWith("/trip-vault/admin") && !crewMember.is_admin) {
    // Non-admins get a 403-style redirect back to the vault
    return NextResponse.redirect(new URL("/trip-vault", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/trip-vault/:path*"],
};
