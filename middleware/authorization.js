import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import response from '../components/utils/response.js';
dotenv.config();

export const authorize = async (req, res, next) => {
  try {
    // Get token from the header
    const token = req.header("Authorization")?.split(" ")[1]; // Expected: "Bearer <token>"

    if (!token) {
      return response.authError(res, "Unauthorized: No token provided");
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request
    req.user = payload;

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Authorization error:', err.message);
    return response.authError(res, "Unauthorized: Invalid token");
  }
};


export const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Extract Bearer token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
      req.user = decoded; // Attach user info (e.g., id) to the request object
    } catch (err) {
      console.warn('Invalid token:', err.message); // Log warning but don't block
    }
  }
  next(); // Proceed whether token is valid or not
};