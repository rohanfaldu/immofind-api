import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const commonFunction = {
    capitalize: async (str) => {
        const text = str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
       console.log(text);
        return text;  
    },
    checkPhonember: async (phone) => {
        const phoneNumber = phone.toString();
    
        if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
            return true;
        } else {
            return false;
        }
    }
};
export default commonFunction;