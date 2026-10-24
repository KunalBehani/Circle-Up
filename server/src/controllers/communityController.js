import { Community } from '../models/Community.js';
import { isValidObjectId } from '../utils/validators.js';

export const getCommunities = async (req, res, next) => {
  try {
    const { category, search, sort = 'members', limit = 50 } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { memberCount: -1, createdAt: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const communities = await Community.find(filter)
      .sort(sortOption)
      .limit(parseInt(limit, 10))
      .populate('creator', 'username avatar');

    const formatted = communities.map((comm) => {
      const isMember = req.user
        ? comm.members.some((m) => m.toString() === req.user._id.toString())
        : false;

      return {
        ...comm.toObject(),
        isMember,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      communities: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunityByName = async (req, res, next) => {
  try {
    const { communityName } = req.params;
    const slug = Community.slugify(communityName);

    const community = await Community.findOne({
      $or: [{ slug }, { name: new RegExp(`^${communityName}$`, 'i') }],
    }).populate('creator', 'username avatar joinedAt');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: `Community 'c/${communityName}' not found`,
      });
    }

    const isMember = req.user
      ? community.members.some((m) => m.toString() === req.user._id.toString())
      : false;

    res.status(200).json({
      success: true,
      community: {
        ...community.toObject(),
        isMember,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCommunity = async (req, res, next) => {
  try {
    const { name, description, category, bannerColor } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Community name and description are required',
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Community name must be between 2 and 30 characters',
      });
    }

    const slug = Community.slugify(trimmedName);
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Community name must contain valid alphanumeric characters',
      });
    }

    const existing = await Community.findOne({
      $or: [{ slug }, { name: new RegExp(`^${trimmedName}$`, 'i') }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A community named '${trimmedName}' or with slug 'c/${slug}' already exists`,
      });
    }

    const community = await Community.create({
      name: trimmedName,
      slug,
      description: description.trim(),
      category: category || 'General',
      bannerColor: bannerColor || '#4F46E5',
      creator: req.user._id,
      members: [req.user._id], // Creator joins automatically
      memberCount: 1,
    });

    const populated = await Community.findById(community._id).populate('creator', 'username avatar');

    res.status(201).json({
      success: true,
      message: `Community 'c/${slug}' created successfully`,
      community: {
        ...populated.toObject(),
        isMember: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    let community;
    if (isValidObjectId(communityId)) {
      community = await Community.findById(communityId);
    } else {
      community = await Community.findOne({ slug: Community.slugify(communityId) });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const userId = req.user._id;
    const isAlreadyMember = community.members.some((m) => m.toString() === userId.toString());

    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community',
      });
    }

    // Atomic membership addition and count increment
    const updated = await Community.findByIdAndUpdate(
      community._id,
      {
        $addToSet: { members: userId },
        $inc: { memberCount: 1 },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Joined c/${updated.slug}`,
      isMember: true,
      memberCount: updated.memberCount,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    const { communityId } = req.params;

    let community;
    if (isValidObjectId(communityId)) {
      community = await Community.findById(communityId);
    } else {
      community = await Community.findOne({ slug: Community.slugify(communityId) });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const userId = req.user._id;
    const isMember = community.members.some((m) => m.toString() === userId.toString());

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community',
      });
    }

    // Atomic membership removal and count decrement
    const updated = await Community.findByIdAndUpdate(
      community._id,
      {
        $pull: { members: userId },
        $inc: { memberCount: -1 },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Left c/${updated.slug}`,
      isMember: false,
      memberCount: Math.max(0, updated.memberCount),
    });
  } catch (error) {
    next(error);
  }
};
