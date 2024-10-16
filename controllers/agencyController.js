const Agency = require('../models/agencyModel');
const User = require('../models/userModel'); // Assuming you have a User model defined

// Create an agency
exports.createAgency = async (req, res) => {
console.log(req.body);
    // Extract user data from usertable
    const userData = {
        roles: req.body.usertable.roles,
        full_name: req.body.usertable.full_name,
        user_name: req.body.usertable.user_name,
        mobile_number: req.body.usertable.mobile_number,
        email_address: req.body.usertable.email_address,
        password: req.body.usertable.password, // Ensure this is hashed properly
        is_deleted: req.body.usertable.is_deleted,
    };

    try {
        // Step 1: Create the user
        const user = await User.create(userData);

        // Step 2: Create the agency using the user ID
        const agencyData = {
            user_id: user.id, // Use the newly created user's ID
            credit: req.body.agency.credit,
            description: req.body.agency.description,
            facebook_link: req.body.agency.facebook_link,
            twitter_link: req.body.agency.twitter_link,
            youtube_link: req.body.agency.youtube_link,
            pinterest_link: req.body.agency.pinterest_link,
            linkedin_link: req.body.agency.linkedin_link,
            instagram_link: req.body.agency.instagram_link,
            whatsup_number: req.body.agency.whatsup_number,
            service_area: req.body.agency.service_area,
            tax_number: req.body.agency.tax_number,
            license_number: req.body.agency.license_number,
            picture: req.body.agency.picture,
            cover: req.body.agency.cover,
        };

        // Step 3: Create the agency
        const agency = await Agency.create(agencyData);

        // Step 4: Respond with the created agency and user
        res.status(201).json({ user, agency });
    } catch (err) {
        // If there is an error, respond with a status code and error message
        res.status(400).json({ error: err.message });
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