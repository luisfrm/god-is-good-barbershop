import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getRedirectUri } from "@/server/services/google";
import { getSessionUser } from "@/server/services/auth";
import { saveGoogleTokens } from "@/server/services/settings";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const settingsUrl = `${origin}/panel/settings`;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`${settingsUrl}?google=${reason}`, origin));

  if (errorParam === "access_denied") {
    return fail("error");
  }
  if (!code || !state || !savedState || state !== savedState) {
    return fail("error");
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/panel/login", origin));
  }

  try {
    const tokens = await exchangeCodeForTokens(code, getRedirectUri());
    await saveGoogleTokens(tokens);
    return NextResponse.redirect(
      new URL(`${settingsUrl}?google=connected`, origin)
    );
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    return fail("error");
  }
}
