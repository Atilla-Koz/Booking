import { expect, test } from '@playwright/test';

const userId = '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7';

test('happy path: login -> pick date/slot -> confirm', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized', statusCode: 401 }),
    });
  });

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { accessToken: 'mock-token', userId },
        message: 'ok',
        statusCode: 200,
      }),
    });
  });

  await page.route('**/bookings/available**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { timeSlot: '09:00', startTime: '09:00', durationMinutes: 60, available: true },
          { timeSlot: '10:00', startTime: '10:00', durationMinutes: 60, available: false },
        ],
        message: 'ok',
        statusCode: 200,
      }),
    });
  });

  await page.route('**/bookings', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          bookingId: 'booking-123',
          date: '2026-04-06',
          timeSlot: '09:00',
          durationMinutes: 60,
          status: 'confirmed',
        },
        message: 'Booking confirmed',
        statusCode: 201,
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('securepass');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByText('Session Booking')).toBeVisible();
  await page.getByRole('button', { name: '1' }).first().click();
  await page.getByRole('button', { name: '09:00' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(page.getByText(/Booking ID:/)).toBeVisible();
});

test('conflict path: booking returns 409', async ({ page }) => {
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unauthorized', statusCode: 401 }),
    });
  });

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { accessToken: 'mock-token', userId },
        message: 'ok',
        statusCode: 200,
      }),
    });
  });

  await page.route('**/bookings/available**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [{ timeSlot: '09:00', startTime: '09:00', durationMinutes: 60, available: true }],
        message: 'ok',
        statusCode: 200,
      }),
    });
  });

  await page.route('**/bookings', async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'This time slot is no longer available',
        statusCode: 409,
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('securepass');
  await page.getByRole('button', { name: 'Log In' }).click();

  await page.getByRole('button', { name: '1' }).first().click();
  await page.getByRole('button', { name: '09:00' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(
    page.getByText('This time slot was just booked. Please choose another slot.'),
  ).toBeVisible();
});
