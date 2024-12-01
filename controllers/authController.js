import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { PrismaClient } from '@prisma/client';
//import Agency from '../models/agencyModel.js';
import UserModel from '../models/userModel.js'; // Assuming you have a User model defined
//import { passport } from 'passport';
import jwtGenerator from "../components/utils/jwtGenerator.js";
import bcrypt from "bcrypt";
import passwordGenerator from "../components/utils/passwordGenerator.js";
import sendmail from "../components/utils/sendmail.js";
import crypto from 'crypto';
import response from "../components/utils/response.js";
import OTPGenerat from "../components/utils/OTPGenerat.js";
import commonFunction from "../components/utils/commonFunction.js";
import dotenv from 'dotenv';
dotenv.config();
// Initialize Prisma Client
const prisma = new PrismaClient();

export const createUser = async (req, res) => {
    try {
        const { user_id, user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, phone_number, password } = req.body;
        
        if (!user_name ||!full_name || !type ) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        if(email_address === '' && phone_number === '') {
            return await response.error(res, res.__('messages.fieldError'));
        }

        const checkPhonember = await commonFunction.checkPhonember(phone_number);
        if(!checkPhonember){
            return await response.error(res,res.__('messages.validPhoneNumber'));
        }

        const checkUser = await UserModel.getUser(email_address,phone_number);

        let user_inforation = false;
        if(checkUser){
            if(!user_id){
                return await response.error(res,res.__('messages.fieldError'));
            }
            user_inforation = true;
            if( checkUser.id !== user_id){
                return await response.error(res,res.__('messages.userCheckEmail'));
            }

            const data = {  
                full_name: full_name,
                user_name: user_name,
                fcm_token: fcm_token,
                image: image_url,
                password: (password)? await passwordGenerator.encrypted(password):'',
                email_address: email_address,
                mobile_number: BigInt(phone_number),
            };
            const where = {
                id: user_id
            };
            const userUpdate = await UserModel.updateUser(where, data);
            const CreateToken = await jwtGenerator.generateToken(userUpdate.id, userUpdate.email_address);
            const responseData = {
                user_inforation,
                userProfile: userUpdate,
                token: CreateToken
            };
            
            const roleName = await commonFunction.getRole(userUpdate.roles.name);
            return await response.success(res, res.__(`messages.${roleName}CreatedSuccessfully`), responseData);
        } else{
            const users = await UserModel.createUser({
                full_name: full_name,
                user_name: user_name,
                email_address: email_address,
                fcm_token: fcm_token,
                image: image_url,
                roles: {
                    connect: {
                      name: type,
                      status: true, 
                    },
                },
                user_login_type: user_login_type,
                mobile_number: BigInt(phone_number),
                password: (password)? await passwordGenerator.encrypted(password):'',
            });
            const CreateToken = await jwtGenerator.generateToken(users.id, users.email_address);
            const responseData = {
                user_inforation,
                userProfile: users,
                token: CreateToken
            };
            const roleName = await commonFunction.getRole(users.roles.name);
            return await response.success(res, res.__(`messages.${roleName}CreatedSuccessfully`), responseData);
        }
        // Respond with success message and user information
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }
};

export const updateUser = async (req, res) => {
    try {
        const { user_id, user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, phone_number, password, is_deleted } = req.body;
        
        if (!user_name ||!full_name || !type || !user_id ) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        if(email_address === '' && phone_number === '') {
            return await response.error(res, res.__('messages.fieldError'));
        }

        const checkPhonember = await commonFunction.checkPhonember(phone_number);
        if(!checkPhonember){
            return await response.error(res,res.__('messages.validPhoneNumber'));
        }

        const data = {  
            full_name: full_name,
            user_name: user_name,
            fcm_token: fcm_token,
            image: image_url,
            password: (password)? await passwordGenerator.encrypted(password):'',
            email_address: email_address,
            mobile_number: BigInt(phone_number),
            is_deleted: is_deleted
        };
        const where = {
            id: user_id
        };
        const userUpdate = await UserModel.updateUser(where, data);
        const CreateToken = await jwtGenerator.generateToken(userUpdate.id, userUpdate.email_address);
        const responseData = {
            user_inforation: true,
            userProfile: userUpdate,
            token: CreateToken
        };
        const roleName = await commonFunction.getRole(userUpdate.roles.name);
        return (is_deleted)? await response.success(res, res.__(`messages.${roleName}DeleteSuccessfully`), responseData)
        : await response.success(res, res.__(`messages.${roleName}CreatedSuccessfully`), responseData);
        // Respond with success message and user information
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }
};

