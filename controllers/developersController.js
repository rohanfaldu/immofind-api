import { PrismaClient } from '@prisma/client';
import User from '../models/userModel.js';
import response from "../components/utils/response.js";
import passwordGenerator from "../components/utils/passwordGenerator.js";
import crypto from 'crypto';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create a developer
export const createDeveloper = async (req, res) => {
  const userId = req.user.id;
  const lang = req.getLocale(); // Assuming you have a method to get the user's locale

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
    // Check if the user exists
    const existingUser = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
      include: {
        roles: true, // Include role information
      },
    });

    if (!existingUser) {
      return response.error(res, res.__('messages.userNotFound'), null);
    }

    // Check if the user's role is "developer"
    if (existingUser.roles.name !== "developer") {
      return response.error(
        res,
        res.__('messages.userNotAuthorizedToCreateDeveloper'),
        null
      );
    }

    const descriptionTranslation = await prisma.langTranslations.create({
      data: { en_string: description_en, fr_string: description_fr },
    });

    const serviceAreaTranslation = await prisma.langTranslations.create({
      data: { en_string: service_area_en, fr_string: service_area_fr },
    });

    // Check if a developer profile already exists for this user
    const existingDeveloper = await prisma.developers.findUnique({
      where: { user_id },
    });

    if (existingDeveloper) {
      return response.error(
        res,
        res.__('messages.developerAlreadyExists'),
        null
      );
    }

    // Prepare developer data for creation
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
      country_code:country_code,
      licenseNumber: license_number,
      created_by: userId,
    };

    // Create the developer profile
    const developer = await prisma.developers.create({
      data: developerData,
    });

    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });

    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    // Determine which language to return
    const description = lang === 'fr' ? descriptionTranslationData.fr_string : descriptionTranslationData.en_string;
    const service_area = lang === 'fr' ? serviceAreaTranslationData.fr_string : serviceAreaTranslationData.en_string;

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description: description,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area: service_area,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
    };

    // Convert BigInt fields to string for response (if applicable)
    const safeDeveloper = JSON.parse(
      JSON.stringify(responseData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // Success response
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
      err.message
    );
  }
};



// Get all developers

export const getAllDevelopers = async (req, res) => {
  const user_id = req.user.id; // Get the logged-in user's ID from the auth token
  console.log('user_id: ', user_id);

  try {
    // Fetch the developer details for the logged-in user
    const developer = await prisma.developers.findUnique({
      where: {
        user_id: user_id, // Filter by the authenticated user's ID
      },
    });

    if (!developer) {
      return response.error(
        res,
        res.__('messages.developerNotFound'), // Message if the developer doesn't exist
        null
      );
    }

    // Convert BigInt fields to string for response (if applicable)
    const safeDeveloper = JSON.parse(
      JSON.stringify(developer, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response.success(
      res,
      res.__('messages.developersRetrievedSuccessfully'),
      { developer: safeDeveloper }
    );
  } catch (err) {
    console.error('Error retrieving developer:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      err.message
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

    // Check if the developer exists
    const existingDeveloper = await prisma.developers.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      return response.error(res, res.__('messages.developerNotFound'), null);
    }

    // Update developer details
    const updatedDeveloper = await prisma.developers.update({
      where: { id },
      data: {
        ...req.body,            // Spread all fields from req.body
        updated_by: user_id,
        updated_at: new Date()    // Add 'updated_by' field
      },
    });

    const safeResponse = transformBigIntToString(updatedDeveloper);

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
