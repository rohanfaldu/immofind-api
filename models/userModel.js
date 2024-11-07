const { PrismaClient } = require('@prisma/client');
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
                    fcm_token: data.fcm_token,
                    roles: data.roles,
                    updated_at: new Date(),
                },
                create: {
                    roles: data.roles,
                    full_name: data.full_name,
                    user_name: data.user_name,
                    mobile_number: data.mobile_number,
                    fcm_token: data.fcm_token,
                    image: data.image,
                    email_address: data.email_address,
                    password: data.password,  // Hash your password before storing
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
     findUserByEmail: async (email_address) => {
        return await prisma.users.findUnique({
            where: { email_address },
        });
    },

};
module.exports = UserModel;
