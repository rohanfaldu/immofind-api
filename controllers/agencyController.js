const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const password = require('../utils/passwordGenerator');
const Agency = require('../models/agencyModel');
const User = require('../models/userModel'); // Assuming you have a User model defined
const { use } = require('passport');
const jwtGenerator = require("../utils/jwtGenerator");
const bcrypt = require("bcrypt");
const passwordGenerator = require("../utils/passwordGenerator");
const sendmail = require("../utils/sendmail");
const crypto = require('crypto');

// Create an agency
exports.createAgency = async (req, res) => {
    const { roles,user_name, full_name, email_address, user_login_type, image, address, mobile_number, password, user_type, credit, description,
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
        cover } = req.body;
        
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

        if(existingUser) {
            return res.status(400).json({
                status: false,
                message: 'User already Exist',
                data: null,
            });
        }
    
        const user = await User.createUser(userData);
    
        if(user){

            return res.status(200).json({
                status: false,
                message: 'Sucessful Working',
                data: user,
            });
        } else {
            return res.status(400).json({
                status: false,
                message: 'User not created',
                data: null,
            });
        }
        
    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message,
            data: null,
        });
    }
};

// Get all agencies
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.findAll();
        res.status(200).json(agencies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.sendMail = async (req, res) => {
    const checkEmail = await User.getUser(req.body.email_address, req.body.email_address);
    if(checkEmail){
        const code = crypto.randomInt(100000, 999999);
        const to = req.body.email_address;
        const subject = "Password Reset Code";
        const text = `Your password reset code is: ${code}`;
        try {
            const emailData = await sendmail.gmail(to, subject, text); // Wait for email to send
            console.log(emailData);
            if(emailData){
                const data = {
                    reset_password_token: code
                }
                const where = {
                    email_address: req.body.email_address
                }
                const userUpdate = await User.updateUser(where, data);
                if(userUpdate){
                    return res.status(200).json({
                        status: true,
                        message: 'Successfully email Send. Please check your email. Your have received a code',
                        data: null,
                    });
                }else {
                    return res.status(200).json({
                        status: false,
                        message: 'User data was not updated',
                        data: null,
                    });
                }
            }
          } catch (error) {
            return res.status(200).json({
                status: false,
                message: 'Email was not sent',
                data: null,
            });
          }
    } else {
        return res.status(200).json({
            status: false,
            message: 'User was not found',
            data: null,
        });
    }
}
// Get an agency by ID
exports.getAgencyById = async (req, res) => {
    try {
        const agency = await Agency.findByPk(req.params.id);
        if (agency) {
            res.status(200).json(agency);
        } else {
            res.status(404).json({ message: 'Agency not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an agency
exports.updateAgency = async (req, res) => {
    try {
        const [updated] = await Agency.update(req.body, { where: { id: req.params.id } });
        if (updated) {
            const updatedAgency = await Agency.findByPk(req.params.id);
            res.status(200).json(updatedAgency);
        } else {
            res.status(404).json({ message: 'Agency not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an agency
exports.deleteAgency = async (req, res) => {
    try {
        const deleted = await Agency.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).json({ message: 'Agency deleted' });
        } else {
            res.status(404).json({ message: 'Agency not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};