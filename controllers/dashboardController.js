import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { startOfMonth, endOfMonth } from 'date-fns';
import { addDays, isAfter, startOfDay } from 'date-fns';
const prisma = new PrismaClient();
export const getList = async (req, res) => {
//    try {
        const userInfo = await commonFunction.getLoginUser(req.user.id);
        const totalNormalUsersCount = await prisma.users.count({ where: { roles: { name: 'user' } } });
        const totalAgencyUsersCount = await prisma.users.count({ where: { roles: { name: 'agency' } } });
        const totalDeveloperUsersCount = await prisma.users.count({ where: { roles: { name: 'developer' } } });
        const totalUsersCount = await prisma.users.count();
        const whereCondition = (userInfo !== 'admin') ? { user_id: req.user.id } : {};
        const totalProjectCount = await prisma.projectDetails.count({ where: { ...whereCondition } });
        const totalPropertyCount = await prisma.propertyDetails.count({ where: { ...whereCondition, status: true } });
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
        const activeDeveloper = await prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba688f" } });
        const activeAgency = await prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba6569" } });
        
        
        
        const currentYear = new Date().getFullYear();
const allMonths = Array.from({ length: 12 }, (_, i) =>
  new Date(currentYear, i, 1)
);

// Monthly Data
const monthlyLikes = await Promise.all(
  allMonths.map(async (monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    return await prisma.propertyLike.count({
      where: {
        property_publisher: req.user.id,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
  })
);

const monthlyComments = await Promise.all(
  allMonths.map(async (monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    return await prisma.propertyComment.count({
      where: {
        property_owner_id: req.user.id,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
  })
);

const monthlyChats = await Promise.all(
  allMonths.map(async (monthStart) => {
    const monthEnd = endOfMonth(monthStart);
    return await prisma.propertyRecommended.count({
      where: {
        user_id: req.user.id,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
  })
);

const monthlyLabels = allMonths.map(date =>
  date.toLocaleString("default", { month: "short" }) // Jan, Feb, ...
);

// Weekly Data
const startMonth = startOfMonth(new Date());
const endMonth = endOfMonth(new Date());
let weekStart = startOfWeek(startMonth, { weekStartsOn: 1 });

const weeklyLikes = [];
const weeklyComments = [];
const weeklyChats = [];
const weeklyLabels = [];

while (weekStart <= endMonth) {
  const weekEnd = addWeeks(weekStart, 1);

  const likeCount = await prisma.propertyLike.count({
    where: {
      property_publisher: req.user.id,
      created_at: { gte: weekStart, lt: weekEnd },
    },
  });

  const commentCount = await prisma.propertyComment.count({
    where: {
      property_owner_id: req.user.id,
      created_at: { gte: weekStart, lt: weekEnd },
    },
  });

  const chatCount = await prisma.propertyRecommended.count({
    where: {
      user_id: req.user.id,
      created_at: { gte: weekStart, lt: weekEnd },
    },
  });

  weeklyLikes.push(likeCount);
  weeklyComments.push(commentCount);
  weeklyChats.push(chatCount);
  weeklyLabels.push(weekStart.toLocaleDateString());

  weekStart = addWeeks(weekStart, 1);
}

// Daily Data (This month)
const dailyLikes = [];
const dailyComments = [];
const dailyChats = [];
const dailyLabels = [];

let day = startOfDay(startMonth);
while (!isAfter(day, endMonth)) {
  const nextDay = addDays(day, 1);

  const likeCount = await prisma.propertyLike.count({
    where: {
      property_publisher: req.user.id,
      created_at: { gte: day, lt: nextDay },
    },
  });

  const commentCount = await prisma.propertyComment.count({
    where: {
      property_owner_id: req.user.id,
      created_at: { gte: day, lt: nextDay },
    },
  });

  const chatCount = await prisma.propertyRecommended.count({
    where: {
      user_id: req.user.id,
      created_at: { gte: day, lt: nextDay },
    },
  });

  dailyLikes.push(likeCount);
  dailyComments.push(commentCount);
  dailyChats.push(chatCount);
  dailyLabels.push(day.toLocaleDateString());

  day = nextDay;
}

// ✅ Final Structured Response
const chartResponseData = {
  daily: {
    labels: dailyLabels,
    likes: dailyLikes,
    comments: dailyComments,
    chat: dailyChats
  },
  weekly: {
    labels: weeklyLabels,
    likes: weeklyLikes,
    comments: weeklyComments,
    chat: weeklyChats
  },
  monthly: {
    labels: monthlyLabels,
    likes: monthlyLikes,
    comments: monthlyComments,
    chat: monthlyChats
  }
};


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
            chartResponseData: chartResponseData
        }
        response.success(res, res.__('messages.dashboardList'), responseData);
    // } catch (error) {
    //     response.serverError(res, error);
    // }
}


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

export const getLikes = async (req, res) => {
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

        return response.success(
            res,
            res.__('messages.propertyCountFetchedSuccessfully'),
            userLiked
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            res.__('messages.internalServerError')
        );
    }
}
export const getComments = async (req, res) => {
    const userId = req.user.id;
    const { day_before } = req.body;

    try {
        const daysBefore = day_before || 7; // Default to last 7 days if not provided
        const startDate = subDays(new Date(), daysBefore); // Calculate the start date

        // Fetch likes data
        const likesData = await prisma.propertyComment.findMany({
            where: {
                property_owner_id: userId,
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

        return response.success(
            res,
            res.__('messages.propertyCountFetchedSuccessfully'),
            userLiked
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            res.__('messages.internalServerError')
        );
    }
}
export const getViews = async (req, res) => {
    const userId = req.user.id;
    const { day_before } = req.body;

    try {
        const daysBefore = day_before || 7; // Default to last 7 days if not provided
        const startDate = subDays(new Date(), daysBefore); // Calculate the start date

        // Fetch likes data
        const likesData = await prisma.propertyView.findMany({
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

        return response.success(
            res,
            res.__('messages.propertyCountFetchedSuccessfully'),
            userLiked
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            res.__('messages.internalServerError')
        );
    }
}



export const getUserActivity = async (req, res) => {
    const userId = req.user.id;
    const { day_before } = req.body;

    try {
        const daysBefore = day_before || 7; // Default to last 7 days if not provided
        const startDate = subDays(new Date(), daysBefore); // Calculate the start date

        // Fetch likes, comments, and views in parallel
        const [likesData, commentsData, viewsData] = await Promise.all([
            prisma.propertyLike.findMany({
                where: {

                    created_at: {
                        gte: startOfDay(startDate),
                    },
                },
                select: { created_at: true },
                orderBy: { created_at: 'asc' },
            }),
            prisma.propertyComment.findMany({
                where: {
                    // property_owner_id: userId,
                    created_at: {
                        gte: startOfDay(startDate),
                    },
                },
                select: { created_at: true },
                orderBy: { created_at: 'asc' },
            }),
            prisma.propertyView.findMany({
                where: {
                    // property_publisher: userId,
                    created_at: {
                        gte: startOfDay(startDate),
                    },
                },
                select: { created_at: true },
                orderBy: { created_at: 'asc' },
            }),
        ]);

        // Function to group data by date
        const groupByDate = (data) => {
            return data.reduce((acc, item) => {
                const dateKey = format(new Date(item.created_at), 'MM-dd');
                acc[dateKey] = (acc[dateKey] || 0) + 1;
                return acc;
            }, {});
        };

        // Group likes, comments, and views data by date
        const likesByDate = groupByDate(likesData);
        const commentsByDate = groupByDate(commentsData);
        const viewsByDate = groupByDate(viewsData);

        // Prepare response data for the requested days
        const activityData = [];
        for (let i = 0; i <= daysBefore; i++) {
            const currentDate = format(subDays(new Date(), daysBefore - i), 'MM-dd');
            activityData.push({
                date: currentDate,
                likes: likesByDate[currentDate] || 0,
                comments: commentsByDate[currentDate] || 0,
                views: viewsByDate[currentDate] || 0,
            });
        }

        return response.success(
            res,
            res.__('messages.propertyActivityFetchedSuccessfully'),
            activityData
        );
    } catch (error) {
        console.error(error);
        return response.error(
            res,
            res.__('messages.internalServerError')
        );
    }
};


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
