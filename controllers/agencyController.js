const Agency = require('../models/agencyModel');
const User = require('../models/userModel'); // Assuming you have a User model defined

// Create an agency
exports.createAgency = async (req, res) => {
console.log(req.body);
    // Extract user data from usertable
    const userData = {
        roles: req.body.usertable?.roles,
        full_name: req.body.usertable?.full_name,
        user_name: req.body.usertable?.user_name,
        mobile_number: req.body.usertable?.mobile_number,
        email_address: req.body.usertable?.email_address,
        password: req.body.usertable?.password, // This will be hashed in the UserModel
        address: req.body.usertable?.address,
        image: req.body.usertable?.image,
        userType: req.body.usertable?.userType,
        is_deleted: req.body.usertable?.is_deleted || false, // Default to false if undefined
    };


    try {
        // Step 1: Create the user
       const user = await User.createUser(userData);

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
            meta_id: null, // Meta ID can be null if not applicable
            is_deleted: false, // Default value for is_deleted
            created_by: user.id, // Ensure this is a valid UUID for the user who created the agency
            updated_by: null // Updated_by can be null initially

        };

        // Step 3: Create the agency
        const agency = await Agency.createAgency(agencyData);

        // Step 4: Respond with the created agency and user
        res.status(201).json({agency,user });
    } catch (err) {
        // If there is an error, respond with a status code and error message
        res.status(400).json({ error: err.message });
    }
};

// Get all agencies
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await Agency.getAllAgencies();
        res.status(200).json(agencies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get an agency by ID
exports.getAgencyById = async (req, res) => {
    try {
        const agency = await Agency.getAgencyById(req.params.id);
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

exports.login = async (req, res) => {
    const { email_address, password } = req.body;

    try {
        // Find user by email
        const user = await UserModel.findUserByEmail(email_address);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email_address: user.email_address },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            userProfile: user
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};