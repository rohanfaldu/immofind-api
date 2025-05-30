import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";
import { startOfWeek, eachDayOfInterval, format } from 'date-fns';
import { startOfMonth, endOfMonth, endOfWeek, endOfDay } from 'date-fns';
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
  try {
    const userId = req.user.id;
    const userInfo = await commonFunction.getLoginUser(userId);
    const isAdmin = userInfo === 'admin';
    
    // Define date ranges once
    const dateRanges = await commonFunction.getDateRanges();
    const whereCondition = isAdmin ? {} : { user_id: userId };
    
    // Execute all database queries in parallel
    const [
      userCounts,
      projectCounts,
      propertyCounts,
      engagementCounts,
      chartData,
      weeklyData
    ] = await Promise.all([
      getUserCounts(),
      getProjectCounts(whereCondition, dateRanges),
      getPropertyCounts(whereCondition, dateRanges),
      getEngagementCounts(userId, whereCondition, dateRanges),
      getChartData(userId, dateRanges),
      getWeeklyVisitChatData(dateRanges)
    ]);

    // Calculate conversation rate
    const conversationRate = engagementCounts.visitCount > 0 
      ? ((engagementCounts.visitCount - engagementCounts.totalChatCount) / engagementCounts.visitCount * 100).toFixed(2)
      : 0;

    // Prepare response
    const responseData = {
      total_users: userCounts.totalUsersCount,
      project_yesterday: await commonFunction.dashboardYesterdayCount(
        projectCounts.yesterdayProjectCount, 
        projectCounts.todayProjectCount
      ),
      project_count: projectCounts.totalProjectCount,
      property_count: propertyCounts.totalPropertyCount,
      property_yesterday: await commonFunction.dashboardYesterdayCount(
        propertyCounts.yesterdayPropertyCount, 
        propertyCounts.todayPropertyCount
      ),
      property_like_count: engagementCounts.likeCount,
      property_like_yesterday: await commonFunction.dashboardYesterdayCount(
        engagementCounts.yesterdayPropertyLikeCount, 
        engagementCounts.todayPropertyLikeCount
      ),
      property_view_count: engagementCounts.viewCount,
      property_view_yesterday: await commonFunction.dashboardYesterdayCount(
        engagementCounts.yesterdayPropertyViewCount, 
        engagementCounts.todayPropertyViewCount
      ),
      property_comment_count: engagementCounts.commentCount,
      property_comment_yesterday: await commonFunction.dashboardYesterdayCount(
        engagementCounts.yesterdayPropertyCommentCount, 
        engagementCounts.todayPropertyCommentCount
      ),
      active_developer: userCounts.activeDeveloper,
      active_agency: userCounts.activeAgency,
      property_visit_count: engagementCounts.visitCount,
      property_chat_count: engagementCounts.totalChatCount,
      conversation_rate: parseFloat(conversationRate),
      property_visit_yesterday: await commonFunction.dashboardYesterdayCount(
        engagementCounts.yesterdayPropertyVisitCount, 
        engagementCounts.todayPropertyVisitCount
      ),
      chart_response_data: chartData,
      lead_info: weeklyData
    };

    response.success(res, res.__('messages.dashboardList'), responseData);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    response.serverError(res, error);
  }
};

// Helper function to define all date ranges


// Optimized user counts query
const getUserCounts = async() => {
  const [totalUsersCount, userRoleCounts, activeDeveloper, activeAgency] = await Promise.all([
    prisma.users.count(),
    prisma.users.groupBy({
      by: ['role_id'],
      where: {
        roles: {
          name: { in: ['user', 'agency', 'developer'] }
        }
      },
      _count: true
    }),
    prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba688f" } }),
    prisma.users.count({ where: { role_id: "c326e1e2-6f82-4af4-ba25-06029eba6569" } })
  ]);

  return {
    totalUsersCount,
    activeDeveloper,
    activeAgency
  };
}

// Optimized project counts
const getProjectCounts = async (whereCondition, dateRanges) => {
  const { today, tomorrow, yesterday } = dateRanges;
  
  const [totalProjectCount, todayProjectCount, yesterdayProjectCount] = await Promise.all([
    prisma.projectDetails.count({ where: whereCondition }),
    prisma.projectDetails.count({
      where: {
        ...whereCondition,
        created_at: { gte: today, lt: tomorrow }
      }
    }),
    prisma.projectDetails.count({
      where: {
        ...whereCondition,
        created_at: { gte: yesterday, lt: today }
      }
    })
  ]);

  return { totalProjectCount, todayProjectCount, yesterdayProjectCount };
}

