import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

async function getSessionRole(token: string | undefined): Promise<"admin" | "doctor" | null> {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.role === "admin" || payload.role === "doctor" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = await getSessionRole(token);
  const authed = role !== null;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    if (role) return NextResponse.redirect(new URL(role === "doctor" ? "/patients" : "/dashboard", request.url));
    return NextResponse.next();
  }

  if (!authed) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(url);
    // drop a stale/invalid cookie so the login page doesn't bounce
    if (token) res.cookies.delete("token");
    return res;
  }

  if (role === "doctor" && pathname !== "/patients" && !pathname.startsWith("/patients/")) {
    return NextResponse.redirect(new URL("/patients", request.url));
  }

  if (pathname === "/") return NextResponse.redirect(new URL(role === "doctor" ? "/patients" : "/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  // everything except the API rewrite, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
