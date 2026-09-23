import { expect, test } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Secret123!";

test.describe("panel auth", () => {
  test("unauthenticated protected routes redirect to login", async ({ page }) => {
    const resp = await page.goto("/panel/dashboard");
    expect(resp?.status()).toBe(200); // after redirect follow
    await expect(page).toHaveURL(/\/panel\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login with valid credentials reaches dashboard", async ({ page }) => {
    await page.goto("/panel/login");
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/contraseña|password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /ingresar|iniciar sesión|entrar|login/i }).click();
    await page.waitForURL(/\/panel\/dashboard/, { timeout: 60_000 });
    await expect(page).toHaveURL(/\/panel\/dashboard/);
  });

  test("logout clears session and returns to login", async ({ page }) => {
    await page.goto("/panel/login");
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/contraseña|password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /ingresar|iniciar sesión|entrar|login/i }).click();
    await page.waitForURL(/\/panel\/dashboard/, { timeout: 60_000 });

    // Scoped logout button in sidebar (desktop) or header — NOT first submit on page blindly.
    const logout = page.getByRole("button", { name: /cerrar sesión/i });
    await expect(logout.first()).toBeVisible({ timeout: 30_000 });
    await logout.first().click();
    await page.waitForURL(/\/panel\/login/, { timeout: 60_000 });
    await expect(page).toHaveURL(/\/panel\/login/);

    // Cookie gone → protected route redirects again
    await page.goto("/panel/dashboard");
    await expect(page).toHaveURL(/\/panel\/login/);
  });

  test("login page rejects bad credentials", async ({ page }) => {
    await page.goto("/panel/login");
    await page.getByLabel(/email/i).fill("nobody@example.com");
    await page.getByLabel(/contraseña|password/i).fill("WrongPass123!");
    await page.getByRole("button", { name: /ingresar|iniciar sesión|entrar|login/i }).click();
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page).toHaveURL(/\/panel\/login/);
  });
});
