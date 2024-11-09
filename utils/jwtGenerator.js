const jwt = require("jsonwebtoken");
require("dotenv").config();

const JwtModel = {
  generateToken: async (id, email_address) => {
    return jwt.sign(
      { id: id, email_address: email_address },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
};
module.exports = JwtModel;
