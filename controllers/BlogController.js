// controllers/BlogController.js
import Blog from "../models/Blog.js";

// Get all blogs with filtering, search, and pagination
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tag, search, status = 'published', sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter object
    let filter = { status };
    
    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const blogs = await Blog.find(filter)
      .populate("user", "username email name bio profilePicture")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    // Get unique tags for filter options
    const allTags = await Blog.distinct('tags');

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasMore: skip + blogs.length < total
      },
      filters: {
        availableTags: allTags,
        currentTag: tag || null,
        currentSearch: search || null
      }
    });
  } catch (err) {
    console.error('Get blogs error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single blog and increment views
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("user", "username email name bio profilePicture")
      .populate("comments.user", "username name profilePicture");

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error('Get blog error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new blog
export const createBlog = async (req, res) => {
  try {
    const { title, summary, content, tags, image, status = 'published' } = req.body;

    // Validation
    if (!title || !summary || !content) {
      return res.status(400).json({ error: "Title, summary, and content are required" });
    }

    // Process tags
    const processedTags = tags ? 
      tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0) : [];

    const blog = new Blog({
      title: title.trim(),
      summary: summary.trim(),
      content,
      tags: processedTags,
      image: image || null,
      status,
      user: req.user.userId,
    });

    await blog.save();
    
    // Populate user data for response
    await blog.populate("user", "username email name bio profilePicture");

    res.status(201).json({
      message: "Blog created successfully",
      blog
    });
  } catch (err) {
    console.error('Create blog error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { title, summary, content, tags, image, status } = req.body;
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check ownership (admin can edit any blog)
    if (blog.user.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to edit this blog" });
    }

    // Process tags
    const processedTags = tags ? 
      tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0) : blog.tags;

    // Update fields
    const updateFields = {
      ...(title && { title: title.trim() }),
      ...(summary && { summary: summary.trim() }),
      ...(content && { content }),
      ...(tags && { tags: processedTags }),
      ...(image !== undefined && { image }),
      ...(status && { status })
    };

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateFields, {
      new: true,
      runValidators: true
    }).populate("user", "username email name bio profilePicture");

    res.json({
      message: "Blog updated successfully",
      blog: updatedBlog
    });
  } catch (err) {
    console.error('Update blog error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check ownership (admin can delete any blog)
    if (blog.user.toString() !== req.user.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(blogId);
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error('Delete blog error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's own blogs
export const getMyBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const blogs = await Blog.find(filter)
      .populate("user", "username email name bio profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasMore: skip + blogs.length < total
      }
    });
  } catch (err) {
    console.error('Get my blogs error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Like/Unlike blog
export const toggleLike = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.userId;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const isLiked = blog.likes.includes(userId);
    
    if (isLiked) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: isLiked ? "Blog unliked" : "Blog liked",
      liked: !isLiked,
      likesCount: blog.likes.length
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add comment to blog
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const blogId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const comment = {
      user: req.user.userId,
      content: content.trim(),
      createdAt: new Date()
    };

    blog.comments.push(comment);
    await blog.save();

    // Populate the new comment
    await blog.populate("comments.user", "username name profilePicture");
    
    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user owns the comment or is admin or blog owner
    const canDelete = comment.user.toString() === req.user.userId.toString() || 
                     req.user.role === 'admin' ||
                     blog.user.toString() === req.user.userId.toString();

    if (!canDelete) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await blog.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get blog statistics (for dashboard)
export const getBlogStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';

    let filter = isAdmin ? {} : { user: userId };

    const stats = await Blog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }
          },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
          totalComments: { $sum: { $size: "$comments" } }
        }
      }
    ]);

    const result = stats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    };

    res.json(result);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
};