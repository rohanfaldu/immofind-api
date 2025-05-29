import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";
import { startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { startOfMonth, endOfMonth } from 'date-fns';
import { addDays, isAfter, startOfDay } from 'date-fns';
import { getFirestore, collection, getDocs, doc, query, where, serverTimestamp, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";

import { firebaseConfigration } from '../middleware/firebaseConfigration.js';
const prisma = new PrismaClient();
const collectionName = process.env.FIREBASE_COLLECTION_NAME;

export const getMonthlyCountsFromFirebase = async (collectionName, year = new Date().getFullYear()) => {
    const collectionRef = collection(firebaseConfigration, collectionName);

    // Dynamically set start and end of the year
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);           // Jan 1, 00:00:00
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);      // Dec 31, 23:59:59

    // console.log(startDate, '>>>>>>>>>startDate');
    // console.log(endDate, '>>>>>>>>>endDate');

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(collectionRef,
        where("last_activity", ">=", startTimestamp),
        where("last_activity", "<=", endTimestamp)
    );

    try {
        const snapshot = await getDocs(q);

        const monthsDiff = 12; // Always 12 months in the year
        const monthlyCounts = new Array(monthsDiff).fill(0);

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.last_activity) {
                const date = data.last_activity.toDate();
                const monthIndex = date.getMonth(); // 0 = January, 11 = December

                if (monthIndex >= 0 && monthIndex < monthsDiff) {
                    monthlyCounts[monthIndex]++;
                }
            }
        });

        return monthlyCounts;
    } catch (error) {
        console.error("Error getting monthly counts:", error);
    }
};




export const getWeeklyCountsFromFirebase = async (collectionName, inputStartDate = null, inputEndDate = null) => {
    const collectionRef = collection(firebaseConfigration, collectionName);

    // Use dynamic date input if provided; otherwise, fallback to current month's dates
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    const startDate = inputStartDate ? new Date(inputStartDate) : new Date(year, month, 1); // First day of the month
    const endDate = inputEndDate ? new Date(inputEndDate) : new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of the month

    // console.log(startDate, '>>>>>>>>>startDate');
    // console.log(endDate, '>>>>>>>>>endDate');

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const q = query(collectionRef,
        where("last_activity", ">=", startTimestamp),
        where("last_activity", "<=", endTimestamp)
    );

    try {
        const snapshot = await getDocs(q);

        // Calculate the exact number of weeks in this range
        const firstDayOfWeek = startDate.getDay(); // 0 = Sunday
        const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Including both days

        const daysOffset = (firstDayOfWeek + 6) % 7; // Adjust to make Monday the first day of the week
        const totalWeeks = Math.ceil((daysInRange + daysOffset) / 7);

        const weeklyCounts = new Array(totalWeeks).fill(0);

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.last_activity) {
                const activityDate = data.last_activity.toDate();
                const dayOffset = Math.floor((activityDate - startDate) / (1000 * 60 * 60 * 24)); // Days since startDate

                if (dayOffset >= 0 && dayOffset < daysInRange) {
                    const weekIndex = Math.floor((dayOffset + daysOffset) / 7);
                    if (weekIndex >= 0 && weekIndex < totalWeeks) {
                        weeklyCounts[weekIndex]++;
                    }
                }
            }
        });

        return weeklyCounts;
    } catch (error) {
        console.error("Error getting weekly counts:", error);
    }
};




export const getDailyCountsForRange = async (collectionName, inputStartDate = null, inputEndDate = null) => {
    const collectionRef = collection(firebaseConfigration, collectionName);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based

    const startDate = inputStartDate ? new Date(inputStartDate) : new Date(year, month, 1);
    const endDate = inputEndDate ? new Date(inputEndDate) : new Date(year, month + 1, 0);

    // Normalize both dates to midnight
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const oneDayMs = 1000 * 60 * 60 * 24;
    const daysInRange = Math.round((endDate - startDate) / oneDayMs) + 1;

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(new Date(endDate.getTime() + (24 * 60 * 60 * 1000) - 1)); // end of day

    const q = query(
        collectionRef,
        where("last_activity", ">=", startTimestamp),
        where("last_activity", "<=", endTimestamp)
    );

    try {
        const snapshot = await getDocs(q);

        const dailyCounts = new Array(daysInRange).fill(0);

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.last_activity) {
                const activityDate = data.last_activity.toDate();
                activityDate.setHours(0, 0, 0, 0); // normalize to midnight
                const dayOffset = Math.round((activityDate - startDate) / oneDayMs);
                if (dayOffset >= 0 && dayOffset < daysInRange) {
                    dailyCounts[dayOffset]++;
                }
            }
        });

        return dailyCounts;
    } catch (error) {
        console.error("Error fetching daily counts:", error);
    }
};


