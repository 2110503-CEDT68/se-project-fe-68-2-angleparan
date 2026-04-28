# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test\tests\e2e\appointments.spec.ts >> 1. admin see all bookings
- Location: test\tests\e2e\appointments.spec.ts:149:5

# Error details

```
Error: page.waitForNavigation: Target page, context or browser has been closed
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1   | import { test, expect, Page, Browser } from "@playwright/test";
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
  4   | 
  5   | const ACCOUNTS = {
  6   |   admin: { email: "admin@gmail.com", password: "12345678" },
  7   |   dentist: { email: "playden@gmail.com", password: "12345678" },
  8   |   patient: { email: "play@gmail.com", password: "12345678" },
  9   | };
  10  | 
  11  | // 🔥 เพิ่ม timeout ทั้งไฟล์
  12  | test.setTimeout(60000);
  13  | 
  14  | // ─────────────────────────────
  15  | // LOGIN (เสถียรจริง)
  16  | // ─────────────────────────────
  17  | async function loginAs(page: Page, role: keyof typeof ACCOUNTS) {
  18  |   const { email, password } = ACCOUNTS[role];
  19  | 
  20  |   console.log(`🔐 LOGIN as ${role}`);
  21  | 
  22  |   await page.goto(`${BASE_URL}/login`);
  23  | 
  24  |   await page.fill('input[type="email"]', email);
  25  |   await page.fill('input[type="password"]', password);
  26  | 
  27  |   await Promise.all([
> 28  |     page.waitForNavigation(),
      |          ^ Error: page.waitForNavigation: Target page, context or browser has been closed
  29  |     page.click('button[type="submit"]'),
  30  |   ]);
  31  | 
  32  |   // 🔥 รอ UI จริง (ไม่ใช่แค่ URL)
  33  |   await expect(page.locator("body")).toBeVisible();
  34  | 
  35  |   console.log(`✅ LOGIN DONE: ${role}`);
  36  | }
  37  | 
  38  | // ─────────────────────────────
  39  | // GO TO APPOINTMENTS
  40  | // ─────────────────────────────
  41  | async function goToAppointments(page: Page) {
  42  |   console.log("📂 OPEN APPOINTMENTS");
  43  | 
  44  |   await page.goto(`${BASE_URL}/viewappt`);
  45  | 
  46  |   const tab = page.getByRole("button", { name: "Appointments" });
  47  | 
  48  |   await expect(tab).toBeVisible();
  49  |   await tab.click();
  50  | 
  51  |   // 🔥 รอ data จริง
  52  |   await expect(page.locator("main")).toBeVisible();
  53  | }
  54  | 
  55  | // ─────────────────────────────
  56  | // CREATE BOOKING (เสถียร)
  57  | // ─────────────────────────────
  58  | async function createBooking(page: Page) {
  59  |   console.log("🟢 START BOOKING");
  60  | 
  61  |   await loginAs(page, "patient");
  62  | 
  63  |   await page.goto(
  64  |     `${BASE_URL}/dentist/69f0b901eb12e62b64b4b9df/appointments`
  65  |   );
  66  | 
  67  |   // เปิด calendar
  68  |   const calendarBtn = page.locator(
  69  |     'button[aria-label*="Choose"], button[aria-label*="calendar"]'
  70  |   ).first();
  71  | 
  72  |   await calendarBtn.click();
  73  | 
  74  |   // เลือกวัน
  75  |   const today = page.locator('[role="gridcell"][aria-current="date"]');
  76  |   await today.click({ force: true });
  77  | 
  78  |   // รอเวลา
  79  |   await page.waitForSelector('button:has-text(":00")');
  80  | 
  81  |   // เลือกเวลา
  82  |   const timeBtn = page.locator(
  83  |     'button:has-text(":00"):not([disabled])'
  84  |   ).first();
  85  | 
  86  |   await timeBtn.click();
  87  | 
  88  |   // confirm
  89  |   await page.getByRole("button", { name: "Confirm Booking" }).click();
  90  | 
  91  |   // รอ success
  92  |   await expect(
  93  |     page.getByText(/Booking Successful/i)
  94  |   ).toBeVisible();
  95  | 
  96  |   // รอ redirect
  97  |   await expect(page).toHaveURL(/viewappt/);
  98  | 
  99  |   // 🔥 สำคัญมาก: รอ booking โผล่
  100 |   await expect(page.locator('text=Pending')).toBeVisible();
  101 | 
  102 |   console.log("✅ BOOKING DONE");
  103 | }
  104 | 
  105 | // ─────────────────────────────
  106 | // TESTS
  107 | // ─────────────────────────────
  108 | 
  109 | 
  110 | 
  111 | 
  112 | // 9. patient review doctor
  113 | test("9. patient review doctor", async ({ browser }) => {
  114 |   const p = await browser.newContext();
  115 |   const page = await p.newPage();
  116 | 
  117 |   await loginAs(page, "patient");
  118 |   await goToAppointments(page);
  119 | 
  120 |   const history = page.locator('button:has-text("History")');
  121 |   if (await history.count()) {
  122 |     await history.click();
  123 | 
  124 |     const expandBtn = page.locator('button[title="Expand Details"]').first();
  125 |     await expandBtn.click();
  126 |     await expect(page.locator('text=Review')).toBeVisible();
  127 | 
  128 | 
```