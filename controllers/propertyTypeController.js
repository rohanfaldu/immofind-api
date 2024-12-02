import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();

export const getPropertyTypes = async (req, res) => {
  const { lang } = req.body; // Language preference passed in the request (e.g., "en" or "fr")

 try {
 const propertyTypes = await prisma.propertyTypes.findMany({
  include: {
    lang_translations: true,  // Include the related LangTranslations data
  },
});

const simplifiedProperties = await Promise.all(propertyTypes.map(async (property) => {
  // Fetch the user name using the created_by UUID
  const user = property.created_by
    ? await prisma.users.findUnique({
        where: { id: property.created_by },
        select: { user_name: true },
      })
    : null;

  return {
    id: property.id,
    title:
      property.lang_translations
        ? lang === 'fr'
          ? property.lang_translations.fr_string
          : property.lang_translations.en_string
        : 'No title available',
    created_by: user ? user.user_name : 'Unknown User', // Use the user name or fallback
    createdAt: property.created_at,
  };
}));

return response.success(
  res,
  res.__('messages.propertyTypesFetchedSuccessfully'),
  simplifiedProperties
);
} catch (error) {
   console.error("Error fetching property types:", error);

    return response.error(
      res,
      res.__('messages.errorFetchingPropertyTypes'),
      error.message,
      500
    );
  }
};
export const createPropertyType = async (req, res) => {
  const { en_string, fr_string, created_by } = req.body;

  // Validate required fields
  if (!en_string || !fr_string || !created_by) {
    return response.error(
      res,
      res.__('messages.missingRequiredFields'),
      400
    );
  }

  try {
    // Insert the translations into LangTranslations
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string, // English string
        fr_string, // French string
      },
    });

    // Insert into PropertyTypes with the LangTranslation ID
    const newPropertyType = await prisma.propertyTypes.create({
      data: {
        title: langTranslation.id, // Reference the LangTranslation entry
        created_by,
        created_at: new Date(),
      },
    });

    // Return success response
    return response.success(
      res,
      res.__('messages.propertyTypeCreatedSuccessfully'),
      newPropertyType
    );
  } catch (error) {
    console.error(error);
    // Return error response
    return response.error(
      res,
      res.__('messages.errorCreatingPropertyType'),
      500,
      error.message
    );
  }
};
