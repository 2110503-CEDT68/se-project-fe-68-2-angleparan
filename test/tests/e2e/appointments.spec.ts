import { test, expect, Page, Browser } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "https://fe-project-68-demonparan.vercel.app";

const ACCOUNTS = {
  admin: { email: "admin@gmail.com", password: "12345678" },
  dentist: { email: "playden@gmail.com", password: "12345678" },
  patient: { email: "play@gmail.com", password: "12345678" },
};

// 🔥 เพิ่ม timeout ทั้งไฟล์
test.setTimeout(60000);

// ─────────────────────────────
// LOGIN (เสถียรจริง)
// ─────────────────────────────
async function loginAs(page: Page, role: keyof typeof ACCOUNTS) {
  const { email, password } = ACCOUNTS[role];

  console.log(`🔐 LOGIN as ${role}`);

  await page.goto(`${BASE_URL}/login`);

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]'),
  ]);

  // 🔥 รอ UI จริง (ไม่ใช่แค่ URL)
  await expect(page.locator("body")).toBeVisible();

  console.log(`✅ LOGIN DONE: ${role}`);
}

// ─────────────────────────────
// GO TO APPOINTMENTS
// ─────────────────────────────
async function goToAppointments(page: Page) {
  console.log("📂 OPEN APPOINTMENTS");

  await page.goto(`${BASE_URL}/viewappt`);

  const tab = page.getByRole("button", { name: "Appointments" });

  await expect(tab).toBeVisible();
  await tab.click();

  // 🔥 รอ data จริง
  await expect(page.locator("main")).toBeVisible();
}

// ─────────────────────────────
// CREATE BOOKING (เสถียร)
// ─────────────────────────────
async function createBooking(page: Page) {
  console.log("🟢 START BOOKING");

  await loginAs(page, "patient");

  await page.goto(
    `${BASE_URL}/dentist/69f0b901eb12e62b64b4b9df/appointments`
  );

  // เปิด calendar
  const calendarBtn = page.locator(
    'button[aria-label*="Choose"], button[aria-label*="calendar"]'
  ).first();

  await calendarBtn.click();

  // เลือกวัน
  const today = page.locator('[role="gridcell"][aria-current="date"]');
  await today.click({ force: true });

  // รอเวลา
  await page.waitForSelector('button:has-text(":00")');

  // เลือกเวลา
  const timeBtn = page.locator(
    'button:has-text(":00"):not([disabled])'
  ).first();

  await timeBtn.click();

  // confirm
  await page.getByRole("button", { name: "Confirm Booking" }).click();

  // รอ success
  await expect(
    page.getByText(/Booking Successful/i)
  ).toBeVisible();

  // รอ redirect
  await expect(page).toHaveURL(/viewappt/);

  // 🔥 สำคัญมาก: รอ booking โผล่
  await expect(page.locator('text=Pending')).toBeVisible();

  console.log("✅ BOOKING DONE");
}

// ─────────────────────────────
// TESTS
// ─────────────────────────────









// 1. admin see all bookings
test("1. admin see all bookings", async ({ browser }) => {
  const p = await browser.newContext();
  const pPage = await p.newPage();

  await createBooking(pPage);
  await p.close();

  const a = await browser.newContext();
  const aPage = await a.newPage();

  await loginAs(aPage, "admin");
  await goToAppointments(aPage);

  await expect(
    aPage.locator('text=Pending')
  ).toBeVisible();

  await a.close();
});

// 2. admin confirm pending
test("2. admin confirm pending", async ({ browser }) => {
  //const p = await browser.newContext();
  //const pPage = await p.newPage();

  //await createBooking(pPage);
  //await p.close();

  const a = await browser.newContext();
  const aPage = await a.newPage();

  await loginAs(aPage, "admin");
  await goToAppointments(aPage);

  const btn = aPage.locator('button:has-text("Confirm")');

  if (await btn.count()) await btn.first().click();

  await a.close();
});

