import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();
const serializeBigInt = (data) => {
  if (typeof data === 'bigint') {
    return data.toString();  // Convert BigInt to string
  }
  if (Array.isArray(data)) {
    return data.map(serializeBigInt);  // Recursively process array
  }
  if (data !== null && typeof data === 'object') {
    const serializedData = {};
    for (const [key, value] of Object.entries(data)) {
      serializedData[key] = serializeBigInt(value);  // Recursively process object
    }
    return serializedData;
  }
  return data;  // Return the data as is if it's not BigInt
};
export const getAllPropertyTypeListings = async (req, res) => {
  const { lang, page = 1, limit = 10 } = req.body; // Extract language, page, and limit from the request body

  try {
    // Ensure valid page and limit
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));

    // Calculate offset (skip) for pagination
    const skip = (validPage - 1) * validLimit;

    // Fetch total count of listings
    const totalCount = await prisma.propertyTypeListings.count();

    // Fetch paginated PropertyTypeListings with related LangTranslations
    const listings = await prisma.propertyTypeListings.findMany({
      skip,
      take: validLimit,
      include: {
        lang_translations: true, // Include the related LangTranslations based on `name`
      },
    });

    // Map the results and apply language selection
    const simplifiedListings = listings.map((listing) => ({
      id: listing.id,
      icon: listing.icon,
      name:
        listing.lang_translations
          ? lang === 'fr'
            ? listing.lang_translations.fr_string // Fetch French translation
            : listing.lang_translations.en_string // Fetch English translation
          : 'No name available', // Fallback if no translation exists
      type: listing.type,
      key: listing.key,
      category: listing.category?.toString() || null, // Serialize BigInt to string
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    }));

    // Return response with pagination metadata
    const responsePayload = {
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
      data: simplifiedListings,
    };

    return response.success(
      res,
      res.__('messages.listFetchedSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error('Error fetching property type listings:', error);
    return response.serverError(res, error);
  }
};


// Get a single property type listing by ID
export const getPropertyTypeListingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response.error(res, res.__('messages.stateIdRequired'), 400);
    }

    const listing = await prisma.propertyTypeListings.findUnique({
      where: { id },
    });

    if (!listing) {
      return response.notFound(res, res.__('messages.listingNotFound'));
    }

    response.success(res, res.__('messages.listingFetchedSuccessfully'), listing);
  } catch (error) {
    response.serverError(res, error);
  }
};

// Create a new property type listing


export const createPropertyTypeListing = async (req, res) => {
  const { en_string, fr_string, icon, type, category, created_by, lang, key } = req.body;

  // Ensure the required fields are provided
  if (!en_string || !fr_string || !icon || !type || !category || !created_by || !lang || !key) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    // Step 1: Insert translations into LangTranslations
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string: en_string,  // English translation
        fr_string: fr_string,  // French translation
        created_by: created_by,  // The creator's ID
      },
    });

    // Step 2: Insert the PropertyTypeListing and link it to the LangTranslation by ID
    const propertyTypeListing = await prisma.propertyTypeListings.create({
      data: {
        icon: icon,
        type: type,
        category: category,
        created_by: created_by,
        lang_translations: {
          connect: {
            id: langTranslation.id,  // Link to the newly created LangTranslation
          },
        },
        key: key,
      },
    });

    // Step 3: Return success response (convert BigInt to string if present)
    const responseData = {
      ...propertyTypeListing,
      category: propertyTypeListing.category.toString(), // Convert BigInt to string
    };

    return response.success(
      res,
      res.__('messages.propertyTypeListingCreatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error('Error creating property type listing:', error);
    return response.serverError(res, error);
  }
};