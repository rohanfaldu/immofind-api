import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();
const prisma = new PrismaClient();
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
    },
    bigIntiger: async (userInfo) => {
        return JSON.parse(
            JSON.stringify(userInfo, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          );    
    },
    getRole: async (role) => {
        switch (role) {
            case 'developer':
                return 'developer';
            case 'agency':
                return 'agency';
            default:
                return 'user';
        }
        const msg = message.replace(/'/g, "\\'");
        return msg;
    },
    checkDeviceType: async (deviceType) => {
        switch (deviceType) {
            case 'app':
                return 'app';
            case 'web':
                return 'web';
            default:
                return '';
        }
    },
    getLoginUser: async (id) => {
        const loginUserInfo = await prisma.users.findFirst({
            where: {
              id: id
            },
            include: {roles: true}
        });
        if(loginUserInfo){
            return loginUserInfo.roles.name;
        }else{
            return 'admin';
        }
    },

    pagination: async (page, limit, where, orderBy, include, tableName) => {
        try {
          const validPage = Math.max(1, parseInt(page, 10) || 1);
          const validLimit = Math.max(1, parseInt(limit, 10) || 10);
          const skip = (validPage - 1) * validLimit;
      
          const totalCount = await prisma[tableName].count({
            where,
          });
      
          const finding = await prisma[tableName].findMany({
            skip,
            take: validLimit,
            orderBy,
            where,
            include,
          });
      
          return { totalCount, validPage, validLimit, finding };
        } catch (error) {
          console.error(`Error in pagination for ${tableName}:`, error);
          throw error; // Rethrow the error to be handled in the calling function
        }
      },

      langCondition: async(field, res) => {
        const lang = res.getLocale();
        return{
            [lang === 'fr' ? 'fr_string' : 'en_string']: {
                contains: field,
                mode: 'insensitive',
              },
        }
      }
      
};
export default commonFunction;