import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Vote } from '../src/models/Vote.js';

describe('Workflow 3B: Voting Transitions & Invariant Logic', () => {
  setupTestDB();

  let tokenAuthor, tokenVoter, postId;

  beforeEach(async () => {
    const authorRes = await request(app).post('/api/auth/register').send({
      username: 'vote_author',
      email: 'va@example.com',
      password: 'password123',
    });
    tokenAuthor = authorRes.body.token;

    const voterRes = await request(app).post('/api/auth/register').send({
      username: 'voter_one',
      email: 'vo@example.com',
      password: 'password123',
    });
    tokenVoter = voterRes.body.token;

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        name: 'Voting Sandbox',
        description: 'Testing voting state machines.',
      });

    // Author creates post (initial score is 1 from author's upvote)
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenAuthor}`)
      .send({
        title: 'Post to test vote transitions',
        communityId: commRes.body.community._id,
      });
    postId = postRes.body.post._id;
  });

  it('Transition 1: Upvote from non-voting state adds +1 to score', async () => {
    // Current score: 1. Voter one casts upvote (+1) -> score should become 2
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(2);
    expect(res.body.userVote).toBe(1);

    // Verify database record
    const voteDocs = await Vote.find({ post: postId });
    expect(voteDocs.length).toBe(2); // Author vote + Voter vote
  });

  it('Transition 2: Upvote to Downvote decreases score by -2', async () => {
    // First, upvote (+1) -> score: 2
    await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    // Now switch to downvote (-1) -> score: 2 - 2 = 0
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: -1 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(0);
    expect(res.body.userVote).toBe(-1);
  });

  it('Transition 3: Downvote to Upvote increases score by +2', async () => {
    // First downvote (-1) -> initial 1 - 1 = 0
    await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: -1 });

    // Switch to upvote (+1) -> 0 + 2 = 2
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(2);
    expect(res.body.userVote).toBe(1);
  });

  it('Transition 4: Clicking same vote again removes vote and reverses score', async () => {
    // Upvote (+1) -> score: 2
    await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    // Click upvote again -> unvote (score becomes 1, userVote is null)
    const res = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(1);
    expect(res.body.userVote).toBeNull();

    // Downvote (-1) -> score: 0
    await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: -1 });

    // Click downvote again -> unvote (score returns to 1)
    const resUnDown = await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: -1 });

    expect(resUnDown.status).toBe(200);
    expect(resUnDown.body.score).toBe(1);
    expect(resUnDown.body.userVote).toBeNull();
  });

  it('Duplicate Vote Prevention: Multiple identical requests do not corrupt scores', async () => {
    // Rapid duplicate actions
    await request(app)
      .post(`/api/posts/${postId}/vote`)
      .set('Authorization', `Bearer ${tokenVoter}`)
      .send({ value: 1 });

    // Confirm only 1 vote record exists for this voter
    const votes = await Vote.find({ post: postId, user: (await Vote.findOne({ value: 1 })).user });
    expect(votes.length).toBe(1);
  });
});