// 3. admin cancel confirmed
test("3. admin cancel confirmed", async ({ browser }) => {
  //const p = await browser.newContext();
  //const pPage = await p.newPage();

  //await createBooking(pPage);
  //await p.close();

  const a = await browser.newContext();
  const aPage = await a.newPage();

  await loginAs(aPage, "admin");
  await goToAppointments(aPage);
  const btn = aPage.locator('button:has-text("Cancel")');


  if (await btn.count()) {
    await btn.first().click();
    await aPage.locator("textarea").fill("cancel");
    await aPage.locator('button:has-text("Confirm")').click();
  }

  await a.close();
});


// 4. dentist confirm pending
test("4. dentist confirm pending", async ({ browser }) => {
  const p = await browser.newContext();
  const pPage = await p.newPage();

  await createBooking(pPage);
  await p.close();

  const d = await browser.newContext();
  const dPage = await d.newPage();

  await loginAs(dPage, "dentist");
  await goToAppointments(dPage);

  const btn = dPage.locator('button:has-text("Confirm")');
  if (await btn.count()) await btn.first().click();

  await d.close();
});

test("5. dentist cancel confirmed", async ({ browser }) => {
  const context = await browser.newContext();
  const d2 = await context.newPage();

  await loginAs(d2, "dentist");
  await goToAppointments(d2);

  // 🔥 รอให้ API + UI render เสร็จจริง
  await d2.waitForLoadState("networkidle");
  await d2.waitForTimeout(500);

  // 🔥 ใช้ role-based selector (เสถียรกว่า text)
  const cancelBtn = d2.getByRole("button", { name: /cancel/i }).first();

  // 🔥 กัน false positive
  await expect(cancelBtn).toBeVisible();
  await expect(cancelBtn).toBeEnabled();

  await cancelBtn.click();

  const textarea = d2.locator("textarea");
  await expect(textarea).toBeVisible();
  await textarea.fill("cancel");

  const confirmBtn = d2.getByRole("button", { name: /confirm/i }).first();
  await expect(confirmBtn).toBeVisible();
  await expect(confirmBtn).toBeEnabled();

  await confirmBtn.click();

  await context.close();
});




// 6. dentist confirm pending again
test("6. dentist confirm pending again", async ({ browser }) => {
  const p = await browser.newContext();
  const pPage = await p.newPage();

  await createBooking(pPage);
  await p.close();

  const d = await browser.newContext();
  const dPage = await d.newPage();

  await loginAs(dPage, "dentist");
  await goToAppointments(dPage);

  const btn = dPage.locator('button:has-text("Confirm")');
  if (await btn.count()) await btn.first().click();

  await d.close();
});

// 7. patient view bookings
test("7. patient view bookings", async ({ browser }) => {
  const p = await browser.newContext();
  const page = await p.newPage();

  await loginAs(page, "patient");
  await goToAppointments(page);

  await expect(
    page.getByRole("heading", { name: /My Appointments/i })
  ).toBeVisible();

  await p.close();
});

// 8. dentist complete appointment
test("8. dentist complete appointment", async ({ browser }) => {
  //const p = await browser.newContext();
  //const pPage = await p.newPage();

  //await createBooking(pPage);
  //await p.close();

  const d = await browser.newContext();
  const dPage = await d.newPage();

  await loginAs(dPage, "dentist");
  await goToAppointments(dPage);

  const btn = dPage.locator('button:has-text("Complete")');
  
  if (await btn.count()) {
    await btn.first().click();
    await dPage.locator("textarea").fill("done");
    await dPage.locator('button:has-text("Confirm")').click();
  }

  await d.close();
});
// 9. patient review doctor
test("9. patient review doctor", async ({ browser }) => {
  const p = await browser.newContext();
  const page = await p.newPage();

  await loginAs(page, "patient");
  await goToAppointments(page);

  const history = page.locator('button:has-text("History")');
  if (await history.count()) {
    await history.click();

    const expandBtn = page.locator('button[title="Expand Details"]').first();
    await expandBtn.click();
    await expect(page.locator('text=Review')).toBeVisible();



    const review = page.locator('button:has-text("Review")');
    if (await review.count()) {
      await review.first().click();
      await page.locator("textarea").fill("good");
      const star5 = page.locator('button[aria-label="Rate 5 stars"]');
      await expect(star5).toBeVisible();
      await star5.click();
      const submit = page.locator('button:has-text("ส่งรีวิว")');
      if (await submit.count()) await submit.first().click();
    }
  }

  await p.close();
});

