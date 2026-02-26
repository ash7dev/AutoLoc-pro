import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/nestjs/auth";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddVehicleFlow } from "@/features/vehicles/add/AddVehicleFlow";

export default async function NewVehiclePage() {
  const nestToken = cookies().get("nest_access")?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  if (!token) redirect("/login");

  let profile;
  try {
    profile = await fetchMe(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
    throw err;
  }

  return <AddVehicleFlow profile={profile} />;
}
