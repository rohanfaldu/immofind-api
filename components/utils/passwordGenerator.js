const bcrypt = require("bcrypt");
require("dotenv").config();

const passwordGenerator = {
    encrypted: async (password) => {
        const saltRounds = 10; // Higher rounds make it more secure but slower
        return await bcrypt.hash(password, saltRounds);
    },
    comparePassword: async (password, storedHash) => {
        return await bcrypt.compare(password, storedHash);
    },
};
module.exports = passwordGenerator;
