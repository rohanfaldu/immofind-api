import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';

const prisma = new PrismaClient();

export const createBlog = async (req, res) => {
  const { title_en, title_fr, description_en, description_fr, author_id, image } = req.body;

  // Generate unique slug based on blog title
  const generateUniqueSlug = async (baseSlug, attempt = 0) => {
    const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
    const existingSlug = await prisma.blog.findUnique({
      where: { slug: slug },
    });
    return existingSlug ? generateUniqueSlug(baseSlug, attempt + 1) : slug;
  };

  // Validate required fields
  if (!title_en || !title_fr || !description_en || !description_fr || !image) {
    return response.error(res, res.__('messages.missingFields'));
  }

  try {
    // Validate author if provided
    if (author_id) {
      const authorExists = await prisma.author.count({
        where: { id: author_id }
      });
      if (authorExists === 0) {
        return response.error(res, res.__('messages.authorNotFound'));
      }
    }

    // Create slug from English title
    const baseSlug = slugify(title_en, { lower: true, replacement: '_', strict: true });
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const existingBlog = await prisma.blog.findFirst({
      where: {
        lang_translations_blog_title: {
          is: {
            OR: [
              { en_string: { equals: title_en, mode: 'insensitive' } },
              { fr_string: { equals: title_fr, mode: 'insensitive' } }
            ]
          }
        }
      }
    });

    if (existingBlog) {
      return response.error(res, res.__('messages.blogAlreadyExist'));
    }

    // Create title translations
    const titleTranslation = await prisma.langTranslations.create({
      data: {
        en_string: title_en,
        fr_string: title_fr,
      },
    });

    // Create description translations
    const descriptionTranslation = await prisma.langTranslations.create({
      data: {
        en_string: description_en,
        fr_string: description_fr,
      },
    });

    // Create the blog post
    const blog = await prisma.blog.create({
      data: {
        title: titleTranslation.id,
        description: descriptionTranslation.id,
        image: image,
        slug: uniqueSlug,
        ...(author_id && { author_id }), // Add author_id only if provided
      },
      include: {
        lang_translations_blog_title: true,
        lang_translations_blog_description: true,
        author_detail: {
          include: {
            lang_translations_auth: true
          }
        }
      }
    });

    return response.success(res, res.__('messages.blogCreatedSuccessfully'), blog);
  } catch (error) {
    return response.error(res, res.__('messages.createBlogError'));
  }
};


//Edit blog //
export const editBlog = async (req, res) => {
  const { id } = req.params;
  const { title_en, title_fr, description_en, description_fr, author_id, image } = req.body;

  try {
    // Check if blog exists
    const blogExists = await prisma.blog.findUnique({
      where: { id }
    });

    if (!blogExists) {
      return response.error(res, res.__('messages.blogNotFound'));
    }

    // If author_id is provided, check if the author exists
    if (author_id) {
      const authorExists = await prisma.author.count({
        where: { id: author_id }
      });
      if (authorExists === 0) {
        return response.error(res, res.__('messages.authorNotFound'));
      }
    }

    let updateData = {};

    // Update title translations if provided
    if (title_en || title_fr) {
      await prisma.langTranslations.update({
        where: { id: blogExists.title },
        data: {
          ...(title_en && { en_string: title_en }),
          ...(title_fr && { fr_string: title_fr })
        }
      });
    }

    // Update description translations if provided
    if (description_en || description_fr) {
      await prisma.langTranslations.update({
        where: { id: blogExists.description },
        data: {
          ...(description_en && { en_string: description_en }),
          ...(description_fr && { fr_string: description_fr })
        }
      });
    }

    // Update other fields if provided
    if (author_id) {
      updateData.author_id = author_id;
    }

    if (image !== undefined) {
      updateData.image = image;
    }

    // Update updated_at timestamp
    updateData.updated_at = new Date();

    // Update the blog post
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        lang_translations_blog_title: true,
        lang_translations_blog_description: true,
        author_detail: {
          include: {
            lang_translations_auth: true
          }
        }
      }
    });

    // Format response including slug
    const responseBlog = {
      id: updatedBlog.id,
      slug: updatedBlog.slug || '', // ✅ added slug here
      title: {
        en: updatedBlog.lang_translations_blog_title?.en_string || '',
        fr: updatedBlog.lang_translations_blog_title?.fr_string || ''
      },
      description: {
        en: updatedBlog.lang_translations_blog_description?.en_string || '',
        fr: updatedBlog.lang_translations_blog_description?.fr_string || ''
      },
      image: updatedBlog.image || '',
      author: updatedBlog.author_detail ? {
        id: updatedBlog.author_detail.id,
        name: updatedBlog.author_detail.lang_translations_auth?.en_string || updatedBlog.author_detail.name || ''
      } : null,
      created_at: updatedBlog.created_at,
      updated_at: updatedBlog.updated_at
    };

    return response.success(res, res.__('messages.blogUpdatedSuccessfully'), responseBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return response.error(res, res.__('messages.updateBlogError'));
  }
};



