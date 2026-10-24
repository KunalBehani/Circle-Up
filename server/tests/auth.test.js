import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Workflow 1: Authentication & User Profile API', () => {
  setupTestDB();

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice_test',
      email: 'alice@example.com',
      password: 'strongpassword123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('alice_test');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.passwordHash).toBeUndefined(); // Must never expose password hash
  });

  it('should reject registration when username or email is already taken', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'duplicate_user',
      email: 'dup@example.com',
      password: 'password123',
    });

    // Duplicate email
    const resEmail = await request(app).post('/api/auth/register').send({
      username: 'other_user',
      email: 'dup@example.com',
      password: 'password123',
    });
    expect(resEmail.status).toBe(409);
    expect(resEmail.body.success).toBe(false);

    // Duplicate username
    const resUser = await request(app).post('/api/auth/register').send({
      username: 'duplicate_user',
      email: 'other@example.com',
      password: 'password123',
    });
    expect(resUser.status).toBe(409);
    expect(resUser.body.success).toBe(false);
  });

  it('should reject registration with invalid fields or weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'al',
      email: 'invalid-email',
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should log in successfully with valid credentials and return JWT', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'bob_builder',
      email: 'bob@example.com',
      password: 'correctpassword',
    });

    // Login with email
    const resEmail = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'bob@example.com',
      password: 'correctpassword',
    });
    expect(resEmail.status).toBe(200);
    expect(resEmail.body.token).toBeDefined();
    expect(resEmail.body.user.username).toBe('bob_builder');

    // Login with username
    const resUser = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'bob_builder',
      password: 'correctpassword',
    });
    expect(resUser.status).toBe(200);
    expect(resUser.body.token).toBeDefined();
  });

  it('should reject login with wrong password or unknown user', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'carol_test',
      email: 'carol@example.com',
      password: 'mypassword',
    });

    const resWrongPw = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'carol_test',
      password: 'wrongpassword',
    });
    expect(resWrongPw.status).toBe(401);
    expect(resWrongPw.body.success).toBe(false);

    const resUnknown = await request(app).post('/api/auth/login').send({
      emailOrUsername: 'nonexistent_user',
      password: 'mypassword',
    });
    expect(resUnknown.status).toBe(401);
  });

  it('should enforce authentication on protected /api/auth/me', async () => {
    // Unauthenticated
    const resUnauth = await request(app).get('/api/auth/me');
    expect(resUnauth.status).toBe(401);

    // Authenticated
    const reg = await request(app).post('/api/auth/register').send({
      username: 'dave_auth',
      email: 'dave@example.com',
      password: 'mypassword123',
    });
    const token = reg.body.token;

    const resAuth = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(resAuth.status).toBe(200);
    expect(resAuth.body.user.username).toBe('dave_auth');
  });

  it('should allow updating user profile bio', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      username: 'eva_green',
      email: 'eva@example.com',
      password: 'mypassword123',
    });
    const token = reg.body.token;

    const resUpdate = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Software engineer and designer.' });

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.user.bio).toBe('Software engineer and designer.');
  });
});
