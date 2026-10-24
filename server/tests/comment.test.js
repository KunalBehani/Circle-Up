import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Post } from '../src/models/Post.js';

describe('Workflow 4: Comments and Discussions API', () => {
  setupTestDB();

  let tokenAuthor, tokenCommenter, tokenStranger, postId;

  beforeEach(async () => {
    const authorRes = await request(app).post('/api/auth/register').send({
      username: 'post_author',
      email: 'pauthor@example.com',
      password: 'password123',
    });
    tokenAuthor = authorRes.body.token;

    const commenterRes = await request(app).post('/api/auth/register').send({
      username: 'commenter_user',
      email: 'commenter@example.com',
      password: 'password123',
    });
    tokenCommenter = commenterRes.body.token;

    const strangerRes = await request(app).post('/api/auth/register').send({
      username: 'stranger_user',
      email: 'stranger@example.com',
      password: 'password123',
    });
    tokenStranger = strangerRes.body.token;

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        name: 'Discussion Forum',
        description: 'Open discussions.',
      });

    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Post to receive comments',
        communityId: commRes.body.community._id,
      });
    postId = postRes.body.post._id;
  });

  it('should add a comment and increment post commentCount', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenCommenter}`)
      .send({ content: 'Insightful perspective, thanks for sharing!' });

    expect(res.status).toBe(201);
    expect(res.body.comment.content).toBe('Insightful perspective, thanks for sharing!');
    expect(res.body.comment.author.username).toBe('commenter_user');

    const updatedPost = await Post.findById(postId);
    expect(updatedPost.commentCount).toBe(1);
  });

  it('should list comments for a post in chronological order', async () => {
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenCommenter}`)
      .send({ content: 'First comment' });

    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({ content: 'Second comment reply' });

    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.status).toBe(200);
    expect(res.body.comments.length).toBe(2);
    expect(res.body.comments[0].content).toBe('First comment');
    expect(res.body.comments[1].content).toBe('Second comment reply');
  });

  it('should allow author to edit comment, but reject others', async () => {
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenCommenter}`)
      .send({ content: 'Original content' });

    const commentId = commentRes.body.comment._id;

    // Stranger tries to edit
    const unauthEdit = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenStranger}`)
      .send({ content: 'Malicious edit' });
    expect(unauthEdit.status).toBe(403);

    // Author edits
    const authEdit = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenCommenter}`)
      .send({ content: 'Revised clean content' });
    expect(authEdit.status).toBe(200);
    expect(authEdit.body.comment.content).toBe('Revised clean content');
  });

  it('should allow author to delete comment, decrement post commentCount, and reject others', async () => {
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenCommenter}`)
      .send({ content: 'Temporary comment' });

    const commentId = commentRes.body.comment._id;

    // Stranger tries to delete
    const unauthDelete = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenStranger}`);
    expect(unauthDelete.status).toBe(403);

    // Commenter deletes own comment
    const authDelete = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenCommenter}`);
    expect(authDelete.status).toBe(200);

    const postDoc = await Post.findById(postId);
    expect(postDoc.commentCount).toBe(0);
  });
});
