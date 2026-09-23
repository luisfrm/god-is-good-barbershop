import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "../login/AuthForm";
import { hasRegisteredUsers, getSessionUser } from "@/server/services/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniciar sesión · Panel",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/panel/dashboard");

  const hasUsers = await hasRegisteredUsers();
  if (!hasUsers) redirect("/panel/init");

  return <AuthForm mode="login" hasUsers={hasUsers} />;
}
