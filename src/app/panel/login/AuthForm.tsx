"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Scissors, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, registerAction } from "@/app/panel/actions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

interface AuthFormProps {
  mode: "login" | "register";
  hasUsers: boolean;
}

export default function AuthForm({ mode, hasUsers }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    mode === "login" ? loginAction : registerAction,
    { error: null }
  );

  const isRegister = mode === "register" || !hasUsers;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              God&apos;s Good
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          <div className="mb-8 text-center">
            {!hasUsers && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Primer administrador</span>
              </div>
            )}
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {isRegister ? "Crear cuenta" : "Bienvenido de nuevo"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRegister
                ? hasUsers
                  ? "El registro está cerrado: ya existe una cuenta."
                  : "Configura la cuenta administradora del panel."
                : "Inicia sesión para acceder al panel."}
            </p>
          </div>

          {isRegister ? (
            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={hasUsers}
                  className={inputClass}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={hasUsers}
                  className={inputClass}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  disabled={hasUsers}
                  className={inputClass}
                  placeholder="+58 424 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={hasUsers}
                  minLength={8}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  disabled={hasUsers}
                  minLength={8}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              {state?.error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={pending || hasUsers}
              >
                {pending ? "Creando..." : "Crear cuenta"}
              </Button>
            </form>
          ) : (
            <form action={formAction} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              {state?.error && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-2 text-center text-sm">
            {!hasUsers && mode === "login" && (
              <Link href="/panel/register" className="text-primary hover:underline">
                Crear primer administrador →
              </Link>
            )}
            {hasUsers && mode === "register" && (
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/panel/login" className="text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            )}
            <div>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                ← Volver al sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
