import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, hasRegisteredUsers } from "@/server/services/auth";
import {
  getBusinessSettings,
  getSchedulingSettings,
} from "@/server/services/settings";
import InitForm from "./InitForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración inicial · Panel",
};

/**
 * First-run setup page. Only reachable while no administrator exists yet;
 * afterwards it bounces to the dashboard (logged in) or to the login page.
 */
export default async function InitPage() {
  const user = await getSessionUser();
  if (user) redirect("/panel/dashboard");
  if (await hasRegisteredUsers()) redirect("/panel/login");

  const [business, scheduling] = await Promise.all([
    getBusinessSettings(),
    getSchedulingSettings(),
  ]);

  return <InitForm business={business} scheduling={scheduling} />;
}
