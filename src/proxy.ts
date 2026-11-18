import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

async function hasValidSession(token: string | undefined) {
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    // authorization: only admins may use the portal
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const authed = await hasValidSession(token);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    if (authed) return NextResponse.redirect(new URL("/dashboard", request.url));
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

  if (pathname === "/") return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  // everything except the API rewrite, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