export const getList = async (req, res) => {
    // try {
    const userInfo = await commonFunction.getLoginUser(req.user.id);
    const totalNormalUsersCount = await prisma.users.count({ where: { roles: { name: 'user' } } });
    const totalAgencyUsersCount = await prisma.users.count({ where: { roles: { name: 'agency' } } });
    const totalDeveloperUsersCount = await prisma.users.count({ where: { roles: { name: 'developer' } } });
    const totalUsersCount = await prisma.users.count();
    const whereCondition = (userInfo !== 'admin') ? { user_id: req.user.id } : {};
    const totalProjectCount = await prisma.projectDetails.count({ where: { ...whereCondition } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start and end of yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayProjectCount = await prisma.projectDetails.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayProjectCount = await prisma.projectDetails.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const projectYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayProjectCount, todayProjectCount);

    const todayPropertyCount = await prisma.propertyDetails.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayPropertyCount = await prisma.propertyDetails.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const propertyYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayPropertyCount, todayPropertyCount);

    const totalPropertyCount = await prisma.propertyDetails.count({ where: { ...whereCondition, status: true } });
    const likeCount = await prisma.propertyLike.count({
        where: {
            property_publisher: req.user.id  // Adjust this based on your actual field name
        }
    });

      const todayPropertyLikeCount = await prisma.propertyLike.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayPropertyLikeCount = await prisma.propertyLike.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const propertyLikeYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayPropertyLikeCount, todayPropertyLikeCount);

    const viewCount = await prisma.propertyView.count({
        where: {
            property_publisher: req.user.id  // Adjust this based on your actual field name
        }
    });

        const todayPropertyViewCount = await prisma.propertyView.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayPropertyViewCount = await prisma.propertyView.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const propertyViewYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayPropertyViewCount, todayPropertyViewCount);


    const commentCount = await prisma.propertyComment.count({
        where: {
            property_owner_id: req.user.id  // Adjust this based on your actual field name
        }
    });

         const todayPropertyCommentCount = await prisma.propertyView.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayPropertyCommentCount = await prisma.propertyView.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const propertCommentYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayPropertyCommentCount, todayPropertyCommentCount);


    const visitCount = await prisma.propertyVisit.count({});

    
         const todayPropertyVisitCount = await prisma.propertyVisit.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    // Yesterday's count
    const yesterdayPropertyVisitCount = await prisma.propertyVisit.count({
        where: {
            ...whereCondition,
            created_at: {
                gte: yesterday,
                lt: today
            }
        }
    });
    const propertVisitYesterday =  await commonFunction.dashboardYesterdayCount(yesterdayPropertyVisitCount, todayPropertyVisitCount);

    const activeDeveloper = await prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba688f" } });
    const activeAgency = await prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba6569" } });

    // START BAR CHART

    const currentYear = new Date().getFullYear();
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(currentYear, i, 1)
    );
    const collectionName = process.env.FIRBASE_COLLECTION_NAME;

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

    const monthlyLabels = allMonths.map(date =>
        date.toLocaleString("default", { month: "short" }) // Jan, Feb, ...
    );



    // Weekly Data
    const startMonth = startOfMonth(new Date()); // e.g. 30/04/2025
    const endMonth = endOfMonth(new Date());     // e.g. 31/05/2025
    let weekStart = startMonth; // Start from first day of month

    const weeklyLikes = [];
    const weeklyComments = [];
    const weeklyChats = [];
    const weeklyLabels = [];

    const startDate = new Date(startMonth);
    const endDate = new Date(endMonth);


    while (weekStart <= endMonth) {
        const weekEnd = new Date(Math.min(addDays(weekStart, 6).getTime(), endMonth.getTime())); // Ensure we don't exceed month end

        const likeCount = await prisma.propertyLike.count({
            where: {
                property_publisher: req.user.id,
                created_at: { gte: weekStart, lt: addDays(weekEnd, 1) }, // inclusive of weekEnd
            },
        });

        const commentCount = await prisma.propertyComment.count({
            where: {
                property_owner_id: req.user.id,
                created_at: { gte: weekStart, lt: addDays(weekEnd, 1) },
            },
        });

        weeklyLikes.push(likeCount);
        weeklyComments.push(commentCount);
        // weeklyChats.push(chatCount); // Replace with Firestore chat count logic if needed
        weeklyLabels.push(`${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);

        weekStart = addDays(weekStart, 7); // Move to next week
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

        dailyLikes.push(likeCount);
        dailyComments.push(commentCount);
        // dailyChats.push(chatCount);
        dailyLabels.push(day.toLocaleDateString());

        day = nextDay;
    }

    const countMonthly = await getMonthlyCountsFromFirebase(collectionName);
    const countWeekly = await getWeeklyCountsFromFirebase(collectionName);
    const countDaily = await getDailyCountsForRange(collectionName);

    // ✅ Final Structured Response
    const chartResponseData = {
        daily: {
            labels: dailyLabels,
            likes: dailyLikes,
            comments: dailyComments,
            chat: countDaily,
        },
        weekly: {
            labels: weeklyLabels,
            likes: weeklyLikes,
            comments: weeklyComments,
            chat: countWeekly

        },
        monthly: {
            labels: monthlyLabels,
            likes: monthlyLikes,
            comments: monthlyComments,
            chat: countMonthly,
        }
    };

    // console.log(chartResponseData, ' >>>>>>>>>>>>>> chartResponseData');
    // END BAR CHART

    const responseData = {
        total_users: totalUsersCount,
        project_yesterday: projectYesterday, 
        project_count: totalProjectCount,
        property_count: totalPropertyCount,
        property_yesterday: propertyYesterday,
        property_like_count: likeCount,
        property_like_yesterday: propertyLikeYesterday,
        property_view_count: viewCount,
        property_view_yesterday: propertyViewYesterday,
        property_comment_count: commentCount,
        property_comment_yesterday: propertCommentYesterday,
        active_developer: activeDeveloper,
        active_agency: activeAgency,
        property_visit_count: visitCount,
        property_visit_yesterday: propertVisitYesterday,
        chartResponseData: chartResponseData
    }
    response.success(res, res.__('messages.dashboardList'), responseData);
    // } catch (error) {
    //     response.serverError(res, error);
    // }
}



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
