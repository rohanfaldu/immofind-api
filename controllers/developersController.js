import { PrismaClient } from '@prisma/client';
import User from '../models/userModel.js';
import response from "../components/utils/response.js";
import passwordGenerator from "../components/utils/passwordGenerator.js";
import crypto from 'crypto';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create a developer
export const createDeveloper = async (req, res) => {
    const {
        roles,
        user_name,
        full_name,
        email_address,
        user_login_type,
        image,
        address,
        mobile_number,
        password,
        credits,
        description,
        facebook_link,
        twitter_link,
        youtube_link,
        pinterest_link,
        linkedin_link,
        instagram_link,
        whatsappPhone,
        service_area,
        tax_number,
        license_number,
    } = req.body;

    // User data for creation
    const userData = {
        full_name,
        user_name,
        email_address,
        mobile_number,
        fcm_token: '',
        image,
        roles: {
            connect: {
                name: 'developer', // Ensure this role exists in your DB
                status: true,
            },
        },
        password: await passwordGenerator.encrypted(password),
        user_login_type: "NONE"
    };

    try {
        // Check if the user already exists
       const existingUser = await User.getUser(email_address, mobile_number);

        if (existingUser) {
            return response.error(res, res.__('messages.userAlreadyExists'), null);
        }

        // Create a user
       const user = await User.createUser(userData);

        if (!user) {
            return response.error(res, res.__('messages.userNotCreated'), null);
        }

        // Developer data for creation
        const developerData = {
            user_id: user.id, // Use the ID from the created user
            name: full_name,
            email: email_address,
            phone: mobile_number,
            address,
            password: user.password,
            credits,
            description,
            facebookLink: facebook_link,
            twitterLink: twitter_link,
            youtubeLink: youtube_link,
            pinterestLink: pinterest_link,
            linkedinLink: linkedin_link,
            instagramLink: instagram_link,
            whatsappPhone,
            serviceArea: service_area,
            taxNumber: tax_number,
            licenseNumber: license_number,
            created_by: user.id,
        };

        const developer = await prisma.developers.create({
            data: developerData,
        });

         // Convert BigInt fields to string for response
        const safeUser = JSON.parse(
            JSON.stringify(user, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        const safeDeveloper = JSON.parse(
            JSON.stringify(developer, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        return response.success(res, res.__('messages.developerCreatedSuccessfully'), { user: safeUser, developer: safeDeveloper });
    } catch (err) {
        console.error('Error creating developer:', err);
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};

// Get all developers
export const getAllDevelopers = async (req, res) => {
    try {
        const developers = await prisma.developers.findMany();
         const safeDeveloper = JSON.parse(
            JSON.stringify(developers, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        return response.success(res, res.__('messages.developersRetrievedSuccessfully'), {developers: safeDeveloper});
    } catch (err) {
        console.error('Error retrieving developers:', err);
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};



// Update a developer
export const updateDeveloper = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the UUID format
        const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

        if (!isValidUUID) {
                return response.error(res, res.__('messages.invalidUUIDFormat'), null);
        }

        // Update developer details
        const updatedDeveloper = await prisma.developers.update({
            where: { id: id }, // UUID id should match the format
            data: req.body,
        });

        if (!updatedDeveloper) {
            return response.error(res, res.__('messages.developerNotFound'), null);
        }

        return response.success(res, res.__('messages.developerUpdatedSuccessfully'), updatedDeveloper);
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
