import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Recebe o redirect de convites/reset de password enviados pelo Supabase Auth,
// troca o código por uma sessão e envia o utilizador para definir a password.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/set-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
