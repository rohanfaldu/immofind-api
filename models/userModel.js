import { PrismaClient } from '@prisma/client';
import passwordGenerator from '../components/utils/passwordGenerator.js';
import commonFunction from '../components/utils/commonFunction.js';
//import { use } from 'passport';
const prisma = new PrismaClient();
const UserModel = {
    createOrUpdateUser: async (data) => {
        try {
            const user = await prisma.users.upsert({
                where: { email_address: data.email_address },  // Use the unique email address
                update: {
                    full_name: data.full_name,
                    user_name: data.user_name,
                    mobile_number: data.mobile_number,
                    image: data.image,
                    email_address: data.email_address,
                    fcm_token: data.fcm_token,
                    updated_at: new Date(),
                },
                create: {
                    roles: {
                        connect: {
                            name: data.roles,
                            status: true, 
                        },
                    },
                    full_name: data.full_name,
                    user_name: data.user_name,
                    mobile_number: data.mobile_number,
                    fcm_token: data.fcm_token,
                    image: data.image,
                    user_login_type: data.user_login_type,
                    email_address: data.email_address,
                    password: await passwordGenerator.encrypted(data.password),  // Hash your password before storing
                    is_deleted: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return user;
        } catch (error) {
            throw error;
        }
    },
    createUser: async (data) => {
        const user = await prisma.users.create({
            data,
        });
        const userInfo = await prisma.users.findFirst({
            where: { id: user.id },
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
        if (userInfo) {
            userInfo.mobile_number = Number(userInfo.mobile_number);
            return userInfo;
        }
    },
    getUser: async (email_address, mobile_number) => {
        const userInfo = await prisma.users.findFirst({
            where: {
                OR: [
                  email_address ? { email_address: email_address } : undefined,
                  mobile_number ? { mobile_number: mobile_number } : undefined
                ].filter(Boolean) // Remove undefined values from the array
              },
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
        if (userInfo) {
            userInfo.mobile_number = Number(userInfo.mobile_number);
            return userInfo;
        }
    },

    getUserWithEmailOTP: async (email_address, otp) => {
        const userInfo = await prisma.users.findFirst({
            where: {email_address: email_address, email_password_code: parseInt(otp, 10)},
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
        if (userInfo) {
            userInfo.mobile_number = Number(userInfo.mobile_number);
            return userInfo;
        }
    },
    getAllUserd: async (type) => {
        const userInfo = await prisma.users.findMany({
            where: {
                roles: {
                    name: type,  // Ensure the variable `type` has a correct role name
                },
            },
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
            orderBy: {
                created_at: 'desc', // Order by creation date in descending order (newest first)
              },
        });
        return  await commonFunction.bigIntiger(userInfo);
    },
    getUserWithPhoneOTP: async (mobile_number, otp) => {
        const userInfo = await prisma.users.findFirst({
            where: { mobile_number: BigInt(mobile_number), phone_password_code: parseInt(otp, 10)},
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
        // If the response contains a BigInt, convert it to a string before returning
        if (userInfo) {
            userInfo.mobile_number = Number(userInfo.mobile_number);
            return userInfo;
        }  
    },  
    
    updateUser: async (where, data) => {
        const user = await prisma.users.update({
            where,
            data,
        });
        const userInfo = await prisma.users.findFirst({
            where: { id: user.id },
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
        if (userInfo) {
            userInfo.mobile_number = Number(userInfo.mobile_number);
            return userInfo;
        }
    },
};

export default UserModel;