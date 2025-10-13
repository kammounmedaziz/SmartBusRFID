import request from 'supertest';
import app from '../server.js';
import db from '../config/db.js';

let token;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  if (db && db.end) await db.end();
});

test('login with seeded admin returns token', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@example.com', password: 'AdminPass123' });
  expect([200,201]).toContain(res.status);
  expect(res.body.token).toBeDefined();
  token = res.body.token;
});

test('recharge without token is unauthorized', async () => {
  const res = await request(app)
    .post('/api/cards/recharge')
    .send({ uid: 'CARD-001', amount: 1 });
  expect(res.status).toBe(401);
});

test('recharge with token succeeds', async () => {
  const res = await request(app)
    .post('/api/cards/recharge')
    .set('Authorization', `Bearer ${token}`)
    .send({ uid: 'CARD-001', amount: 1 });
  expect(res.status).toBe(200);
  expect(res.body.new_balance).toBeDefined();
});

test('pay with insufficient balance returns 402 or error', async () => {
  const res = await request(app)
    .post('/api/cards/pay')
    .set('Authorization', `Bearer ${token}`)
    .send({ uid: 'CARD-003', fare: 9999 });
  expect([402,400,404,500]).toContain(res.status);
});