export const deleteUser = async (req, res) => {
    const { id, type } = req.body;

    if(!id || !type) {
        return await response.error(res, res.__('messages.fieldError'));
    }

     try {
        const userData = await UserModel.deleteUser(id);
        if (userData) {
            const roleName = await commonFunction.getRole(userData.roles.name);
            return await response.success(res, res.__(`messages.${roleName}DeletedSuccessfully`), null);
        } else {
            return await response.error(res, res.__(`messages.${type}NotFound`));
        }
    } catch (error) {
         return await response.serverError(res, res.__('messages.internalServerError'));
    }
}

export const createNormalUser = async (req, res) => {
    try {
        const { user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, mobile_number, password } = req.body;
        
        if (!user_name ||!full_name || !email_address || !type || !password) {
            return res.status(400).json({ error: "Please check the Fields." });
        }

        const checkUser = await UserModel.getUser(email_address,'');
        let users;
        let message;
        if(checkUser){
            return res.status(200).json({
                status: false,
                message: 'User already exist. Please login',
                data: null,
            });
        } else{
            users = await UserModel.createUser({
                full_name: full_name,
                user_name: user_name,
                email_address: email_address,
                fcm_token: fcm_token,
                image: image_url,
                roles: {
                    connect: {
                      name: type,
                      status: true, 
                    },
                },
                user_login_type: user_login_type,
                mobile_number: mobile_number,
                password: await passwordGenerator.encrypted(password),
            });
        }
        // Create or update the user in the database
        if(users){
            const CreateToken = await jwtGenerator.generateToken(users.id, users.email_address);
            return res.status(200).json({
                status: true,
                message: 'User created successfully',
                data: users,
            });
        }
        // Respond with success message and user information
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: 'Internal server error',
            data: error.message,
        });
    }
};

export const getallUser = async (req, res) => {
    const { type } = req.body;
    const userData = await UserModel.getAllUserd(type);
    console.log(userData.length);
        const userList = {
            count : userData.length,
            user_data : userData
        }
        if (userData) {
            return await response.success(res, res.__('messages.listFetchedSuccessfully'), userList);
        } else {
            return await response.error(res, res.__('messages.listingNotFound'));
            }
}
export const getUser = async (req, res) => {
    
    const { email_address,password } = req.body;
    
    if (!email_address || !password) {
        return await response.error(res, res.__('messages.fieldError'));
    }
    const user = await UserModel.getUser(email_address,'');

    if (user && user.password) {
        try {
            const isMatch = await passwordGenerator.comparePassword(password, user.password);
            if (isMatch) {
                const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
                const responseData = {
                    userProfile: user,
                    token: CreateToken
                };
                return await response.success(res, res.__('messages.loginSuccessfully'), responseData);
            } else {
                return await response.error(res, res.__('messages.passwordDostMatch'));
                }
        } catch (error) {
            return await response.error(res, res.__('messages.passwordDostMatch'));
        }
    } else {
        return await response.error(res, res.__('messages.userNotFound'));
    }
}

export const checkUserExists = async (req, res) => {
    
    const { email_address, phone_number } = req.body;

    if (!email_address || !phone_number) {
        return await response.error(res, res.__('messages.fieldError'));
    }
    const user = await UserModel.getUser(email_address,phone_number);
    
    if (user) {
        const roleName = await commonFunction.getRole(user.roles.name);
        return await response.success(res, res.__(`messages.${roleName}Exists`), null);
    } else {
        return await response.error(res, res.__('messages.userNotFound'));
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email_address, phone_number, code } = req.body;
        
        if(email_address === '' && phone_number === '') {
            return await response.error(res, res.__('messages.fieldError'));
        }

        if( email_address !== '' && phone_number === '') {
            
            const checkUser = await UserModel.getUser(email_address,'');
            let user_inforation = true;
            if(checkUser.mobile_number === 0) {
                user_inforation = false;
            }
            if ( !code) {
                return await response.error(res, res.__('messages.fieldError'));
            }

            const user = await UserModel.getUserWithEmailOTP(email_address, code);
            if (user) {
                const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
                const responseData = {
                    user_inforation,
                    userProfile: user,
                    token: CreateToken
                };
                return await response.success(res, res.__('messages.loginSuccessfully'), responseData);
            } else {
                return await response.error(res, res.__('messages.userCheckEmailCode'));
            }
        }
        else if( email_address === '' && phone_number !== '') {
            const checkPhonember = await commonFunction.checkPhonember(phone_number);
            if(!checkPhonember){
                return response.error(res, "Please enter a valid phone number.", null);
            }
            
            const checkUser = await UserModel.getUser('',phone_number);
            let user_inforation = true;
            if(checkUser.email_address === null) {
                user_inforation = false;
            }
            const user = await UserModel.getUserWithPhoneOTP(phone_number, code);
            if (user) {
                const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
                const responseData = {
                    user_inforation,
                    userProfile: user,
                    token: CreateToken
                };
                return await response.success(res, res.__('messages.loginSuccessfully'), responseData);
            } else {
                return await response.error(res, res.__('messages.passwordDostMatch'));
            }
        } else {
            return await response.error(res, res.__('messages.userNotFound'));
        }
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    } 
}

