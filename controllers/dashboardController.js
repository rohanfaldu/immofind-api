import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";

const prisma = new PrismaClient();
export const getList = async (req, res) => {
    try {
        const userInfo = await commonFunction.getLoginUser(req.user.id);
        const totalNormalUsersCount = await prisma.users.count({ where: { roles: { name: 'user' } } });
        const totalAgencyUsersCount = await prisma.users.count({ where: { roles: { name: 'agency' } } });
        const totalDeveloperUsersCount = await prisma.users.count({ where: { roles: { name: 'developer' } } });
        const totalUsersCount = await prisma.users.count();
        const whereCondition = (userInfo !== 'admin')?{ user_id: req.user.id }:{};
        const totalProjectCount = await prisma.projectDetails.count({where: { ...whereCondition }});
        const totalPropertyCount = await prisma.propertyDetails.count({where: { ...whereCondition, status: true }});
        const likeCount = await prisma.propertyLike.count({
            where: {
                property_publisher: req.user.id  // Adjust this based on your actual field name
            }
        });
        const viewCount = await prisma.propertyView.count({
            where: {
                property_publisher: req.user.id  // Adjust this based on your actual field name
            }
        });
        const commentCount = await prisma.propertyComment.count({
            where: {
                property_owner_id: req.user.id  // Adjust this based on your actual field name
            }
        });
        const visitCount = await prisma.propertyVisit.count({});
        const activeDeveloper = await prisma.users.count({where: {role_id: "c326e1e2-6f82-4af4-ba25-06029eba688f"}});
        const activeAgency = await prisma.users.count({where: {role_id: "c326e1e2-6f82-4af4-ba25-06029eba6569"}});
        const responseData = {
            total_users: totalUsersCount,
            project_count: totalProjectCount,
            property_count: totalPropertyCount,
            property_like_count: likeCount,
            property_view_count: viewCount,
            property_comment_count: commentCount,
            active_developer: activeDeveloper,
            active_agency: activeAgency,
            property_visit_count: visitCount,
        }
        response.success(res, res.__('messages.dashboardList'), responseData);
    } catch (error) {
        response.serverError(res, error);
    }
}

import { subDays, format, startOfDay, endOfDay } from 'date-fns';

// export const agenciesEngagement = async (req, res) => {
//     const userId = req.user.id;
//     const { day_before } = req.body;

//     try {        
//         const daysBefore = day_before || 7; // Default to last 7 days if not provided
//         const startDate = subDays(new Date(), daysBefore); // Calculate the start date

//         // Fetch likes data
//         const likesData = await prisma.propertyLike.findMany({
//             where: {
//                 property_publisher: userId,
//                 created_at: {
//                     gte: startOfDay(startDate), // Get records from startDate to now
//                 },
//             },
//             select: {
//                 created_at: true,
//             },
//             orderBy: {
//                 created_at: 'asc', // Sort by date ascending
//             },
//         });

//         // Group by date
//         const likeCountsByDate = likesData.reduce((acc, item) => {
//             const dateKey = format(new Date(item.created_at), 'yyyy-MM-dd'); // Extract only date
//             acc[dateKey] = (acc[dateKey] || 0) + 1; // Count occurrences per day
//             return acc;
//         }, {});

//         // Prepare response data for the requested days
//         const userLiked = [];
//         for (let i = 0; i <= daysBefore; i++) {
//             const currentDate = format(subDays(new Date(), daysBefore - i), 'yyyy-MM-dd');
//             userLiked.push({
//                 date: currentDate,
//                 count: likeCountsByDate[currentDate] || 0, // Use count if exists, else 0
//             });
//         }

//         const responsePayload = {
//             user_liked: userLiked,
//         };

//         return response.success(
//             res,
//             res.__('messages.propertyCountFetchedSuccessfully'),
//             responsePayload
//         );
//     } catch (error) {
//         console.error(error);
//         return response.error(
//             res,
//             res.__('messages.internalServerError')
//         );
//     }
// };


export const agenciesEngagement = async (req, res) => {
    const userId = req.user.id;
    const { day_before } = req.body;

    try {
        const daysBefore = day_before || 7; // Default to last 7 days if not provided
        const startDate = subDays(new Date(), daysBefore); // Calculate the start date

        // Fetch likes data
        const likesData = await prisma.propertyLike.findMany({
            where: {
                property_publisher: userId,
                created_at: {
                    gte: startOfDay(startDate), // Get records from startDate to now
                },
            },
            select: {
                created_at: true,
            },
            orderBy: {
                created_at: 'asc', // Sort by date ascending
            },
        });

        // Group by date
        const likeCountsByDate = likesData.reduce((acc, item) => {
            const dateKey = format(new Date(item.created_at), 'MM-dd'); // Extract month and day
            acc[dateKey] = (acc[dateKey] || 0) + 1; // Count occurrences per day
            return acc;
        }, {});

        // Prepare response data for the requested days
        const userLiked = [];
        for (let i = 0; i <= daysBefore; i++) {
            const currentDate = format(subDays(new Date(), daysBefore - i), 'MM-dd'); // Format as MM-DD
            userLiked.push({
                date: currentDate,
                count: likeCountsByDate[currentDate] || 0, // Use count if exists, else 0
            });
        }

        const responsePayload = {
            user_liked: userLiked,
        };

        return response.success(
            res,
            res.__('messages.propertyCountFetchedSuccessfully'),
            responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            res.__('messages.internalServerError')
        );
    }
};
