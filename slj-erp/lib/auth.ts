import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("[slj-erp] getCurrentUser failed:", error);
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string> {
  const user = await getCurrentUser();
  return user?.email ?? "unknown@slj.local";
}
