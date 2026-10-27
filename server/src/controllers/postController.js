import cloudinary from '../config/cloudinary.js';
import { Post } from '../models/Post.js';
import { Community } from '../models/Community.js';
import { Vote } from '../models/Vote.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { isValidObjectId, isValidUrl, parsePagination } from '../utils/validators.js';
import { calculateTrendingScore } from '../services/trendingService.js';

export const getPosts = async (req, res, next) => {
  try {
    const { community, sort = 'latest', author } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = {};

    // Filter by community (by ID or slug)
    if (community) {
      if (isValidObjectId(community)) {
        filter.community = community;
      } else {
        const commDoc = await Community.findOne({ slug: Community.slugify(community) });
        if (commDoc) {
          filter.community = commDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            posts: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }

    // Filter by author (by ID or username)
    if (author) {
      if (isValidObjectId(author)) {
        filter.author = author;
      } else {
        const authorDoc = await User.findOne({ username: author.toLowerCase().trim() });
        if (authorDoc) {
          filter.author = authorDoc._id;
        } else {
          return res.status(200).json({
            success: true,
            posts: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }
    }

    const total = await Post.countDocuments(filter);

    let postsQuery = Post.find(filter)
      .populate('author', 'username avatar bio')
      .populate('community', 'name slug icon bannerColor');

    if (sort === 'top') {
      postsQuery = postsQuery.sort({ score: -1, createdAt: -1 }).skip(skip).limit(limit);
    } else if (sort === 'trending') {
      // For trending, we retrieve active candidate posts, apply the gravity decay formula, and slice the page
      postsQuery = postsQuery.sort({ createdAt: -1 }).limit(150);
    } else {
      // Default: latest
      postsQuery = postsQuery.sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    let posts = await postsQuery.exec();

    if (sort === 'trending') {
      posts.sort((a, b) => {
        const scoreA = calculateTrendingScore(a.score, a.createdAt);
        const scoreB = calculateTrendingScore(b.score, b.createdAt);
        return scoreB - scoreA;
      });
      posts = posts.slice(skip, skip + limit);
    }

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

    const formattedPosts = posts.map((post) => {
      const pObj = post.toObject();
      return {
        ...pObj,
        userVote: userVotesMap[post._id.toString()] || null,
      };
    });

    res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(postId)
      .populate('author', 'username avatar bio joinedAt')
      .populate('community', 'name slug description icon bannerColor memberCount');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    let userVote = null;
    if (req.user) {
      const vote = await Vote.findOne({ user: req.user._id, post: post._id });
      if (vote) userVote = vote.value;
    }

    res.status(200).json({
      success: true,
      post: {
        ...post.toObject(),
        userVote,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadToCloudinary = (file) => {
  const isVideo = file.mimetype.startsWith('video/');

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'circleup/posts',
        resource_type: isVideo ? 'video' : 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? 'video' : 'image',
          format: result.format || '',
          width: result.width,
          height: result.height,
          ...(result.duration != null && {
            duration: result.duration,
          }),
        });
      }
    );

    stream.end(file.buffer);
  });
};


export const createPost = async (req, res, next) => {
  const uploadedMedia = [];

  try {
    const { title, body, type = 'text', linkUrl, communityId } = req.body;

    if (!title || !communityId) {
      return res.status(400).json({
        success: false,
        message: 'Title and community are required',
      });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Post title must be between 3 and 300 characters',
      });
    }

    if (!['text', 'link'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post type',
      });
    }

    let community;

    if (isValidObjectId(communityId)) {
      community = await Community.findById(communityId);
    } else {
      community = await Community.findOne({
        slug: Community.slugify(communityId),
      });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Selected community does not exist',
      });
    }

    if (type === 'link') {
      if (!linkUrl || !isValidUrl(linkUrl)) {
        return res.status(400).json({
          success: false,
          message: 'A valid http:// or https:// URL is required for link posts',
        });
      }
    }

    // Upload selected files to Cloudinary.
    for (const file of req.files || []) {
      const mediaItem = await uploadToCloudinary(file);
      uploadedMedia.push(mediaItem);
    }

    const post = await Post.create({
      title: trimmedTitle,
      body: body ? body.trim() : '',
      type,
      linkUrl: type === 'link' ? linkUrl.trim() : '',
      media: uploadedMedia,
      community: community._id,
      author: req.user._id,
      score: 1,
      commentCount: 0,
    });

    // Preserve the existing automatic author upvote.
    await Vote.create({
      user: req.user._id,
      post: post._id,
      value: 1,
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar bio')
      .populate('community', 'name slug icon bannerColor');

    return res.status(201).json({
      success: true,
      message: 'Post published successfully',
      post: {
        ...populated.toObject(),
        userVote: 1,
      },
    });
  } catch (error) {
    // Avoid leaving uploaded files behind when post creation fails.
    await Promise.allSettled(
      uploadedMedia.map((item) =>
        cloudinary.uploader.destroy(item.publicId, {
          resource_type:
            item.type === 'video' ? 'video' : 'image',
        })
      )
    );

    next(error);
  }
};


export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, body, linkUrl } = req.body;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Ownership check: only author can modify
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post',
      });
    }

    if (title !== undefined) {
      const trimmed = title.trim();
      if (trimmed.length < 3 || trimmed.length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Title must be between 3 and 300 characters',
        });
      }
      post.title = trimmed;
    }

    if (body !== undefined) {
      post.body = body.trim();
    }

    if (post.type === 'link' && linkUrl !== undefined) {
      if (!isValidUrl(linkUrl)) {
        return res.status(400).json({
          success: false,
          message: 'A valid http:// or https:// URL is required',
        });
      }
      post.linkUrl = linkUrl.trim();
    }

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar bio')
      .populate('community', 'name slug icon bannerColor');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Ownership check: only author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    // Cascade delete associated comments and votes
    await Promise.all([
      Post.findByIdAndDelete(postId),
      Comment.deleteMany({ post: postId }),
      Vote.deleteMany({ post: postId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Post and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const votePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { value } = req.body;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const voteNum = Number(value);
    if (voteNum !== 1 && voteNum !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Vote value must be either 1 (upvote) or -1 (downvote)',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;

    // Check existing vote
    const existingVote = await Vote.findOne({ user: userId, post: postId });

    let scoreDelta = 0;
    let finalUserVote = null;

    if (!existingVote) {
      // 1. No existing vote -> create new vote (+1 or -1)
      await Vote.create({ user: userId, post: postId, value: voteNum });
      scoreDelta = voteNum;
      finalUserVote = voteNum;
    } else if (existingVote.value === voteNum) {
      // 2. Clicked same vote again -> remove vote (score reverses by -value)
      await Vote.findByIdAndDelete(existingVote._id);
      scoreDelta = -voteNum;
      finalUserVote = null;
    } else {
      // 3. Changed vote (up to down -> -2; down to up -> +2)
      existingVote.value = voteNum;
      await existingVote.save();
      scoreDelta = voteNum * 2;
      finalUserVote = voteNum;
    }

    // Atomic update of post score
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { score: scoreDelta } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      score: updatedPost.score,
      userVote: finalUserVote,
      message:
        finalUserVote === null
          ? 'Vote removed'
          : finalUserVote === 1
            ? 'Post upvoted'
            : 'Post downvoted',
    });
  } catch (error) {
    next(error);
  }
};

export const getPostVote = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const vote = await Vote.findOne({ user: req.user._id, post: postId });

    res.status(200).json({
      success: true,
      userVote: vote ? vote.value : null,
    });
  } catch (error) {
    next(error);
  }
};
