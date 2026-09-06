import { Op } from "sequelize";
import { User, Blog as BlogModel } from "../models/association.js";



// Create Blog Post
export const createBlog = async (req, res) => {
  try {
    const { blogTitle, blog, category } = req.body;
    
    if (!blogTitle || !blog || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (blogTitle.trim().length < 3 || blog.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Blog title must be at least 3 characters and content must be at least 20 characters.'
      });
    }

    const createdBlog = await BlogModel.create({
      userId: req.user.id,
      blogTitle,
      blog,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { id: createdBlog.id, userId: req.user.id, blogTitle, blog, category }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to create the blog." });
  }
};




export const getAllBlogs = async (req, res) => {
    try {
        const { title = req.query.search || "", category = "" } = req.query;

        const where = {};

        // Search by blog title/content
        if (title) {
            where[Op.or] = [
                {
                    blogTitle: {
                [Op.like]: `%${title}%`
                    }
                },
                {
                    blog: {
                [Op.like]: `%${title}%`
                    }
                }
            ];
        }

        // Filter by category
        if (category) {
            where.category = category;
        }

        const blogs = await BlogModel.findAll({
            where,
            attributes: [
                "id",
                "blogTitle",
                "blog",
                "category",
                "createAt",
                "updateAt"
            ],
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "profileImage"
                    ]
                }
            ]
        });

        return res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (error) {
        console.error("GET ALL BLOGS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load blogs."
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blogId = Number(req.params.id);

        // Invalid ID check
        if (!Number.isInteger(blogId) || blogId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        const blog = await BlogModel.findByPk(blogId, {
            attributes: [
                "id",
                "blogTitle",
                "blog",
                "category",
                "createAt",
                "updateAt"
            ],
            include: [
                {
                    association: "author",
                    attributes: [
                        "id",
                        "firstname",
                        "lastname",
                        "profileImage"
                        
                    ]
                }
            ]
        });

        // Blog not found
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: blog
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load the blog."
        });
    }
};




// Update Blog (Owner or Admin)
export const updateBlog = async (req, res) => {
  try {
    const blogId = Number(req.params.id);
    const { blogTitle, blog, category } = req.body;

    // Validate Blog ID
    if (!Number.isInteger(blogId) || blogId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID."
      });
    }

    // Find blog
    const existingBlog = await BlogModel.findByPk(blogId);

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found."
      });
    }

    // Check ownership unless Admin
    if (
      existingBlog.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this blog."
      });
    }

    // Validate required fields
    if (!blogTitle || !blog || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    if (blogTitle.trim().length < 3 || blog.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Blog title must be at least 3 characters and content must be at least 20 characters."
      });
    }

    // Update blog
    await existingBlog.update({
      blogTitle,
      blog,
      category
    });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully."
    });

  } catch (error) {
    console.error("UPDATE BLOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update the blog."
    });
  }
};


// Delete Blog (Owner or Admin)
export const deleteBlog = async (req, res) => {
  try {
    const blogId = Number(req.params.id);

    // Validate Blog ID
    if (!Number.isInteger(blogId) || blogId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID."
      });
    }

    // Find blog
    const existingBlog = await BlogModel.findByPk(blogId);

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found."
      });
    }

    // Check ownership unless Admin
    if (
      existingBlog.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this blog."
      });
    }

    // Delete blog
    await existingBlog.destroy();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully."
    });

  } catch (error) {
    console.error("DELETE BLOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the blog."
    });
  }
};