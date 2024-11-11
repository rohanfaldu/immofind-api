const passport = require('passport');
const UserModel = require('../models/userModel');
const jwtGenerator = require("../utils/jwtGenerator");
const passwordGenerator = require("../utils/passwordGenerator");

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

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
exports.googleAuthCallback = async (req, res) => {
    try {
        const { accessToken, profile } = req.user;

        // Extract necessary user information
        const googleId = profile.id;
        const fullName = profile.displayName;
        const email = profile.emails ? profile.emails[0].value : null; // Extract email if available
        const imageUrl = profile.photos ? profile.photos[0].value : null; // Extract image URL if available

        // Ensure required fields are present
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Create or update the user in the database
        const user = await UserModel.createOrUpdateUser({
            user_login_type: "GOOGLE",
            full_name: fullName,
            user_name: fullName,
            email_address: email,
            fcm_token: accessToken,
            image: imageUrl,
            roles: {
                connect: {
                  name: 'user',
                  status: true, 
                },
            },
            is_deleted: false, 
        });
        if(user){
            const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
            res.json({
                message: 'Google login successful',
                userProfile: user, 
                token: CreateToken
            });
        }
        // Respond with success message and user information
    } catch (error) {
        console.error('Error during Google login:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.facebookAuth = passport.authenticate('facebook');
exports.facebookAuthCallback = async (req, res) => {  // Added async here
    try {
        console.log('Login done for user:', req.user); // Logging the user details

        // Get the profile and access token from the request
        const { accessToken, profile } = req.user;

        // Extract necessary user information
        const fullName = profile.displayName;
        const email = profile.emails ? profile.emails[0].value : null; // Extract email if available
        const imageUrl = profile.photos ? profile.photos[0].value : null; // Extract image URL if available

        // Ensure required fields are present
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Create or update the user in the database
        const user = await UserModel.createOrUpdateUser({
            full_name: fullName,
            user_name: fullName,
            mobile_number: '1234567890', // Placeholder mobile number
            email_address: 'test@gmail.com',
            image: imageUrl,
            roles: {
                connect: {
                  name: 'user',  // Use the role ID found earlier
                  status: true,  // Assuming the user is active
                },
            },
            is_deleted: false,
        });

        // Respond with success message and user information
        res.json({
            message: 'Login successful',
            accessToken: accessToken, // The access token from Facebook
            userProfile: user,        // User profile from the database
        });
    } catch (error) {
        console.error('Error during Facebook login:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getUser = async (req, res) => {
    
    const { email_address,password } = req.body;
    
    if (!email_address || !password) {
        return res.status(400).json({
            status: false,
            message: 'Please check the Fields.',
            data: null,
        });
    }
    const user = await UserModel.getUser(email_address,email_address);
    
    if (user && user.password) {
        
        try {
            const isMatch = await passwordGenerator.comparePassword(password, user.password);
            if (isMatch) {
                const CreateToken = await jwtGenerator.generateToken(user.id, user.email_address);
                
                return res.status(200).json({
                    status: true,
                    message: 'Login successful',
                    data: {
                        userProfile: user,
                        token: CreateToken
                    },
                });
            } else {
                return res.status(200).json({
                    status: false,
                    message: 'Password doesn\'t Match',
                    data: error.message,
                });
                }
        } catch (error) {
            return res.status(200).json({
                status: false,
                message: 'Password doesn\'t Match',
                data: null,
            });
        }
    } else {
        return res.status(200).json({
            status: false,
            message: 'User not Found',
            data: null,
        });
    }
}

exports.checkUserExists = async (req, res) => {
    
    const { email_address } = req.body;
    
    if (!email_address) {
        return res.status(400).json({
            status: false,
            message: 'Please check the Fields.',
            data: null,
        });
    }
    const user = await UserModel.getUser(email_address,email_address);
    
    if (user) {
        return res.status(200).json({
            status: true,
            message: 'User exists',
            data: null,
        });
    } else {
        return res.status(200).json({
            status: false,
            message: 'User not Found',
            data: null,
        });
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { email_address, code, password } = req.body;
        
        if (!password ||!code || !email_address) {
            return res.status(400).json({ error: "Please check the Fields." });
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
                return res.status(200).json({
                    status: true,
                    message: 'Password updated successfully.',
                    data: null,
                });
            }else {
                return res.status(200).json({
                    status: false,
                    message: 'User data was not updated',
                    data: null,
                });
            }
        }else{
            return res.status(200).json({
                status: false,
                message: 'User not Found',
                data: null,
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: 'Internal server error',
            data: error.message,
        });
    }
}
exports.testData = async (req, res) => {
    res.json({
        message: 'Successful Working'
    });
}