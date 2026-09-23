import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  buildAuthUrl,
  generateOAuthState,
  getRedirectUri,
  hasGoogleCredentials,
} from "@/server/services/google";
import { getSessionUser } from "@/server/services/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const settingsUrl = `${origin}/panel/settings`;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/panel/login", origin));
  }

  if (!hasGoogleCredentials()) {
    return NextResponse.redirect(
      new URL(`${settingsUrl}?google=missing_config`, origin)
    );
  }

  const state = generateOAuthState();
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const authUrl = buildAuthUrl({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: getRedirectUri(),
    state,
  });

  return NextResponse.redirect(authUrl);
}
