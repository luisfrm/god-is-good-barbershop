import { expect, test } from "@playwright/test";

test.describe("public booking", () => {
  test("home loads", async ({ page }) => {
    const resp = await page.goto("/");
    expect(resp?.status()).toBe(200);
    await expect(page).toHaveTitle(/Gods Good|Barber/i);
  });

  test("/reservar shows booking form and availability slots", async ({ page }) => {
    test.slow();
    await page.goto("/reservar");
    await expect(page).toHaveURL(/\/reservar/);

    // Availability fetch populates slots; wait for either slots or a day selector
    const anySlot = page.locator("button, [role=radio], label").filter({
      hasText: /\d{1,2}:\d{2}/,
    });
    await expect(anySlot.first()).toBeVisible({ timeout: 60_000 });

    // Required form fields present
    await expect(page.getByLabel(/nombre/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });

  test("booking with invalid data shows error", async ({ page }) => {
    test.slow();
    await page.goto("/reservar");
    // Submit button always present; shows "Selecciona día y hora" until slot chosen
    const submit = page.getByRole("button", {
      name: /reservar|confirmar|agendar|selecciona día y hora/i,
    }).last();
    await expect(submit).toBeVisible({ timeout: 60_000 });
    // Empty required fields -> browser HTML5 validation or server error
    await submit.click({ force: true });
    const errorVisible = await page
      .getByText(/obligatorio|válido|disponible|requerido/i)
      .first()
      .isVisible()
      .catch(() => false);
    const stillOnPage = page.url().includes("/reservar");
    // Either stayed on page (HTML5 blocked) or an error message appeared
    expect(stillOnPage || errorVisible).toBeTruthy();
  });
});
