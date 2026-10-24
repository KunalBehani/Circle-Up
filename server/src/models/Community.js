import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Community name must be at least 2 characters'],
      maxlength: [30, 'Community name cannot exceed 30 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['Technology', 'Gaming', 'Science', 'Design', 'General', 'Programming', 'Entertainment', 'Education'],
      default: 'General',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberCount: {
      type: Number,
      default: 1,
      min: 0,
    },
    icon: {
      type: String,
      default: '',
    },
    bannerColor: {
      type: String,
      default: '#4F46E5',
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate slug from name
communitySchema.statics.slugify = function (name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Text index for search
communitySchema.index({ name: 'text', description: 'text' });

export const Community = mongoose.model('Community', communitySchema);
