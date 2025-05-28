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
                    social_id: social_id,
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
                    social_id: social_id,
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
                    mobile_number ? { mobile_number: mobile_number } : undefined,
                ].filter(Boolean),
                AND: [{ is_deleted: false }],
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
    getSocialUser: async (social_id) => {
        const userInfo = await prisma.users.findFirst({
            where: {
                social_id: social_id
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
            where: { email_address: email_address, email_password_code: parseInt(otp, 10) },
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
    getAllUserd: async (type, startDate, endDate) => {
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                created_at: {
                    gte: new Date(startDate), // Greater than or equal to start date
                    lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const users = await prisma.users.findMany({
            where: {
                is_deleted: false,
                roles: {
                    name: type,  // Ensure the variable `type` has a correct role name
                },
                ...dateFilter,
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

        // Fetch property counts for each user
        const userDataWithPropertyCount = await Promise.all(users.map(async (user) => {
            const propertyCount = await prisma.propertyDetails.count({
                where: { user_id: user.id }
            });
            const projectCount = await prisma.projectDetails.count({
                where: { user_id: user.id }
            });
            const userViewCount = await prisma.propertyView.count({
                where: { user_id: user.id }
            });
            const userLikeCount = await prisma.propertyLike.count({
                where: { user_id: user.id }
            });
            const userActivity = await prisma.userActivity.findFirst({
                where: { user_id: user.id },
            })
            let slug = null;

            if (user.roles.name === 'developer' || user.roles.name === 'agency') {
                const model = user.roles.name === 'developer' ? prisma.developers : prisma.agencies;

                const data = await model.findUnique({
                    where: { user_id: user.id },
                });

                slug = data?.slug || null;
            }
            return {
                ...user,
                publish_property: propertyCount,
                publish_project: projectCount,
                user_view_property: userViewCount,
                user_like_property: userLikeCount,
                last_activity_at: userActivity,
                slug: slug
            };
        }));

        return await commonFunction.bigIntiger(userDataWithPropertyCount);
    },

    getagencyUsered: async () => {
        const userInfo = await prisma.users.findMany({
            where: {
                is_deleted: false,
                roles: {

                    name: { in: ['agency'] }, // Check for specific role names

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
        return await commonFunction.bigIntiger(userInfo);
    },
    getdeveloperUsered: async () => {
        const userInfo = await prisma.users.findMany({
            where: {
                is_deleted: false,
                roles: {

                    name: { in: ['developer'] }, // Check for specific role names

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
        return await commonFunction.bigIntiger(userInfo);
    },
    getUserWithPhoneOTP: async (mobile_number, otp) => {
        const userInfo = await prisma.users.findFirst({
            where: { mobile_number: BigInt(mobile_number), phone_password_code: parseInt(otp, 10) },
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
    deleteUser: async (id) => {
        const existingUser = await prisma.users.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return false;
        }

        // Proceed with the delete (if it's a hard delete)
        const deletedUser = await prisma.users.delete({
            where: { id },
        });
        // const user = await prisma.users.update({
        //     where: { id : id },
        //     data: {
        //         is_deleted: true
        //     }
        // });
        return deletedUser;
    },
};

export default UserModel;