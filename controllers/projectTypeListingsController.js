import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();

export const createProjectTypeListing = async (req, res) => {
  const { en_string, fr_string, icon, type, category, created_by, lang, key } = req.body;

  // Ensure the required fields are provided
  if (!en_string || !fr_string || !icon || !type || !category || !created_by || !lang || !key) {
    return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
  }

  try {
    // Step 1: Insert translations into LangTranslations
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string: en_string, // English translation
        fr_string: fr_string, // French translation
        created_by: created_by, // The creator's ID
      },
    });

    // Step 2: Insert the ProjectTypeListing and link it to the LangTranslation by ID
    const projectTypeListings = await prisma.projectTypeListings.create({
      data: {
        icon: icon,
        type: type,
        category: category,
        created_by: created_by,
        lang_translations: {
          connect: {
            id: langTranslation.id, // Link to the newly created LangTranslation
          },
        },
        key: key,
      },
    });

    // Step 3: Convert BigInt to string for response
    const responseData = {
      ...projectTypeListings,
      category: projectTypeListings.category.toString(), // Convert BigInt to string
    };

    return response.success(
      res,
      res.__('messages.projectTypeListingCreatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error('Error creating project type listing:', error);
    return response.error(
      res,
      res.__('messages.projectTypeListingCreationError'),
      error.message,
      500
    );
  }
};

export const getProjectTypeList = async (req, res) => {
  try {
    const projectTypeListings = await prisma.projectTypeListings.findMany({
      where: {
        is_deleted: false, // Only fetch active records
      },
      include: {
        lang_translations: true, // Include associated translations
      },
    });

    // Format the response (convert BigInt fields to strings if necessary)
    const formattedData = projectTypeListings.map((item) => ({
      ...item,
      category: item.category.toString(), // Convert BigInt to string
    }));

    return response.success(
      res,
      res.__('messages.projectTypeListingsFetchedSuccessfully'),
      formattedData
    );
  } catch (error) {
    console.error('Error fetching project type listings:', error);
    return response.error(
      res,
      res.__('messages.projectTypeListingFetchError'),
      error.message,
      500
    );
  }
};
