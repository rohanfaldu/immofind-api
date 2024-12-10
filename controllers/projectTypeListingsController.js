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
    // const formattedData = projectTypeListings.map((item) => ({
    //   ...item,
    //   category: item.category.toString(),
    //    // Convert BigInt to string
    // }));

    const formattedData = projectTypeListings.map((item) => {
      const lang = res.getLocale();
      const propetyName =
        lang === 'fr'
          ? item.lang_translations.fr_string
          : item.lang_translations.en_string;

          return {
            id: item.id,
            icon: item.icon,
            name: propetyName,
            type: item.type,
            key: item.key,
            category: item.category.toString(),
          }

    });
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

export const updateProjectTypeListing = async (req, res) => {
  const { id, en_string, fr_string, icon, type, category, updated_by, lang, key } = req.body;

  // Ensure the required fields are provided
  if (!id || !en_string || !fr_string || !icon || !type || !category || !updated_by || !lang || !key) {
    return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
  }
    console.log(id);

  try {
    // Step 1: Find the existing ProjectTypeListing
    const existingProjectTypeListing = await prisma.projectTypeListings.findUnique({
      where: { id },
      include: {
        lang_translations: true, // Fetch the related LangTranslation
      },
    });

    if (!existingProjectTypeListing) {
      return response.error(res, res.__('messages.projectTypeListingNotFound'), null, 404);
    }

    // Step 2: Update LangTranslations
    const updatedLangTranslation = await prisma.langTranslations.update({
      where: { id: existingProjectTypeListing.lang_translations.id },
      data: {
        en_string: en_string, // English translation
        fr_string: fr_string, // French translation
        updated_by: updated_by, // The updater's ID
      },
    });
    // Step 3: Update the ProjectTypeListing
    const updatedProjectTypeListing = await prisma.projectTypeListings.update({
      where: { id },
      data: {
        icon: icon,
        type: type,
        category: category,
        updated_by: updated_by,
        lang_translations: {
          connect: {
            id: updatedLangTranslation.id, // Ensure the LangTranslation is linked
          },
        },
        key: key,
      },
    });

    // Step 4: Convert BigInt to string for response
    const responseData = {
      ...updatedProjectTypeListing,
      category: updatedProjectTypeListing.category.toString(), // Convert BigInt to string
    };

    return response.success(
      res,
      res.__('messages.projectTypeListingUpdatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error('Error updating project type listing:', error);
    return response.error(
      res,
      res.__('messages.projectTypeListingUpdateError'),
      error.message,
      500
    );
  }
};

export const deleteProjectTypeListing = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return response.error(res, res.__('messages.idRequired'), null, 400);
  }

  try {
    // Step 1: Fetch the ProjectTypeListing and its linked LangTranslations
    const existingProjectTypeListing = await prisma.projectTypeListings.findUnique({
      where: { id },
      include: {
        lang_translations: true,
      },
    });

    if (!existingProjectTypeListing) {
      return response.error(res, res.__('messages.projectTypeListingNotFound'), null, 404);
    }

    // Step 2: Delete records in a transaction
    await prisma.$transaction(async (prisma) => {
      // Check if propertyListings is properly defined in schema
      if (prisma.propertyListings) {
        // Delete dependent records in propertyListings (if exists)
        await prisma.propertyListings.deleteMany({
          where: {
            name: existingProjectTypeListing.lang_translations.id,
          },
        });
      }

      // Delete the ProjectTypeListing
      await prisma.projectTypeListings.delete({
        where: { id },
      });

      // Delete the linked LangTranslations
      if (existingProjectTypeListing.lang_translations?.id) {
        await prisma.langTranslations.delete({
          where: { id: existingProjectTypeListing.lang_translations.id },
        });
      }
    });

    // Step 3: Return success response
    return response.success(
      res,
      res.__('messages.projectTypeListingDeletedSuccessfully'),
      null
    );
  } catch (error) {
    console.error('Error deleting project type listing:', error);

    // Handle specific error cases
    if (error.code === 'P2003') {
      return response.error(
        res,
        res.__('messages.cannotDeleteProjectTypeListingDueToDependencies'),
        null,
        400
      );
    }

    return response.serverError(res, error);
  }
};