// Delete Blog //
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true
      }
    });

    if (!blog) {
      return response.error(res, res.__('messages.blogNotFound'));
    }

    // Begin transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Delete the blog first
      const deletedBlog = await prisma.blog.delete({
        where: { id }
      });

      // Then delete the associated translations if they exist
      if (blog.title) {
        await prisma.langTranslations.delete({
          where: { id: blog.title }
        });
      }

      if (blog.description) {
        await prisma.langTranslations.delete({
          where: { id: blog.description }
        });
      }

      return deletedBlog;
    });

    return response.success(res, res.__('messages.blogDeletedSuccessfully'), { id });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return response.error(res, res.__('messages.deleteBlogError'));
  }
};




// Get blog detail //
export const getBlogDetailById = async (req, res) => {
  const { slug } = req.body;
  const lang = res.getLocale(); // Example: 'en', 'fr', etc.

  try {
    // Find current blog
    const blog = await prisma.blog.findUnique({
      where: { slug: slug },
      include: {
        lang_translations_blog_title: true,
        lang_translations_blog_description: true,
        author_detail: {
          select: {
            id: true,
            image: true, // <-- Add this to get author's image
            lang_translations_auth: true
          }
        }
      }
    });

    if (!blog) {
      return response.error(res, res.__('messages.blogNotFound'));
    }

    // Helper to get translated fields
    const getTranslatedField = (translations, fallback = '') => {
      if (!translations) return fallback;
      const langField = `${lang}_string`;
      return translations[langField] || translations.en_string || fallback;
    };

    // Find previous blog (smaller created_at)
    const previousBlog = await prisma.blog.findFirst({
      where: {
        created_at: { lt: blog.created_at } // less than current blog
      },
      orderBy: { created_at: 'desc' },
      select: {
        slug: true,
        lang_translations_blog_title: true
      }
    });

    // Find next blog (greater created_at)
    const nextBlog = await prisma.blog.findFirst({
      where: {
        created_at: { gt: blog.created_at } // greater than current blog
      },
      orderBy: { created_at: 'asc' },
      select: {
        slug: true,
        lang_translations_blog_title: true
      }
    });

    const formattedBlog = {
      id: blog.id,
      slug: blog.slug || '',
      title: getTranslatedField(blog.lang_translations_blog_title),
      description: getTranslatedField(blog.lang_translations_blog_description),
      image: blog.image || '',
      author: blog.author_detail ? {
        id: blog.author_detail.id,
        image: blog.author_detail.image,
        name: getTranslatedField(blog.author_detail.lang_translations_auth, blog.author_detail.name)
      } : null,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      previousBlog: previousBlog ? {
        slug: previousBlog.slug,
        title: getTranslatedField(previousBlog.lang_translations_blog_title)
      } : null,
      nextBlog: nextBlog ? {
        slug: nextBlog.slug,
        title: getTranslatedField(nextBlog.lang_translations_blog_title)
      } : null,
    };

    return response.success(res, res.__('messages.blogDetailsFetched'), formattedBlog);

  } catch (error) {
    console.error('Error fetching blog details:', error);
    return response.error(res, res.__('messages.fetchBlogDetailsError'));
  }
};


// Blog List //
export const getBlogList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      author_id = ''
    } = req.body;

    const lang = res.getLocale(); // Only once!

    // Safely parse and validate page/limit
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build where clause
    let whereClause = {};

    if (author_id) {
      whereClause.author_id = author_id;
    }

    if (search) {
      whereClause.OR = [
        {
          lang_translations_blog_title: {
            OR: [
              { en_string: { contains: search, mode: 'insensitive' } },
              { fr_string: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          lang_translations_blog_description: {
            OR: [
              { en_string: { contains: search, mode: 'insensitive' } },
              { fr_string: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Get total count (before pagination)
    const totalCount = await prisma.blog.count({ where: whereClause });

    // Fetch blogs with pagination
    const blogs = await prisma.blog.findMany({
      where: whereClause,
      include: {
        lang_translations_blog_title: true,
        lang_translations_blog_description: true,
        author_detail: {
          include: {
            lang_translations_auth: true
          }
        }
      },
      skip: skip,
      take: limitNumber,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Helper function to get translation dynamically
    const getTranslatedField = (translations, fallback = '') => {
      if (!translations) return fallback;
      const langField = `${lang}_string`;
      return translations[langField] || translations.en_string || fallback;
    };

    // Format blogs correctly (map over array)
    const formattedBlogs = blogs.map(blog => ({
      id: blog.id,
      slug: blog.slug || '',
      title: getTranslatedField(blog.lang_translations_blog_title),
      description: getTranslatedField(blog.lang_translations_blog_description),
      image: blog.image || '',
      author: blog.author_detail ? {
        id: blog.author_detail.id,
        name: getTranslatedField(blog.author_detail.lang_translations_auth, blog.author_detail.name)
      } : null,
      created_at: blog.created_at,
      updated_at: blog.updated_at
    }));

    // Pagination metadata
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    // Send final response
    return response.success(res, res.__('messages.blogListFetched'), {
      totalCount: totalCount,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      blogs: formattedBlogs
    });

  } catch (error) {
    return response.error(res, res.__('messages.fetchBlogListError'));
  }
};

