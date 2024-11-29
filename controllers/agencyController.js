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
    const { roles, user_name, full_name, email_address, user_login_type, image, address, mobile_number, password, user_type, credit, description,
        facebook_link, twitter_link, youtube_link, pinterest_link, linkedin_link, instagram_link, whatsup_number, service_area,
        tax_number, license_number, picture, cover } = req.body;

    // Extract user data from usertable
    const userData = {
        full_name: full_name,
        user_name: user_name,
        email_address: email_address,
        mobile_number: mobile_number,
        fcm_token: '',
        image: image,
        roles: {
            connect: {
                name: 'agency',
                status: true,
            },
        },
        password: await passwordGenerator.encrypted(password),
        user_login_type: "NONE"
    };

    try {
        const existingUser = await User.getUser(email_address, mobile_number);

        if (existingUser) {
            return response.error(res, res.__('messages.userAlreadyExists'), null);
        }

        const user = await User.createUser(userData);

        if (user) {
            return response.success(res, res.__('messages.agencyCreatedSuccessfully'), user);
        } else {
            return response.error(res, res.__('messages.userNotCreated'), null);
        }
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};

// Get all agencies
export const getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.findAll();
        return response.success(res, res.__('messages.agenciesRetrievedSuccessfully'), agencies);
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
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
        const agency = await Agency.findByPk(req.params.id);
        if (agency) {
            return response.success(res, res.__('messages.agencyRetrievedSuccessfully'), agency);
        } else {
            return response.error(res, res.__('messages.agencyNotFound'), null);
        }
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};

// Update an agency
export const updateAgency = async (req, res) => {
    try {
        const [updated] = await Agency.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedAgency = await Agency.findByPk(req.params.id);
            return response.success(res, res.__('messages.agencyUpdatedSuccessfully'), updatedAgency);
        } else {
            return response.error(res, res.__('messages.agencyNotFound'), null);
        }
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};

// Delete an agency
export const deleteAgency = async (req, res) => {
    try {
        const deleted = await Agency.destroy({ where: { id: req.params.id } });
        if (deleted) {
            return response.success(res, res.__('messages.agencyDeletedSuccessfully'), null);
        } else {
            return response.error(res, res.__('messages.agencyNotFound'), null);
        }
    } catch (err) {
        return response.serverError(res, res.__('messages.internalServerError'), err.message);
    }
};