// Optimized property counts
const getPropertyCounts = async (whereCondition, dateRanges) => {
  const { today, tomorrow, yesterday } = dateRanges;
  
  const [totalPropertyCount, todayPropertyCount, yesterdayPropertyCount] = await Promise.all([
    prisma.propertyDetails.count({ where: { ...whereCondition, status: true } }),
    prisma.propertyDetails.count({
      where: {
        ...whereCondition,
        created_at: { gte: today, lt: tomorrow }
      }
    }),
    prisma.propertyDetails.count({
      where: {
        ...whereCondition,
        created_at: { gte: yesterday, lt: today }
      }
    })
  ]);

  return { totalPropertyCount, todayPropertyCount, yesterdayPropertyCount };
}

// Optimized engagement counts (likes, views, comments, visits)
const getEngagementCounts = async (userId, whereCondition, dateRanges) => {
  const { today, tomorrow, yesterday } = dateRanges;
  
  const engagementQueries = [
    // Total counts
    prisma.propertyLike.count({ where: { property_publisher: userId } }),
    prisma.propertyView.count({ where: { property_publisher: userId } }),
    prisma.propertyComment.count({ where: { property_owner_id: userId } }),
    prisma.propertyVisit.count({}),
    prisma.propertyChat.count({}),
    
    // Today counts
    prisma.propertyLike.count({
      where: { ...whereCondition, created_at: { gte: today, lt: tomorrow } }
    }),
    prisma.propertyView.count({
      where: { ...whereCondition, created_at: { gte: today, lt: tomorrow } }
    }),
    prisma.propertyComment.count({
      where: { ...whereCondition, created_at: { gte: today, lt: tomorrow } }
    }),
    prisma.propertyVisit.count({
      where: { ...whereCondition, created_at: { gte: today, lt: tomorrow } }
    }),
    
    // Yesterday counts
    prisma.propertyLike.count({
      where: { ...whereCondition, created_at: { gte: yesterday, lt: today } }
    }),
    prisma.propertyView.count({
      where: { ...whereCondition, created_at: { gte: yesterday, lt: today } }
    }),
    prisma.propertyComment.count({
      where: { ...whereCondition, created_at: { gte: yesterday, lt: today } }
    }),
    prisma.propertyVisit.count({
      where: { ...whereCondition, created_at: { gte: yesterday, lt: today } }
    })
  ];

  const [
    likeCount, viewCount, commentCount, visitCount, totalChatCount,
    todayPropertyLikeCount, todayPropertyViewCount, todayPropertyCommentCount, todayPropertyVisitCount,
    yesterdayPropertyLikeCount, yesterdayPropertyViewCount, yesterdayPropertyCommentCount, yesterdayPropertyVisitCount
  ] = await Promise.all(engagementQueries);

  return {
    likeCount, viewCount, commentCount, visitCount, totalChatCount,
    todayPropertyLikeCount, todayPropertyViewCount, todayPropertyCommentCount, todayPropertyVisitCount,
    yesterdayPropertyLikeCount, yesterdayPropertyViewCount, yesterdayPropertyCommentCount, yesterdayPropertyVisitCount
  };
}

