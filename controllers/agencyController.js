import { PrismaClient } from '@prisma/client';
import Agency from '../models/agencyModel.js';
import User from '../models/userModel.js'; // Assuming you have a User model defined
/*import { use } from 'passport';
import jwtGenerator from "../components/utils/jwtGenerator.js";
import bcrypt from "bcrypt";*/
import passwordGenerator from "../components/utils/passwordGenerator.js";
import sendmail from "../components/utils/sendmail.js";
import crypto from 'crypto';
import response from "../components/utils/response.js";

// Initialize Prisma Client
const prisma = new PrismaClient(); // Assuming response utility is in place

// Create an agency
export const createAgency = async (req, res) => {
  // Extract user_id directly from the authenticated user
  const user_id = req.user.id;

  if (!user_id) {
    return response.error(res, "User ID is missing", null); // Handle the case where the user_id is missing.
  }

  // Destructure agency data from the request body
  const {
    credit,
    description,
    facebook_link,
    twitter_link,
    youtube_link,
    pinterest_link,
    linkedin_link,
    instagram_link,
    whatsup_number,
    service_area,
    tax_number,
    license_number,
    picture,
    cover,
    agency_packages,
  } = req.body;

  try {
    // Fetch user details along with their role
    const existingUser = await prisma.users.findUnique({
      where: {
        id: user_id,  // Use the correct userId to fetch the user
      },
      include: {
        roles: true,  // Include the related role (note: it's 'roles', not 'role')
      },
    });

    // Ensure the user has a role and the role is 'agency'
    if (!existingUser || !existingUser.roles || existingUser.roles.name !== "agency") {
      return response.error(
        res,
        res.__('messages.userNotRightsTocreateAgency'),
        null
      );
    }

    // Check if an agency already exists for the given user_id
    const existingAgency = await prisma.agencies.findUnique({
      where: { user_id: user_id },
    });

    if (existingAgency) {
      return response.error(
        res,
        res.__('messages.agencyAlreadyExists'),
        null
      );
    }

    // Prepare agency data for the agency table
    const agencyData = {
      user_id: user_id, // Link to the newly created user
      credit,
      description,
      facebook_link,
      twitter_link,
      youtube_link,
      pinterest_link,
      linkedin_link,
      instagram_link,
      whatsup_number,
      service_area,
      tax_number,
      license_number,
      picture,
      cover,
      agency_packages,
    };

    // Save agency details to the agency table
    const newAgency = await prisma.agencies.create({
      data: agencyData,
    });

    if (newAgency) {
      return response.success(
        res,
        res.__('messages.agencyCreatedSuccessfully'),
        { agency: newAgency }
      );
    } else {
      return response.error(res, res.__('messages.agencyNotCreated'), null);
    }
  } catch (err) {
    console.error('Error creating agency:', err.message);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      err.message
    );
  }
};





// Get all agencies
export const getAllAgencies = async (req, res) => {
  try {
    // Fetch all agencies from the database using Prisma
    const agencies = await prisma.agencies.findMany();

    // Return success response with the agencies data
    return res.status(200).json({
      success: true,
      message: res.__('messages.agenciesRetrievedSuccessfully'),
      data: agencies,
    });
  } catch (err) {
    // Handle any errors that occur during the query
    console.error('Error fetching agencies:', err);
    return res.status(500).json({
      success: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};

// Send password reset email
export const sendMail = async (req, res) => {
    const checkEmail = await User.getUser(req.body.email_address, '');

    if (checkEmail) {
        const code = crypto.randomInt(100000, 999999);
        const to = req.body.email_address;
        const subject = "Password Reset Code";
        const text = `Your password reset code is: ${code}`;

        try {
            const emailData = await sendmail.gmail(to, subject, text); // Wait for email to send

            if (emailData) {
                const data = {
                    reset_password_token: code
                };
                const where = {
                    email_address: req.body.email_address
                };
                const userUpdate = await User.updateUser(where, data);

                if (userUpdate) {
                    return response.success(res, res.__('messages.passwordResetEmailSent'), null);
                } else {
                    return response.error(res, res.__('messages.userDataNotUpdated'), null);
                }
            }
        } catch (error) {
            return response.error(res, res.__('messages.emailSendFailed'), null);
        }
    } else {
        return response.error(res, res.__('messages.userNotFound'), null);
    }
};

// Get an agency by ID
export const getAgencyById = async (req, res) => {
  try {
    // Fetch the agency by its ID using Prisma
    const agency = await prisma.agencies.findUnique({
      where: {
        id: req.params.id, // Fetch by the agency ID from the request parameters
      },
    });

    if (agency) {
      // Return success response if agency is found
      return res.status(200).json({
        success: true,
        message: res.__('messages.agencyRetrievedSuccessfully'),
        data: agency,
      });
    } else {
      // Return error if agency is not found
      return res.status(404).json({
        success: false,
        message: res.__('messages.agencyNotFound'),
        data: null,
      });
    }
  } catch (err) {
    // Handle any errors that occur during the query
    console.error('Error fetching agency:', err);
    return res.status(500).json({
      success: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};

// Update an agency
export const updateAgency = async (req, res) => {
  try {
    // Fetch the agency by ID
    const agency = await prisma.agencies.findUnique({
      where: {
        id: req.params.id, // Use ID from request params to find the agency
      },
    });

    if (agency) {
      // Update the agency with the data from the request body
      const updatedAgency = await prisma.agencies.update({
        where: {
          id: req.params.id,
        },
        data: req.body, // The new data for the agency
      });

      return res.status(200).json({
        success: true,
        message: res.__('messages.agencyUpdatedSuccessfully'),
        data: updatedAgency,
      });
    } else {
      // If no agency is found, return an error response
      return res.status(404).json({
        success: false,
        message: res.__('messages.agencyNotFound'),
        data: null,
      });
    }
  } catch (err) {
    // Handle any errors during the update process
    console.error('Error updating agency:', err);
    return res.status(500).json({
      success: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};

// Delete an agency
export const deleteAgency = async (req, res) => {
    try {
        // Use Prisma's delete method to remove the agency by its ID
        const deletedAgency = await prisma.agency.delete({
            where: {
                id: req.params.id
            }
        });

        // Check if agency was deleted successfully
        if (deletedAgency) {
            return response.success(res, res.__('messages.agencyDeletedSuccessfully'), null);
        } else {
            return response.error(res, res.__('messages.agencyNotFound'), null);
        }
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};
