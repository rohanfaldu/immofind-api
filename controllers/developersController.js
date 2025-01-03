import { PrismaClient } from '@prisma/client';
import User from '../models/userModel.js';
import response from "../components/utils/response.js";
import passwordGenerator from "../components/utils/passwordGenerator.js";
import crypto from 'crypto';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create a developer
import jwt from 'jsonwebtoken';

export const createDeveloper = async (req, res) => {
  // Extract locale and auth data
  const lang = req.getLocale(); // Assuming your app supports locale retrieval

  // Verify the authorization token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Authorization token missing or invalid', null, 401);
  }

  const token = authHeader.split(' ')[1];
  let createdUserId;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    createdUserId = decodedToken.id; // The ID of the user creating the developer profile
  } catch (err) {
    return response.error(res, 'Invalid or expired token', null, 401);
  }

  // Destructure request body
  const {
    user_id,
    credit,
    description_en,
    description_fr,
    facebook_link,
    twitter_link,
    youtube_link,
    pinterest_link,
    linkedin_link,
    instagram_link,
    whatsappPhone,
    service_area_en,
    service_area_fr,
    tax_number,
    country_code,
    license_number,
  } = req.body;

  try {
    // Check if the user exists and has the 'developer' role
    const existingUser = await prisma.users.findUnique({
      where: { id: user_id },
      include: { roles: true },
    });

    if (!existingUser) {
      return response.error(res, res.__('messages.userNotFound'), null);
    }

    if (existingUser.roles.name !== 'developer') {
      return response.error(
        res,
        res.__('messages.userNotAuthorizedToCreateDeveloper'),
        null
      );
    }

    // Check if developer profile already exists
    const existingDeveloper = await prisma.developers.findUnique({
      where: { user_id },
    });

    if (existingDeveloper) {
      return response.error(res, res.__('messages.developerAlreadyExists'), null);
    }

    // Create translations
    const descriptionTranslation = await prisma.langTranslations.create({
      data: { en_string: description_en, fr_string: description_fr },
    });

    const serviceAreaTranslation = await prisma.langTranslations.create({
      data: { en_string: service_area_en, fr_string: service_area_fr },
    });

    // Prepare developer data
    const developerData = {
      user_id: existingUser.id,
      credit,
      description: descriptionTranslation.id,
      facebookLink: facebook_link,
      twitterLink: twitter_link,
      youtubeLink: youtube_link,
      pinterestLink: pinterest_link,
      linkedinLink: linkedin_link,
      instagramLink: instagram_link,
      whatsappPhone,
      serviceArea: serviceAreaTranslation.id,
      taxNumber: tax_number,
      country_code,
      licenseNumber: license_number,
      created_by: createdUserId, // Use createdUserId instead of userId
    };

    // Create developer profile
    const developer = await prisma.developers.create({
      data: developerData,
    });

    // Fetch translation data
    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });

    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    // Select translation based on locale
    const description =
      lang === 'fr'
        ? descriptionTranslationData.fr_string
        : descriptionTranslationData.en_string;
    const service_area =
      lang === 'fr'
        ? serviceAreaTranslationData.fr_string
        : serviceAreaTranslationData.en_string;

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
    };

    // Convert BigInt fields to string for response
    const safeDeveloper = JSON.parse(
      JSON.stringify(responseData, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response.success(
      res,
      res.__('messages.developerCreatedSuccessfully'),
      { developer: safeDeveloper }
    );
  } catch (err) {
    console.error('Error creating developer:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack }
    );
  }
};





// Get all developers