export const sendOtp = async (req, res) => {
    try {
        const { email_address, phone_number, type, user_login_type } = req.body;
        
        if(email_address !== ''){
        
            const code = crypto.randomInt(100000, 999999); // Generate a random 6-digit code
            const to = email_address;
            const subject = "Verify Account";
            const text =`
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007BFF;">Account Verification</h2>
                    <p>Dear User,</p>
                    <p>Your verification code is: <strong>${code}</strong>.</p>
                    <p>Please enter this code to verify your account.</p>
                    <p>If you didn’t request this, please ignore this message or contact our support team immediately.</p>
                    <br>
                    <p>Thank you,</p>
                    <p>The Immofind Team</p>
                </div>`;
   
            try {
                // Send email and wait for completion
                const emailData = await sendmail.gmail(to, subject, text);

                if (!emailData) {
                    return response.error(res, res.__('messages.emailSendFailed'), null);
                }

                // Define data and where conditions
                const data = { email_password_code: code };
                const where = { email_address: email_address };

                // Check if the user already exists
                const checkEmail = await UserModel.getUser(email_address, '');

                // If user exists, update their email password code
                if (checkEmail) {
                    const userUpdate = await UserModel.updateUser(where, data);

                    return userUpdate
                    ? response.success(res, res.__('messages.userSendEmail'), {code :parseInt(code, 10) })
                    : response.error(res, res.__('messages.userDataNotUpdated'), null);
                }

                // If user does not exist, create a new user with email and password code
                const userDetail = {
                    email_address,
                    email_password_code: code,
                    roles: {
                        connect: {
                            name: type,
                            status: true, 
                        },
                    },
                    user_login_type: user_login_type
                };

                const userCreate = await UserModel.createUser(userDetail);

                return userCreate
                    ? response.success(res, res.__('messages.userSendEmail'), {code :parseInt(code, 10) })
                    : response.error(res, res.__('messages.userDataNotUpdated'), null);

            } catch (error) {
                // Catch and handle any error during email sending or user operations
                return response.error(res, res.__('messages.emailSendFailed'), null);
            }

        } else if ( phone_number !== '') {

            const checkPhonember = await commonFunction.checkPhonember(phone_number);
            if(!checkPhonember){
                return response.error(res, "Please enter a valid phone number.", null);
            }
            const checkMobileNumber = await UserModel.getUser('', phone_number);
            const sendOTP = await OTPGenerat.send(process.env.COUNTRY_CODE+phone_number);
            if (sendOTP) {
                const data = {
                    phone_password_code: parseInt(sendOTP.otp, 10),
                };
                
                if (checkMobileNumber) {
                    // Update the existing user if checkMobileNumber is found
                    const userUpdate = await UserModel.updateUser({ id: checkMobileNumber.id }, data);
                
                    return userUpdate
                    ? response.success(res, res.__('messages.userSendMobile'), { code: parseInt(sendOTP.otp, 10) })
                    : response.error(res, res.__('messages.userDataNotUpdated'), null);
                } else {
                    // Create a new user if no existing user is found
                    const userDetail = {
                        roles: {
                            connect: {
                                name: "user",
                                status: true, 
                            },
                        },
                        user_login_type: "NONE",
                        mobile_number: BigInt(phone_number),
                    ...data, // Reuse the data object to avoid redundancy
                    };
                
                    const userUpdate = await UserModel.createUser(userDetail);
                
                    return userUpdate
                    ? response.success(res, res.__('messages.userSendMobile'), { code: parseInt(sendOTP.otp, 10) })
                    : response.error(res, res.__('messages.userDataNotUpdated'), null);
                }              
            }
        
        }   
    }
    catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }
}

export const updatePassword = async (req, res) => {
    try {
        const { email_address, code, password } = req.body;
        
        if (!password ||!code || !email_address) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        const checkEmail = await UserModel.getUser(req.body.email_address, '');
        if(checkEmail){
            const data = {
                password: await passwordGenerator.encrypted(password),
            }
            const where = {
                email_address: email_address,
                reset_password_token: code
            }
            const userUpdate = await UserModel.updateUser(where, data);
            if(userUpdate){
                return await response.success(res, res.__('messages.passwordUpdateSuccessfully'), null);
            }else {
                return await response.error(res, res.__('messages.userDataNotUpdated'));
            }
        }else{
            return await response.error(res, res.__('messages.userNotFound'));
        }
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }
}