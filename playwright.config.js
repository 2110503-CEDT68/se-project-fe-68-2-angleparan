// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    baseURL: 'http://localhost:3000', // 👈 frontend ของคุณ
    headless: true,
    launchOptions: {
      slowMo: 2000, // 👈 ใส่ตรงนี้
    },
  },
});


