import { expect, test } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@test.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Secret123!";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/panel/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/contraseña|password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /ingresar|iniciar sesión|entrar|login/i }).click();
  await page.waitForURL(/\/panel\/dashboard/, { timeout: 60_000 });
}

test.describe("content editor", () => {
  test("saves home.contact section (scoped submit, not logout)", async ({ page }) => {
    test.slow();
    await login(page);

    await page.goto("/panel/content");
    await expect(page.getByRole("heading", { name: "Contenido" })).toBeVisible();

    await page.getByRole("link", { name: /home\.contact|Contacto/i }).first().click();
    await page.waitForURL(/\/panel\/content\/home\.contact/, { timeout: 60_000 });
    await expect(page.getByRole("heading", { name: /Contacto/ })).toBeVisible();

    const eyebrow = page.getByLabel("Eyebrow");
    const marker = `Test ${Date.now()}`;
    await eyebrow.fill(marker);

    // CRITICAL: scope submit to the content form — sidebar logout is also button[type=submit]
    const form = page.locator("form").filter({ has: page.getByLabel("Eyebrow") });
    await form.getByRole("button", { name: /guardar sección/i }).click();

    await page.waitForURL(/\/panel\/content\?saved=/, { timeout: 60_000 });
    await expect(page).toHaveURL(/saved=home\.contact/);
    await expect(page.getByText(/guardada correctamente/i)).toBeVisible({ timeout: 30_000 });

    // still logged in (logout was NOT clicked)
    await page.goto("/panel/dashboard");
    await expect(page).toHaveURL(/\/panel\/dashboard/);

    // value persisted
    await page.goto("/panel/content/home.contact");
    await expect(page.getByLabel("Eyebrow")).toHaveValue(marker);
  });
});