export const getAllDevelopers = async (req, res) => {
  try {
    // Fetch all developer details
    const developers = await prisma.developers.findMany();

    // Check if no developers were found
    if (developers.length === 0) {
      return response.error(
        res,
        res.__('messages.developerNotFound'), // Message if no developers exist
        null,
        404
      );
    }

    // Convert BigInt fields to string for response (if applicable)
    const safeDevelopers = developers.map(developer =>
      JSON.parse(
        JSON.stringify(developer, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      )
    );

    return response.success(
      res,
      res.__('messages.developersRetrievedSuccessfully'),
      { developers: safeDevelopers }
    );
  } catch (err) {
    console.error('Error retrieving developers:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack } // Include error stack for debugging
    );
  }
};


export const getDeveloperById = async (req, res) => {
  try {
    const { developer_id } = req.body;

    if (!developer_id) {
      return response.error(
        res,
        res.__('messages.developerIdMissing'),
        null,
        400 // Bad Request
      );
    }

    const developer = await prisma.developers.findUnique({
      where: { id: developer_id },
    });


    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });
    
    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description_en:descriptionTranslationData.en_string,
      description_fr:descriptionTranslationData.fr_string,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area_en: serviceAreaTranslationData.en_string,
      service_area_fr: serviceAreaTranslationData.fr_string,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
    };


    if (!developer) {
      return response.error(
        res,
        res.__('messages.developerNotFound'),
        null,
        404
      );
    }

    const safeDeveloper = JSON.parse(
      JSON.stringify(developer, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response.success(
      res,
      res.__('messages.developerRetrievedSuccessfully'),
      { developer: responseData }
    );
  } catch (err) {
    console.error('Error retrieving developer:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack }
    );
  }
};



const transformBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};
// Update a developer
export const updateDeveloper = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Validate the UUID format
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    if (!isValidUUID) {
      return response.error(res, res.__('messages.invalidUUIDFormat'), null);
    }

    const {
      description_en,
      description_fr,
      service_area_en,
      service_area_fr,
      credit,
      facebook_link,
      twitter_link,
      youtube_link,
      pinterest_link,
      linkedin_link,
      instagram_link,
      whatsup_number,
      country_code,
      tax_number,
      license_number,
    } = req.body;

    // Check if the developer exists
    const existingDeveloper = await prisma.developers.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      return response.error(res, res.__('messages.developerNotFound'), null);
    }

    // Update developer details
    const developer = await prisma.developers.update({
      where: { id },
      data: {
        credit,
        facebookLink: facebook_link,
        twitterLink: twitter_link,
        youtubeLink: youtube_link,
        pinterestLink: pinterest_link,
        linkedinLink: linkedin_link,
        instagramLink: instagram_link,
        whatsappPhone: whatsup_number,
        country_code,
        taxNumber: tax_number,
        licenseNumber: license_number,
        updated_by: user_id,
        updated_at: new Date()
      },
    });

    // Update descriptions if provided
    if (description_en || description_fr) {
      const descriptionId = developer.description;
      await prisma.langTranslations.update({
        where: { id: descriptionId },
        data: {
          ...(description_en && { en_string: description_en }),
          ...(description_fr && { fr_string: description_fr }),
        },
      });
    }

    if (service_area_en || service_area_fr) {
      const serviceAreaId = developer.serviceArea;
      await prisma.langTranslations.update({
        where: { id: serviceAreaId },
        data: {
          ...(service_area_en && { en_string: service_area_en }),
          ...(service_area_fr && { fr_string: service_area_fr }),
        },
      });
    }

    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });
    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    const lang = res.getLocale();

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description: lang === 'fr' ? descriptionTranslationData?.fr_string : descriptionTranslationData?.en_string,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area: lang === 'fr' ? serviceAreaTranslationData?.fr_string : serviceAreaTranslationData?.en_string,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
    };

    const safeResponse = transformBigIntToString(responseData);

    return response.success(res, res.__('messages.developerUpdatedSuccessfully'), safeResponse);
  } catch (err) {
    console.error('Error updating developer:', err);
    return response.serverError(res, res.__('messages.internalServerError'), err.message);
  }
};





// Delete a developer
export const deleteDeveloper = async (req, res) => {
    const { id } = req.params; // Assuming the developer ID is passed in the request params

    try {
        // Step 1: Fetch the developer by ID
        const developer = await prisma.developers.findUnique({
            where: { id: id },  // Look up the developer by the ID
        });

        if (!developer) {
            // Developer not found
            return response.error(res, res.__('messages.developerNotFound'), null);
        }

        // Step 2: Delete the developer using the `user_id`
        const deletedDeveloper = await prisma.developers.delete({
            where: { user_id: developer.user_id },  // Delete using the developer's `user_id`
        });

        // Step 3: Delete the associated user from the `users` table
        const deletedUser = await prisma.users.delete({
            where: { id: developer.user_id },  // Assuming `user_id` maps to the `users` table
        });

        // Send a success response with the details of deleted developer and user
        return response.success(
            res,
            res.__('messages.developerAndUserDeletedSuccessfully')
        );
    } catch (err) {
        // Log the error for debugging
        console.error('Error deleting developer and user:', err);

        // Return a server error response
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};
