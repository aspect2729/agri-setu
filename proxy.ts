import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthUser } from "@/lib/supabase/auth-user";

const PROTECTED_PREFIXES = [
  "/farmer",
  "/store",
  "/employee",
  "/buyer",
  "/logistics",
  "/admin",
];

const PUBLIC_PREFIXES = ["/", "/login", "/register", "/trace"];

function isPublicPath(path: string) {
  return PUBLIC_PREFIXES.some((p) => path === p || (p !== "/" && path.startsWith(p)));
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Don't block the login screen on a slow/failing Supabase round-trip.
  if (isPublicPath(path)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    user = await resolveAuthUser(supabase);
  } catch {
    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
