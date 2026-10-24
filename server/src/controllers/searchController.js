import { Post } from '../models/Post.js';
import { Community } from '../models/Community.js';
import { Vote } from '../models/Vote.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        query: '',
        results: {
          communities: [],
          posts: [],
        },
      });
    }

    const searchQuery = q.trim();
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    let communities = [];
    let posts = [];

    // Search communities if type is 'all' or 'communities'
    if (type === 'all' || type === 'communities') {
      const commDocs = await Community.find({
        $or: [
          { name: regex },
          { slug: regex },
          { description: regex },
        ],
      })
        .limit(parsedLimit)
        .populate('creator', 'username avatar');

      communities = commDocs.map((comm) => ({
        ...comm.toObject(),
        isMember: req.user
          ? comm.members.some((m) => m.toString() === req.user._id.toString())
          : false,
      }));
    }

    // Search posts if type is 'all' or 'posts'
    if (type === 'all' || type === 'posts') {
      const postDocs = await Post.find({
        $or: [
          { title: regex },
          { body: regex },
        ],
      })
        .sort({ score: -1, createdAt: -1 })
        .limit(parsedLimit)
        .populate('author', 'username avatar')
        .populate('community', 'name slug icon bannerColor');

      let userVotesMap = {};
      if (req.user && postDocs.length > 0) {
        const postIds = postDocs.map((p) => p._id);
        const votes = await Vote.find({
          user: req.user._id,
          post: { $in: postIds },
        });
        votes.forEach((v) => {
          userVotesMap[v.post.toString()] = v.value;
        });
      }

      posts = postDocs.map((post) => ({
        ...post.toObject(),
        userVote: userVotesMap[post._id.toString()] || null,
      }));
    }

    res.status(200).json({
      success: true,
      query: searchQuery,
      results: {
        communities,
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};
