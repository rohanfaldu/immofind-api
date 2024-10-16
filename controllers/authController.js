const passport = require('passport');
const UserModel = require('../models/userModel');

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleAuthCallback = async (req, res) => {
    try {
        console.log(req.user); // Log the user object for debugging

        // Get the profile and access token from the request
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
            full_name: fullName,     // Full name from Google profile
            user_name: fullName,     // Username, can be adjusted to suit your naming convention
            mobile_number: '1234567890', // Placeholder mobile number
            email_address: email,     // Email address from Google profile
            image: imageUrl,         // Profile image from Google profile (if any)
            roles: 'user',           // Default role for users logging in with Google
            is_deleted: false,       // Assuming the user is active when they log in
        });

        // Respond with success message and user information
        res.json({
            message: 'Google login successful',
            accessToken: accessToken, // The access token
            userProfile: user         // Return the user object from the database
        });
    } catch (error) {
        console.error('Error during Google login:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.facebookAuth = passport.authenticate('facebook');

// exports.facebookAuthCallback = async (req, res) => {
//     res.json({
//         message: 'Facebook login successful',
//         accessToken: accessToken,  // The access token
//         userProfile: profile       // The user's profile
//       });
//     try {
//         const profile = req.user;
//         await UserModel.createOrUpdateUser(profile.provider, profile.id, profile.displayName);
//         res.redirect('/'); // Redirect to a welcome page or dashboard
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// };

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
        // if (!email) {
        //     return res.status(400).json({ message: 'Email is required' });
        // }

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