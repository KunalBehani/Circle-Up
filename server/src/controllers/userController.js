import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Vote } from '../models/Vote.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User '${username}' not found`,
      });
    }

    // Get user's submitted posts
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('community', 'name slug icon bannerColor')
      .populate('author', 'username avatar');

    // Attach current user's active vote if authenticated
    let userVotesMap = {};
    if (req.user && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const votes = await Vote.find({
        user: req.user._id,
        post: { $in: postIds },
      });
      votes.forEach((v) => {
        userVotesMap[v.post.toString()] = v.value;
      });
    }

    const formattedPosts = posts.map((p) => ({
      ...p.toObject(),
      userVote: userVotesMap[p._id.toString()] || null,
    }));

    // Get user's comments
    const comments = await Comment.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('post', 'title community')
      .populate({
        path: 'post',
        populate: {
          path: 'community',
          select: 'name slug',
        },
      });

    // Calculate total karma
    const totalKarma = posts.reduce((acc, curr) => acc + (curr.score || 0), 0);

    res.status(200).json({
      success: true,
      user: {
        ...user.toSafeObject(),
        totalKarma,
        postCount: posts.length,
        commentCount: comments.length,
      },
      posts: formattedPosts,
      comments,
    });
  } catch (error) {
    next(error);
  }
};
