import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Workflow 3A: Posts Management API', () => {
  setupTestDB();

  let tokenAuthor, tokenOther, communityId;

  beforeEach(async () => {
    const authorRes = await request(app).post('/api/auth/register').send({
      username: 'post_author',
      email: 'author@example.com',
      password: 'password123',
    });
    tokenAuthor = authorRes.body.token;

    const otherRes = await request(app).post('/api/auth/register').send({
      username: 'other_user',
      email: 'other@example.com',
      password: 'password123',
    });
    tokenOther = otherRes.body.token;

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        name: 'Tech Discussions',
        description: 'Tech chats and news.',
      });
    communityId = commRes.body.community._id;
  });

  it('should create a text post with initial score of 1 from author upvote', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Initial text post title',
        body: 'Detailed body content here.',
        type: 'text',
        communityId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.title).toBe('Initial text post title');
    expect(res.body.post.score).toBe(1);
    expect(res.body.post.userVote).toBe(1);
  });

  it('should create a link post with valid URL and reject invalid URL schemes', async () => {
    // Valid link
    const validRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Learn JavaScript at MDN',
        type: 'link',
        linkUrl: 'https://developer.mozilla.org',
        communityId,
      });
    expect(validRes.status).toBe(201);
    expect(validRes.body.post.linkUrl).toBe('https://developer.mozilla.org');

    // Invalid scheme
    const invalidRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Malicious protocol post',
        type: 'link',
        linkUrl: 'javascript:alert(1)',
        communityId,
      });
    expect(invalidRes.status).toBe(400);
  });

  it('should allow author to edit their own post, but reject non-author edit', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Original Title',
        body: 'Original Body',
        communityId,
      });
    const postId = postRes.body.post._id;

    // Unauthorized edit attempt by other user
    const unauthEdit = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenOther}`)
      .send({ title: 'Hacked Title' });
    expect(unauthEdit.status).toBe(403);

    // Authorized edit by author
    const authEdit = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({ title: 'Updated Title By Author' });
    expect(authEdit.status).toBe(200);
    expect(authEdit.body.post.title).toBe('Updated Title By Author');
  });

  it('should allow author to delete their own post, but reject non-author delete', async () => {
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Post to Delete',
        communityId,
      });
    const postId = postRes.body.post._id;

    // Non-author delete
    const unauthDelete = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenOther}`);
    expect(unauthDelete.status).toBe(403);

    // Author delete
    const authDelete = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${tokenAuthor}`);
    expect(authDelete.status).toBe(200);

    // Confirm post is gone
    const fetchRes = await request(app).get(`/api/posts/${postId}`);
    expect(fetchRes.status).toBe(404);
  });

  it('should support pagination and filtering on posts feed', async () => {
    // Create 3 posts
    for (let i = 1; i <= 3; i++) {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenAuthor}`)
        .send({
          title: `Pagination Test Post ${i}`,
          communityId,
        });
    }

    const res = await request(app).get(`/api/posts?community=${communityId}&limit=2&page=1`);
    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBe(2);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
  });
});
