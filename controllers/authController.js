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
    //try {
        const { social_id, user_id, user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, phone_number, password, device_type,country_code } = req.body;
        
        if (!user_name ||!full_name || !type || !device_type ) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        
        if(user_login_type === 'NONE'){
            if(email_address === '' ) {
                return await response.error(res, 'Please enter the email address');
            }
            // if(phone_number) {
            // const checkPhonember = await commonFunction.checkPhonember(phone_number);
            // if(!checkPhonember){
            //     return await response.error(res,'Please enter the phone number');
            // }
        } else{
            if(email_address === '') {
                return await response.error(res, 'Please check the email address was empty');
            }
        }
        
        const checkUser = await UserModel.getUser(email_address);

        let user_information = false;
        if(checkUser){
            if(!user_id){
                return await response.error(res,'Please enter the User Id');
            }
            user_information = true;
            if( checkUser.id !== user_id){
                return await response.error(res,res.__('messages.userCheckEmail'));
            }

            const data = {  
                full_name: full_name? full_name: null,
                user_name: user_name? user_name: null,
                fcm_token: fcm_token? fcm_token: null,
                image: image_url? image_url: null,
                social_id: social_id? social_id: null,
                password: (password)? await passwordGenerator.encrypted(password):null,
                email_address: email_address,
                mobile_number: (phone_number)? BigInt(phone_number):null,
                country_code: country_code? country_code: null
            };
            const where = {
                id: user_id
            };
            const userUpdate = await UserModel.updateUser(where, data);
            const CreateToken = await jwtGenerator.generateToken(userUpdate.id, userUpdate.email_address);
            const responseData = {
                user_information,
                userProfile: userUpdate,
                token: CreateToken
            };
            
            const roleName = await commonFunction.getRole(userUpdate.roles.name);
            return await response.success(res, res.__(`messages.${roleName}CreatedSuccessfully`), responseData);
        } else{

            if((user_login_type === 'NONE') && (!password)) {
                return await response.error(res, res.__('messages.fieldError'));
            }
            const users = await UserModel.createUser({
                full_name: full_name? full_name: null,
                user_name: user_name? user_name: null,
                fcm_token: fcm_token? fcm_token: null,
                image: image_url? image_url: null,
                social_id: social_id? social_id: null,
                email_address: email_address,
                roles: {
                    connect: {
                      name: type,
                      status: true, 
                    },
                },
                user_login_type: user_login_type,
                mobile_number: (phone_number)? BigInt(phone_number):null,
                password: (password)? await passwordGenerator.encrypted(password):null,
                country_code: country_code? country_code: null
            });
            const CreateToken = await jwtGenerator.generateToken(users.id, users.email_address);
            const responseData = {
                user_information,
                userProfile: users,
                token: CreateToken
            };
            const roleName = await commonFunction.getRole(users.roles.name);
            return await response.success(res, res.__(`messages.${roleName}CreatedSuccessfully`), responseData);
        }
        // Respond with success message and user information
    // } catch (error) {
    //     return await response.serverError(res, res.__('messages.internalServerError'));
    // }
};


export const updateUser = async (req, res) => {
    try {
        const { social_id, user_id, user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, phone_number, password, is_deleted } = req.body;
        
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
            full_name: full_name? full_name: null,
            user_name: user_name? user_name: null,
            fcm_token: fcm_token? fcm_token: null,
            image: image_url? image_url: null,
            social_id: social_id? social_id: null,
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
            user_information: true,
            userProfile: userUpdate,
            token: CreateToken
        };
        const roleName = await commonFunction.getRole(userUpdate.roles.name);
        return (is_deleted)? await response.success(res, res.__(`messages.${roleName}DeleteSuccessfully`), responseData)
        : await response.success(res, res.__(`messages.${roleName}UpdatedSuccessfully`), responseData);
        // Respond with success message and user information
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }
};


