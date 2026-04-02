import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';
import { DRIZZLE_TOKEN } from '../src/database/drizzle.provider';

type DbMock = {
  select: jest.Mock;
  transaction: jest.Mock;
  query: {
    users: {
      findFirst: jest.Mock;
    };
  };
};

describe('BookingsController (e2e)', () => {
  const jwtSecret = 'test-jwt-secret';
  let app: INestApplication;

  const createAuthToken = async (): Promise<string> => {
    const jwtService = new JwtService();
    return jwtService.signAsync(
      {
        sub: '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7',
        email: 'user@example.com',
      },
      { secret: jwtSecret },
    );
  };

  const createApp = async (dbMock: DbMock): Promise<INestApplication> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DRIZZLE_TOKEN)
      .useValue(dbMock)
      .compile();

    const nestApp = moduleFixture.createNestApplication();
    await nestApp.init();
    return nestApp;
  };

  beforeAll(() => {
    process.env.JWT_SECRET = jwtSecret;
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /bookings/available returns slot availability', async () => {
    const dbMock: DbMock = {
      select: jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue([
                { startTime: '09:00:00', durationMinutes: 60 },
                { startTime: '10:00:00', durationMinutes: 60 },
              ]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ timeSlot: '10:00' }]),
          }),
        }),
      transaction: jest.fn(),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };

    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    const response: SupertestResponse = await request(httpServer)
      .get('/bookings/available?date=2026-04-06&timezone=Europe/Istanbul')
      .expect(200);
    const body = response.body as {
      statusCode: number;
      data: Array<{
        timeSlot: string;
        startTime: string;
        durationMinutes: number;
        available: boolean;
      }>;
    };

    expect(body.statusCode).toBe(200);
    expect(body.data).toEqual([
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

  it('GET /bookings/available returns 400 for invalid date', async () => {
    const dbMock: DbMock = {
      select: jest.fn(),
      transaction: jest.fn(),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };
    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/bookings/available?date=bad-date')
      .expect(400);
  });

  it('POST /bookings creates a booking when authorized', async () => {
    const token = await createAuthToken();
    const createdBooking = {
      bookingId: '2a88fd96-952c-4953-bf50-03f781eb71c2',
      date: '2026-04-06',
      timeSlot: '09:00',
      durationMinutes: 60,
      status: 'confirmed',
    };

    const dbMock: DbMock = {
      select: jest.fn(),
      transaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            select: jest.fn().mockReturnValue({
              from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  for: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
            insert: jest.fn().mockReturnValue({
              values: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([createdBooking]),
              }),
            }),
          }),
      ),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };
    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    const response: SupertestResponse = await request(httpServer)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7',
        date: '2026-04-06',
        timeSlot: '09:00',
      })
      .expect(201);
    const body = response.body as {
      statusCode: number;
      data: { bookingId: string };
    };

    expect(body.statusCode).toBe(201);
    expect(body.data.bookingId).toBe(createdBooking.bookingId);
  });

  it('POST /bookings returns 409 when slot is already booked', async () => {
    const token = await createAuthToken();

    const dbMock: DbMock = {
      select: jest.fn(),
      transaction: jest.fn(
        async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            select: jest.fn().mockReturnValue({
              from: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  for: jest.fn().mockResolvedValue([{ id: 'taken' }]),
                }),
              }),
            }),
            insert: jest.fn(),
          }),
      ),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };
    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7',
        date: '2026-04-06',
        timeSlot: '09:00',
      })
      .expect(409);
  });

  it('POST /bookings returns 401 without token', async () => {
    const dbMock: DbMock = {
      select: jest.fn(),
      transaction: jest.fn(),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };
    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/bookings')
      .send({
        userId: '2db4916f-072c-4fce-b2ea-c8dfca5c5ee7',
        date: '2026-04-06',
        timeSlot: '09:00',
      })
      .expect(401);
  });

  it('POST /bookings returns 400 for invalid payload', async () => {
    const token = await createAuthToken();
    const dbMock: DbMock = {
      select: jest.fn(),
      transaction: jest.fn(),
      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };
    app = await createApp(dbMock);
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: 'not-a-uuid',
        date: '2026-04',
        timeSlot: 'bad',
      })
      .expect(400);
  });
});
