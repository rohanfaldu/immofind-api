const { PrismaClient } = require('@prisma/client');
const { get } = require('mongoose');
const prisma = new PrismaClient();
const passwordGenerator = require('../components/utils/passwordGenerator');
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
                    user_login_type: data.user_login_type,
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
        return await prisma.users.create({
        data,
        });
    },
    getUser: async (email_address, mobile_number) => {
        return await prisma.users.findFirst({
            where: {
              OR: [
                { email_address: email_address },
                { mobile_number: mobile_number }
              ]
            },
            include: {
                roles: {
                    select: {
                      name: true, // Select only the role name
                    },
                },
            },
        });
    },
    
    updateUser: async (where, data) => {
        return await prisma.users.update({
            where,
            data,
        });
    },
};
module.exports = UserModel;
