import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserEmail(): Promise<string> {
  const user = await getCurrentUser();
  return user?.email ?? "unknown@slj.local";
}
