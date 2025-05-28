import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'; // adjust the path if needed
import response from '../components/utils/response.js';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();

export const createAuthor = async (req, res) => {
  const { name, image } = req.body;

  try {
    // First, check if the author already exists
    const existingAuthor = await prisma.author.findFirst({
      where: {
        lang_translations_auth: {
          is: {
            OR: [
              { en_string: { equals: name, mode: 'insensitive' } },
              { fr_string: { equals: name, mode: 'insensitive' } }
            ]
          }
        }
      },
      include: {
        lang_translations_auth: true
      }
    });


    if (existingAuthor) {
      return response.error(res, res.__('messages.authorExist'));
    }

    // Create the author if not exists
    const author = await prisma.author.create({
      data: {
        lang_translations_auth: {
          create: {
            en_string: name,
            fr_string: name
          }
        },
        image: image || '',
      },
      include: {
        lang_translations_auth: true,
      }
    });
    return response.success(res, res.__('messages.authorCreatedSuccessfully'), author);

  } catch (error) {
    return response.error(res, res.__('messages.createAuthorError'));
  }
};



// Get All Authors
export const getAllAuthors = async (req, res) => {
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

    let whereClause = {
        lang_translations_auth: true, // include full translation object
    };

    const totalCount = await prisma.author.count();

    const authors = await prisma.author.findMany(
      {
        skip: skip,
        take: limitNumber,
        orderBy: {
          created_at: 'desc'
        },
        include: whereClause,
      });

    const formattedAuthors = authors.map(author => {
      let translatedName = null;

      if (author.lang_translations_auth) {
        const langField = `${lang}_string`; // build field dynamically like 'en_string' or 'fr_string'

        translatedName = author.lang_translations_auth[langField]
          || author.lang_translations_auth['en_string'] // fallback to English
          || null;
      }

      return {
        id: author.id,
        author_name: translatedName,
        image: author.image,
        created_at: author.created_at,
        updated_at: author.updated_at,

      };
    });
    const totalPages = Math.ceil(totalCount / limitNumber);
    return response.success(res, res.__('messages.getAuthorSuccessfully'), {
      totalCount: totalCount,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      list: formattedAuthors
    });

  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.getchAuthorError'));
  }
};






// Get Single Author
export const getAuthorById = async (req, res) => {
  const { id } = req.params;

  try {
    const lang = res.getLocale().toLowerCase(); // Get selected lang ('en', 'fr', etc.)

    const author = await prisma.author.findUnique({
      where: {
        id,
      },
      include: {
        lang_translations_auth: true,
      },
    });

    if (!author) {
      return response.error(res, res.__('messages.authorNotFound'));
    }

    let translatedName = null;

    if (author.lang_translations_auth) {
      const langField = `${lang}_string`; // e.g., 'en_string', 'fr_string'

      translatedName = author.lang_translations_auth[langField]
        || author.lang_translations_auth['en_string'] // fallback to English if missing
        || null;
    }

    const formattedAuthor = {
      id: author.id,
      author_name: translatedName,
      image: author.image,
      created_at: author.created_at,
      updated_at: author.updated_at,
    };

    return response.success(res, res.__('messages.getAuthorSuccessfully'), formattedAuthor);
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.getchAuthorError'));
  }
};



// Update Author
export const updateAuthor = async (req, res) => {
  const { id } = req.params;  // id is a UUID string
  const { lang, name, image } = req.body;

  try {
    const lang = res.getLocale().toLowerCase(); // Get selected language ('en', 'fr', etc.)

    if (!id) {
      return response.error(res, res.__('messages.invalidAuthorId'));
    }

    const existingAuthor = await prisma.author.findUnique({
      where: {
        id: id,   // id is UUID
      },
      include: {
        lang_translations_auth: true,
      },
    });

    if (!existingAuthor) {
      return response.error(res, res.__('messages.authorNotFound'));
    }

    // Update translations if name is provided
    if (name && existingAuthor.lang_translations_auth) {
      await prisma.langTranslations.update({
        where: {
          id: existingAuthor.author_name, // author_name is a foreign key UUID
        },
        data: {
          en_string: name,
          fr_string: name,
          // Add more languages if needed
        },
      });
    }

    // Update author details
    const updatedAuthor = await prisma.author.update({
      where: {
        id: id,
      },
      data: {
        image: image || existingAuthor.image,
        updated_at: new Date(), // update timestamp
      },
      include: {
        lang_translations_auth: true,
      },
    });

    // Prepare formatted response
    let translatedName = null;

    if (updatedAuthor.lang_translations_auth) {
      const langField = `${lang}_string`; // like 'en_string' or 'fr_string'

      translatedName = updatedAuthor.lang_translations_auth[langField]
        || updatedAuthor.lang_translations_auth['en_string'] // fallback to English if missing
        || null;
    }

    const formattedAuthor = {
      id: updatedAuthor.id,
      author_name: translatedName,
      image: updatedAuthor.image,
      created_at: updatedAuthor.created_at,
      updated_at: updatedAuthor.updated_at,
    };

    return response.success(res, res.__('messages.authorUpdatedSuccessfully'), formattedAuthor);

  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.updateAuthorError'));
  }
};



// Delete Author
export const deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    // First check if the author exists
    const existingAuthor = await prisma.author.findUnique({
      where: { id },
      include: {
        lang_translations_auth: true,
        author_detail: true
      }
    });

    if (!existingAuthor) {
      return response.error(res, res.__('messages.authorNotFound'));
    }

    // Check if author has related blog posts
    if (existingAuthor.author_detail && existingAuthor.author_detail.length > 0) {
      return response.error(res, res.__('messages.authorHasRelatedBlogs'));
    }

    // Get the translation ID to delete it as well
    const translationId = existingAuthor.author_name;

    // Delete the author
    await prisma.author.delete({
      where: { id }
    });

    // Delete the associated translation if it exists
    if (translationId) {
      await prisma.langTranslations.delete({
        where: { id: translationId }
      });
    }

    return response.success(res, res.__('messages.authorDeletedSuccessfully'));
  } catch (error) {
    return response.error(res, res.__('messages.deleteAuthorError'));
  }
};
