import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Workflow 2: Communities API', () => {
  setupTestDB();

  let token1, token2;

  beforeEach(async () => {
    const user1 = await request(app).post('/api/auth/register').send({
      username: 'founder_1',
      email: 'f1@example.com',
      password: 'password123',
    });
    token1 = user1.body.token;

    const user2 = await request(app).post('/api/auth/register').send({
      username: 'member_2',
      email: 'm2@example.com',
      password: 'password123',
    });
    token2 = user2.body.token;
  });

  it('should create a new community with normalized slug and creator as member', async () => {
    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Artificial Intelligence',
        description: 'Discussions on neural networks and deep learning.',
        category: 'Technology',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.community.slug).toBe('artificial-intelligence');
    expect(res.body.community.memberCount).toBe(1);
    expect(res.body.community.isMember).toBe(true);
  });

  it('should prevent creating a community with a duplicate name or slug', async () => {
    await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Web Dev',
        description: 'Web development discussions.',
      });

    const resDup = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token2}`)
      .send({
        name: 'Web Dev',
        description: 'Another web development community.',
      });

    expect(resDup.status).toBe(409);
    expect(resDup.body.success).toBe(false);
  });

  it('should retrieve community by slug or name', async () => {
    await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Open Source',
        description: 'Collaborative software.',
      });

    const res = await request(app).get('/api/communities/open-source');
    expect(res.status).toBe(200);
    expect(res.body.community.name).toBe('Open Source');
    expect(res.body.community.slug).toBe('open-source');
  });

  it('should allow users to join and leave communities with correct atomic member counts', async () => {
    const createRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'Rustaceans',
        description: 'Memory safety without garbage collection.',
      });

    const communityId = createRes.body.community._id;

    // User 2 joins
    const joinRes = await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${token2}`);

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.memberCount).toBe(2);
    expect(joinRes.body.isMember).toBe(true);

    // Duplicate join should be rejected
    const dupJoin = await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${token2}`);
    expect(dupJoin.status).toBe(400);

    // User 2 leaves
    const leaveRes = await request(app)
      .delete(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${token2}`);

    expect(leaveRes.status).toBe(200);
    expect(leaveRes.body.memberCount).toBe(1);
    expect(leaveRes.body.isMember).toBe(false);

    // Leaving when not a member should be rejected
    const leaveAgain = await request(app)
      .delete(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${token2}`);
    expect(leaveAgain.status).toBe(400);
  });

  it('should reject unauthenticated community actions', async () => {
    const resCreate = await request(app).post('/api/communities').send({
      name: 'Secret Club',
      description: 'Hidden group.',
    });
    expect(resCreate.status).toBe(401);
  });
});