// Optimized chart data generation
const getChartData = async (userId, dateRanges) => {
  const { allMonths, startMonth, endMonth } = dateRanges;
  
  // Get Firebase data in parallel
  const collectionName = process.env.FIRBASE_COLLECTION_NAME;
  const [countMonthly, countWeekly, countDaily] = await Promise.all([
    getMonthlyCountsFromFirebase(collectionName),
    getWeeklyCountsFromFirebase(collectionName),
    getDailyCountsForRange(collectionName)
  ]);

  // Generate monthly data
  const [monthlyLikes, monthlyComments] = await Promise.all([
    getMonthlyEngagementData(userId, allMonths, 'propertyLike', 'property_publisher'),
    getMonthlyEngagementData(userId, allMonths, 'propertyComment', 'property_owner_id')
  ]);

  // Generate weekly data
  const weeklyData = await getWeeklyEngagementData(userId, startMonth, endMonth);
  
  // Generate daily data
  const dailyData = await getDailyEngagementData(userId, startMonth, endMonth);

  const monthlyLabels = allMonths.map(date =>
    date.toLocaleString("default", { month: "short" })
  );

  return {
    daily: {
      labels: dailyData.labels,
      likes: dailyData.likes,
      comments: dailyData.comments,
      chat: countDaily,
    },
    weekly: {
      labels: weeklyData.labels,
      likes: weeklyData.likes,
      comments: weeklyData.comments,
      chat: countWeekly
    },
    monthly: {
      labels: monthlyLabels,
      likes: monthlyLikes,
      comments: monthlyComments,
      chat: countMonthly,
    }
  };
}

// Helper function for monthly engagement data
const getMonthlyEngagementData = async (userId, allMonths, table, userField) => {
  return Promise.all(
    allMonths.map(async (monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      return await prisma[table].count({
        where: {
          [userField]: userId,
          created_at: { gte: monthStart, lte: monthEnd },
        },
      });
    })
  );
}

// Helper function for weekly engagement data
const getWeeklyEngagementData = async (userId, startMonth, endMonth) => {
  const weeklyLikes = [];
  const weeklyComments = [];
  const weeklyLabels = [];
  let weekStart = startMonth;

  while (weekStart <= endMonth) {
    const weekEnd = new Date(Math.min(addDays(weekStart, 6).getTime(), endMonth.getTime()));
    
    const [likeCount, commentCount] = await Promise.all([
      prisma.propertyLike.count({
        where: {
          property_publisher: userId,
          created_at: { gte: weekStart, lt: addDays(weekEnd, 1) },
        },
      }),
      prisma.propertyComment.count({
        where: {
          property_owner_id: userId,
          created_at: { gte: weekStart, lt: addDays(weekEnd, 1) },
        },
      })
    ]);

    weeklyLikes.push(likeCount);
    weeklyComments.push(commentCount);
    weeklyLabels.push(`${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);
    
    weekStart = addDays(weekStart, 7);
  }

  return { labels: weeklyLabels, likes: weeklyLikes, comments: weeklyComments };
}

// Helper function for daily engagement data
const getDailyEngagementData = async (userId, startMonth, endMonth) => {
  const dailyLikes = [];
  const dailyComments = [];
  const dailyLabels = [];
  let day = startOfDay(startMonth);

  const dailyPromises = [];
  const days = [];
  
  while (!isAfter(day, endMonth)) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }

  const dailyData = await Promise.all(
    days.map(async (currentDay) => {
      const nextDay = addDays(currentDay, 1);
      
      const [likeCount, commentCount] = await Promise.all([
        prisma.propertyLike.count({
          where: {
            property_publisher: userId,
            created_at: { gte: currentDay, lt: nextDay },
          },
        }),
        prisma.propertyComment.count({
          where: {
            property_owner_id: userId,
            created_at: { gte: currentDay, lt: nextDay },
          },
        })
      ]);

      return {
        likes: likeCount,
        comments: commentCount,
        label: currentDay.toLocaleDateString()
      };
    })
  );

  return {
    likes: dailyData.map(d => d.likes),
    comments: dailyData.map(d => d.comments),
    labels: dailyData.map(d => d.label)
  };
}

// Optimized weekly visit and chat data
const getWeeklyVisitChatData = async (dateRanges) => {
  const { startWeekStart, weekEnd } = dateRanges;
  
  const weekDays = eachDayOfInterval({
    start: startWeekStart,
    end: weekEnd
  });

  const labels = weekDays.map(day => format(day, 'd MMM'));

  const [visitData, chatData] = await Promise.all([
    Promise.all(
      weekDays.map(async (day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        return await prisma.propertyVisit.count({
          where: { created_at: { gte: dayStart, lte: dayEnd } }
        });
      })
    ),
    Promise.all(
      weekDays.map(async (day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        return await prisma.propertyChat.count({
          where: { created_at: { gte: dayStart, lte: dayEnd } }
        });
      })
    )
  ]);

  return {
    visit: { labels, visitData },
    chat: { labels, data: chatData }
  };
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
