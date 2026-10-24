import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Workflow 5: Search, Discovery & Health API', () => {
  setupTestDB();

  let token, userId;

  beforeEach(async () => {
    const userRes = await request(app).post('/api/auth/register').send({
      username: 'explorer_user',
      email: 'explorer@example.com',
      password: 'password123',
    });
    token = userRes.body.token;
    userId = userRes.body.user._id;

    // Create a community
    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Quantum Computing',
        description: 'Qubits, quantum gates, entanglement, and algorithms.',
        category: 'Science',
      });
    const commId = commRes.body.community._id;

    // Create 2 posts
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Introduction to Superposition and Interference',
        body: 'Understanding quantum mechanics foundations in modern hardware.',
        communityId: commId,
      });

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Silicon Qubit coherence times reaching milestones',
        body: 'Industrial breakthroughs in cryo-computing architectures.',
        communityId: commId,
      });
  });

  it('should return health check information on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('CircleUp');
  });

  it('should search communities and posts globally by keyword', async () => {
    const res = await request(app).get('/api/search?q=Quantum');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results.communities.length).toBeGreaterThanOrEqual(1);
    expect(res.body.results.communities[0].name).toBe('Quantum Computing');
    expect(res.body.results.posts.length).toBeGreaterThanOrEqual(1);
  });

  it('should sort posts by latest and top', async () => {
    const resLatest = await request(app).get('/api/posts?sort=latest');
    expect(resLatest.status).toBe(200);
    expect(resLatest.body.posts.length).toBe(2);

    const resTop = await request(app).get('/api/posts?sort=top');
    expect(resTop.status).toBe(200);
    expect(resTop.body.posts.length).toBe(2);

    const resTrending = await request(app).get('/api/posts?sort=trending');
    expect(resTrending.status).toBe(200);
    expect(resTrending.body.posts.length).toBe(2);
  });

  it('should retrieve user profile with submitted posts and karma', async () => {
    const res = await request(app).get('/api/users/explorer_user');
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('explorer_user');
    expect(res.body.user.postCount).toBe(2);
    expect(res.body.user.totalKarma).toBe(2);
    expect(res.body.posts.length).toBe(2);
  });
});