export const updateAgnecyUserDeveloper = async (req, res) => {
    try {
        const { user_id, user_name, full_name, email_address, image_url, phone_number, country_code } = req.body;

        if (!user_name || !full_name || !user_id) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        if (email_address === '' && phone_number === '') {
            return await response.error(res, res.__('messages.fieldError'));
        }

        const checkPhonember = await commonFunction.checkPhonember(phone_number);
        if (!checkPhonember) {
            return await response.error(res, res.__('messages.validPhoneNumber'));
        }

        // Check for existing user by email, excluding the current user
        const existingUserByEmail = await prisma.users.findFirst({
            where: {
                email_address,
                NOT: { id: user_id } // Exclude the current user by ID
            }
        });

        if (existingUserByEmail) {
            return await response.error(res, res.__('messages.emailAlreadyExists'));
        }

        // Check for unique phone number across all users except the current user
        const existingUserByPhone = await prisma.users.findFirst({
            where: {
                mobile_number: BigInt(phone_number),
                NOT: { id: user_id } // Exclude the current user by ID
            }
        });

        if (existingUserByPhone) {
            return await response.error(res, res.__('messages.phoneNumberAlreadyExists'));
        }

        const data = {
            full_name: full_name ? full_name : null,
            user_name: user_name ? user_name : null,
            image: image_url ? image_url : null,
            email_address: email_address,
            mobile_number: BigInt(phone_number),
            country_code: country_code ? country_code : null,
        };

        const where = {
            id: user_id,
        };

        const userUpdate = await UserModel.updateUser(where, data);
        
        if (!userUpdate) {
            return await response.error(res, res.__('messages.userUpdateFailed'));
        }

        const CreateToken = await jwtGenerator.generateToken(userUpdate.id, userUpdate.email_address);

        const responseData = {
            user_information: true,
            userProfile: userUpdate,
            token: CreateToken,
        };

        const roleName = await commonFunction.getRole(userUpdate.roles.name);

        return await response.success(res, res.__(`messages.${roleName}UpdatedSuccessfully`), responseData);
        
    } catch (error) {
        console.error('Error updating agency user:', error);
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
            //const roleName = await commonFunction.getRole(userData.roles.name);
            return await response.success(res, 'Deleted Successfully', null);
        } else {
            return await response.error(res, res.__(`messages.${type}NotFound`));
        }
    } catch (error) {
         return await response.error(res, 'Please check that user id is already used on another table');
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
    const { type, startDate, endDate } = req.body;
    const userData = await UserModel.getAllUserd(type, startDate, endDate);
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

export const getagency = async (req, res) => {
    const { type } = req.body;
    const userData = await UserModel.getagencyUsered();
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

export const getDeveloper = async (req, res) => {
    const { type } = req.body;
    const userData = await UserModel.getdeveloperUsered();
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
    
    const { email_address, phone_number, social_id } = req.body;

    if (email_address === "" && social_id === "") {
        return await response.error(res, 'Please enter email address or Social id');
    }

    let user;
    if(social_id) {
        if ( social_id === "") {
            return await response.error(res, 'Please enter social id');
        }
        user = await UserModel.getSocialUser(social_id);
    } else {
        if ( email_address === "") {
            return await response.error(res, 'Please enter email address');
        }
        user = await UserModel.getUser(email_address,phone_number);
    }
    if (user) {
        const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
        const checkUser = await UserModel.getUser(user.email_address,'');
        let user_information = true;
        if(checkUser.mobile_number === 0) {
            user_information = false;
        }
        const responseData = {
            user_information,
            userProfile: user,
            token: CreateToken
        };
        const roleName = await commonFunction.getRole(user.roles.name);
        return await response.success(res, res.__(`messages.${roleName}Exists`), responseData);
    } else {
        return await response.error(res, res.__('messages.userNotFound'));
    }
    
    
}

const createDeviceToken = async (values) => {
  try {
    console.log("Creating device token with values:", values);
    await prisma.deviceToken.create({
      data: {
        ...values,
      },
    });
  } catch (error) {
    console.error("Error creating device token:", error);
    throw new Error("Unable to create device token.");
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email_address, code, device_type, device_id, fcm_token } = req.body;

    if (!email_address || !code || !device_type || !device_id || !fcm_token) {
      return response.error(res, res.__("messages.fieldError"));
    }

    const checkUser = await UserModel.getUser(email_address, "");
    if (!checkUser) {
      return response.error(res, res.__("messages.userNotFound"));
    }

    if (checkUser.email_password_code !== parseInt(code, 10)) {
      return response.error(res, res.__("messages.userCheckEmailCode"));
    }

    const deviceToken = await prisma.deviceToken.findFirst({
      where: {
        device_id,
        user_id: checkUser.id,
      },
    });

    console.log("Device Token:", deviceToken);

    if (deviceToken) {
        await prisma.deviceToken.update({
          where: { id: deviceToken.id },
          data: { fcm_token, device_type },
        });
      } else {
        // Delete any existing token for the user before creating a new one
        await prisma.deviceToken.deleteMany({
          where: { user_id: checkUser.id },
        });
      
        await createDeviceToken({
          device_type,
          fcm_token,
          device_id,
          user_id: checkUser.id,
        });
      }
      
      const dataCheck = await prisma.users.findUnique({
        where: {
          email_address: email_address,
        }
      })

      console.log("Data Check:", dataCheck.user_name);
      console.log("Data Check:", dataCheck);

    const token = await jwtGenerator.generateToken(checkUser.id, checkUser.email_address);

    const responseData = {
      user_information: dataCheck.user_name? true: false,
      userProfile: checkUser,
      token,
    };

    await UserModel.updateUser({ id: checkUser.id }, { email_password_code: null });

    return response.success(res, res.__("messages.loginSuccessfully"), responseData);
  } catch (error) {
    console.error("Error during login:", error);
    return response.serverError(res, res.__("messages.internalServerError"));
  }
};

  
  


export const loginWithPassword = async (req, res) => {
    try {
        const { email_address, phone_number, password, device_type, code } = req.body;
    
        // Validation checks
        if ((email_address === '' && phone_number === '') || !password || !device_type) {
            return await response.error(res, res.__('messages.fieldError'));
        }
    
        // Helper function to handle user login logic
        const handleUserLogin = async (user, isEmail) => {
            if ((user.roles.name === 'user') && (device_type === 'app')) {
                return await response.error(res, res.__('messages.checkDeviceTypeRole'));
            }
    
            let user_information = isEmail ? user.mobile_number !== 0 : user.email_address !== null;
            const OTPCheck = isEmail ? await UserModel.getUserWithEmailOTP(user.email_address, code) : await UserModel.getUserWithPhoneOTP(user.mobile_number, code);

            if (user && user.password) {
                try {
                    const isMatch = await passwordGenerator.comparePassword(password, user.password);

                    if (isMatch) {
                        const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
                        const responseData = {
                            user_information,
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
        };
    
        // Process based on email or phone number
        if (email_address !== '') {
            const user = await UserModel.getUser(email_address, '');
            if (user) {
                return await handleUserLogin(user, true);
            } else {
                return await response.error(res, res.__('messages.userNotFound'));
            }
        } else if (phone_number !== '') {
            const isValidPhone = await commonFunction.checkPhonember(phone_number);
            if (!isValidPhone) {
                return await response.error(res, "Please enter a valid phone number.", null);
            }
    
            const user = await UserModel.getUser('', phone_number);
            if (user) {
                return await handleUserLogin(user, false);
            } else {
                return await response.error(res, res.__('messages.userNotFound'));
            }
        }
    
        // Default fallback for missing email or phone number
        return await response.error(res, res.__('messages.fieldError'));
    } catch (error) {
        return await response.serverError(res, res.__('messages.internalServerError'));
    }    
}

    export const sendOtp = async (req, res) => {
        try {
        const { email_address, type, user_login_type, device_type } = req.body;
    
        // Validate device type
        if (!device_type) {
            return await response.error(res, res.__('messages.fieldError'));
        }
    
        const deviceType = await commonFunction.checkDeviceType(device_type);
        if (deviceType !== 'app') {
            return await response.error(res, res.__('messages.checkDeviceType'));
        }
    
        // Validate email address
        if (!email_address) {
            return await response.error(res, res.__('messages.fieldError'));
        }
    
        const checkEmail = await UserModel.getUser(email_address, '');
        if (checkEmail && checkEmail.roles.name !== 'user') {
            return await response.error(res, res.__('messages.checkDeviceTypeRole'));
        }
    
        // Generate a random 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999);
        const subject = "Verify Account";
        const text = `
            <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007BFF;">Account Verification</h2>
            <p>Dear User,</p>
            <p>Your verification code is: <strong>${verificationCode}</strong>.</p>
            <p>Please enter this code to verify your account.</p>
            <p>If you didn’t request this, please ignore this message or contact our support team immediately.</p>
            <br>
            <p>Thank you,</p>
            <p>The Immofind Team</p>
            </div>`;
    
        // Send email
        const emailData = await sendmail.gmail(email_address, subject, text);
        if (!emailData) {
            return response.error(res, res.__('messages.emailSendFailed'));
        }
    
        const data = { email_password_code: verificationCode };
        const userDetails = checkEmail
            ? { ...checkEmail, ...data }
            : { email_address, email_password_code: verificationCode, roles: { connect: { name: type, status: true } }, user_login_type };
    
        // Handle user creation or update
        const userOperation = userDetails.id
            ? await UserModel.updateUser({ id: userDetails.id }, { email_password_code: userDetails.email_password_code })
            : await UserModel.createUser(userDetails);
    
        if (!userOperation) {
            return response.error(res, res.__('messages.userDataNotUpdated'));
        }
    
        return response.success(res, res.__('messages.userSendEmail'), { code: verificationCode });
        } catch (error) {
        console.error(error); // Log the error for debugging
        return await response.serverError(res, res.__('messages.internalServerError'));
        }
    };
  
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


export const updatePasswordWithOutOTP = async (req, res) => {
    try {
        const { password, old_password } = req.body;
        
        if (!password || !old_password) {
            return response.error(res, res.__('messages.fieldError'));
        }

        const userId = req.user?.email_address;
        console.log('userId: ', req.user);

        // Ensure userId is valid
        if (!userId) {
            return response.error(res, res.__('messages.userNotFound'));
        }

        const checkUser = await UserModel.getUser(userId, '');

        if (!checkUser) {
            return response.error(res, res.__('messages.userNotFound'));
        }

        const isMatch = await passwordGenerator.comparePassword(old_password, checkUser.password);

        if(isMatch){
            const hashedPassword = await passwordGenerator.encrypted(password);

            const data = { password: hashedPassword };
            const where = { email_address: userId };
    
            const userUpdate = await UserModel.updateUser(where, data);
            console.log('userUpdate: ', userUpdate);
            return response.success(res, res.__('messages.passwordUpdateSuccessfully'), null);
        } else{
            return response.serverError(res, res.__('messages.oldPasswordWrong'), null);
        }
        
    } catch (error) {
        console.error("Error updating password:", error);
        return response.serverError(res, res.__('messages.internalServerError'));
    }
};
