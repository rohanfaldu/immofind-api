import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import response from '../components/utils/response.js';
import { getFirestore, collection, getDocs, doc, query, where, serverTimestamp, onSnapshot, orderBy, limit } from "firebase/firestore";
import { firebaseConfigration } from '../middleware/firebaseConfigration.js';

dayjs.extend(relativeTime);
const prisma = new PrismaClient();

export const getChatMessages = async (req, res) => {
    const { userId, page = 1, limit = 10 } = req.body;
    const collectionName = process.env.FIRBASE_COLLECTION_NAME;

    try {
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const lang = res.getLocale();

        const userInfo = await prisma.users.findFirst({
            where: {
                id: userId
            },
            include: {
                roles: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const userRole = (userInfo) ? userInfo.roles.name : null;
        let chatCollectionRef = collection(firebaseConfigration, collectionName);
        let q;

        if (userRole === "developer") {
            q = query(
                chatCollectionRef,
                where("developer_id", "==", userId),
                orderBy("last_activity", "desc")
            );
        } else if (userRole === "agent") {
            q = query(
                chatCollectionRef,
                where("agency_id", "==", userId),
                orderBy("last_activity", "desc")
            );
        } else {
            q = query(
                chatCollectionRef,
                orderBy("last_activity", "desc")
            );
        }

        const querySnapshot = await getDocs(q);
        const userChatList = [];
        const onlyUserChatList = [];

        // console.log(querySnapshot, '>>>>>>>>>>>>>>>>>querySnapshot');

        // Collect all chat messages
        for (const chatDoc of querySnapshot.docs) {
            const innerCollectionRef = collection(chatDoc.ref, "chat");
            const innerQuerySnapshot = await getDocs(innerCollectionRef);
            // console.log(innerQuerySnapshot, '>>>>>>>>>>>>>>>>>querySnapshot');
            innerQuerySnapshot.forEach(async (innerDoc) => {
                const innerData = innerDoc.data();
                let datetimeValue = null;

                if (innerData.datetime && innerData.datetime.seconds) {
                    const dateObj = new Date(innerData.datetime.seconds * 1000);
                    datetimeValue = dateObj.toISOString();
                }

                const userInfo = await prisma.users.findFirst({
                    where: { id: innerData.from },
                    include: {
                        roles: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
                 console.log(userInfo, ' >>> userInfo')

                if (datetimeValue) {
                    userChatList.push({
                        id: innerDoc.id,
                        title: innerData.chat || "",
                        datetime: datetimeValue,
                        timeAgo: datetimeValue ? dayjs(datetimeValue).fromNow() : null,
                        timestamp: innerData.datetime.seconds // Keep original timestamp for sorting
                    });
                }
                if (datetimeValue) {
                    onlyUserChatList.push({
                        id: innerDoc.id,
                        title: innerData.chat || "",
                        image: userInfo.image,
                        userName: userInfo.full_name || "",
                        datetime: datetimeValue,
                        timeAgo: datetimeValue ? dayjs(datetimeValue).fromNow() : null,
                        timestamp: innerData.datetime.seconds // Keep original timestamp for sorting
                    });
                }
            });
        }
        // Sort by datetime in descending order (newest first) - no pagination here yet
        userChatList.sort((a, b) => b.timestamp - a.timestamp);

        // Apply pagination variables
        const validPage = parseInt(page, 10) || 1;
        const validLimit = parseInt(limit, 10) || 10;

        // Get notifications from database
        const notifications = await prisma.notification.findMany({
            where: {
                user_id: userId,
                status: true,
            },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                lang_translations_notification: {
                    select: {
                        en_string: true,
                        fr_string: true,
                    },
                },
            },
        });

        const formattedNotifications = notifications.map((notif) => {
            const translation = notif.lang_translations_notification;

            const title = lang === 'fr'
                ? translation?.fr_string || translation?.en_string || 'Unknown'
                : translation?.en_string || translation?.fr_string || 'Unknown';

            return {
                id: notif.id,
                image: null,
                title,
                timeAgo: notif.created_at ? dayjs(notif.created_at).fromNow() : null,
                url: notif.url || null,
                type: notif.type,
                action: notif.action,
                created_at: notif.created_at,
                source: 'notification'
            };
        });

        // Add source and created_at to chat messages for merging
        const chatWithSource = userChatList.map(chat => ({
            ...chat,
            source: 'chat',
            created_at: new Date(chat.datetime)
        }));

        // Merge both arrays
        const mergedData = [...formattedNotifications, ...chatWithSource];

        // Sort merged data by created_at/datetime in descending order
        mergedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination to merged data
        const totalCount = mergedData.length;
        const startIndex = (validPage - 1) * validLimit;
        const endIndex = startIndex + validLimit;
        const paginatedData = mergedData.slice(startIndex, endIndex);

        const totalPages = Math.ceil(totalCount / validLimit);
       // console.log(onlyUserChatList, '>>>>>>>>>>>>>>>>>>onlyUserChatList');
        return response.success(res, res.__('messages.Data retrieved successfully.'), {
            notifications: paginatedData,
            chatUserData: onlyUserChatList,
            pagination: {
                totalCount,
                totalPages,
                currentPage: validPage,
                pageSize: validLimit,
                hasNextPage: validPage < totalPages,
                hasPreviousPage: validPage > 1
            }
        });

    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return response.serverError(res, res.__('messages.Server error'), error);
    }
};