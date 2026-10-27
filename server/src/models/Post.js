import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    body: {
      type: String,
      default: '',
      maxlength: [10000, 'Body text cannot exceed 10,000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'link'],
      default: 'text',
    },
    linkUrl: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (this.type === 'link') {
            return /^https?:\/\/.+/i.test(v);
          }
          return true;
        },
        message: 'A valid http:// or https:// URL is required for link posts',
      },
    },
    media: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicId: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            enum: ['image', 'video'],
            required: true,
          },
          format: {
            type: String,
            default: '',
          },
          width: Number,
          height: Number,
          duration: Number,
        },
      ],
      default: [],
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Community reference is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and search indexes
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ score: -1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ title: 'text', body: 'text' });

export const Post = mongoose.model('Post', postSchema);
