const passport = require('passport');
const UserModel = require('../models/userModel');
const jwtGenerator = require("../components/utils/jwtGenerator");
const passwordGenerator = require("../components/utils/passwordGenerator");
const response = require("../components/utils/response");
exports.createUser = async (req, res) => {
    try {
        const { user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, mobile_number, password } = req.body;
        
        if (!user_name ||!full_name || !email_address || !type) {
            return res.status(400).json({ error: "Please check the Fields." });
        }

        const checkUser = await UserModel.getUser(email_address,email_address);
        let users;
        let message;
        if(checkUser){
            users =  checkUser;
            message = 'User already exist';
        } else{
            message = 'User created successfully';
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
                message: message,
                data: {
                    userProfile: users,
                    token: CreateToken
                },
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

exports.createNormalUser = async (req, res) => {
    try {
        const { user_name, full_name, email_address, user_login_type, fcm_token, image_url, type, mobile_number, password } = req.body;
        
        if (!user_name ||!full_name || !email_address || !type || !password) {
            return res.status(400).json({ error: "Please check the Fields." });
        }

        const checkUser = await UserModel.getUser(email_address,email_address);
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

exports.getUser = async (req, res) => {
    
    const { email_address,password } = req.body;
    
    if (!email_address || !password) {
        return await response.error(res, res.__('messages.fieldError'));
    }
    const user = await UserModel.getUser(email_address,email_address);
    
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

exports.checkUserExists = async (req, res) => {
    
    const { email_address } = req.body;
    
    if (!email_address) {
        return await response.error(res, res.__('messages.fieldError'));
    }
    const user = await UserModel.getUser(email_address,email_address);
    
    if (user) {
        return await response.success(res, res.__('messages.userExists'), null);
    } else {
        return await response.error(res, res.__('messages.userNotFound'));
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { email_address, code, password } = req.body;
        
        if (!password ||!code || !email_address) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        const checkEmail = await UserModel.getUser(req.body.email_address, req.body.email_address);
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