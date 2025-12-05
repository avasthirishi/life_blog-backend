// models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200 
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    content: { 
      type: String, 
      required: true 
    },
    image: {
      type: String,
      default: null
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    views: {
      type: Number,
      default: 0
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Virtual for like count
blogSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
blogSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

blogSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Blog", blogSchema);