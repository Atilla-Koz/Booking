import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  const userId = '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7';

  it('getAvailableSessions filters booked slots', async () => {
    const configuredSessions = [
      { startTime: '09:00:00', durationMinutes: 60 },
      { startTime: '10:00:00', durationMinutes: 60 },
    ];
    const bookedSlots = [{ timeSlot: '10:00' }];

    const firstOrderBy = jest.fn().mockResolvedValue(configuredSessions);
    const firstWhere = jest.fn().mockReturnValue({ orderBy: firstOrderBy });
    const firstFrom = jest.fn().mockReturnValue({ where: firstWhere });

    const secondWhere = jest.fn().mockResolvedValue(bookedSlots);
    const secondFrom = jest.fn().mockReturnValue({ where: secondWhere });

    const dbMock = {
      select: jest
        .fn()
        .mockReturnValueOnce({ from: firstFrom })
        .mockReturnValueOnce({ from: secondFrom }),
      transaction: jest.fn(),
    };

    const service = new BookingsService(dbMock as never);
    const result = await service.getAvailableSessions(
      '2026-04-06',
      'Europe/Istanbul',
    );

    expect(result).toEqual([
      {
        timeSlot: '09:00',
        startTime: '09:00',
        durationMinutes: 60,
        available: true,
      },
      {
        timeSlot: '10:00',
        startTime: '10:00',
        durationMinutes: 60,
        available: false,
      },
    ]);
  });

  it('bookSession throws conflict for taken slot', async () => {
    const txMock = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            for: jest.fn().mockResolvedValue([{ id: 'existing-booking' }]),
          }),
        }),
      }),
      insert: jest.fn(),
    };

    const dbMock = {
      transaction: jest.fn((cb: (tx: typeof txMock) => unknown) => cb(txMock)),
      select: jest.fn(),
    };

    const service = new BookingsService(dbMock as never);
    await expect(
      service.bookSession(
        { userId, date: '2026-04-06', timeSlot: '09:00' },
        userId,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('bookSession creates booking when slot is available', async () => {
    const created = {
      bookingId: '2a88fd96-952c-4953-bf50-03f781eb71c2',
      date: '2026-04-06',
      timeSlot: '09:00',
      durationMinutes: 60,
      status: 'confirmed',
    };

    const txMock = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            for: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([created]),
        }),
      }),
    };

    const dbMock = {
      transaction: jest.fn(
        (cb: (tx: typeof txMock) => Promise<typeof created>) => cb(txMock),
      ),
      select: jest.fn(),
    };

    const service = new BookingsService(dbMock as never);
    const result = await service.bookSession(
      { userId, date: '2026-04-06', timeSlot: '09:00' },
      userId,
    );

    expect(result).toEqual(created);
  });

  it('bookSession rejects when JWT user differs from body userId', async () => {
    const dbMock = {
      transaction: jest.fn(),
      select: jest.fn(),
    };
    const service = new BookingsService(dbMock as never);

    await expect(
      service.bookSession(
        { userId, date: '2026-04-06', timeSlot: '09:00' },
        '43c257de-5d1f-4ee4-a0b9-0f6d56a86658',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('bookSession maps postgres unique violation to conflict', async () => {
    const dbMock = {
      transaction: jest.fn(() =>
        Promise.reject(
          Object.assign(new Error('unique violation'), {
            code: '23505',
          }),
        ),
      ),
      select: jest.fn(),
    };
    const service = new BookingsService(dbMock as never);

    await expect(
      service.bookSession(
        { userId, date: '2026-04-06', timeSlot: '09:00' },
        userId,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
