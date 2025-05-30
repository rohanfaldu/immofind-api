import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import response from '../components/utils/response.js';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from 'firebase/firestore';
import { firebaseConfigration } from '../middleware/firebaseConfigration.js';

dayjs.extend(relativeTime);
const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
    const { userId, page = 1, limit = 10 } = req.body;
    const collectionName = process.env.FIRBASE_COLLECTION_NAME;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

   // try {
        const lang = res.getLocale();
        const userInfo = await prisma.users.findFirst({
            where: { id: userId },
            include: { roles: { select: { name: true } } },
        });

        const userRole = userInfo?.roles?.name || null;
        const chatCollectionRef = collection(firebaseConfigration, collectionName);

        let chatQuery = query(chatCollectionRef, orderBy('last_activity', 'desc'));
        if (userRole === 'developer') {
            chatQuery = query(chatCollectionRef, where('developer_id', '==', userId), orderBy('last_activity', 'desc'));
        } else if (userRole === 'agent') {
            chatQuery = query(chatCollectionRef, where('agency_id', '==', userId), orderBy('last_activity', 'desc'));
        }

        const chatDocs = await getDocs(chatQuery);
        const chatMessages = [];

        for (const chatDoc of chatDocs.docs) {
            const innerChats = await getDocs(collection(chatDoc.ref, 'chat'));

            for (const chat of innerChats.docs) {
                const data = chat.data();
                console.log(data, 'data');
                if (data.datetime?.seconds) {
                    const isoDatetime = new Date(data.datetime.seconds * 1000).toISOString();

                    chatMessages.push({
                        id: chat.id,
                        title: data.chat || '',
                        datetime: isoDatetime,
                        timeAgo: dayjs(isoDatetime).fromNow(),
                        timestamp: data.datetime.seconds,
                        created_at: new Date(isoDatetime),
                        source: 'chat',
                    });
                }
            }
        }

        // Sort by timestamp (newest first)
        chatMessages.sort((a, b) => b.timestamp - a.timestamp);
       
            const notifications = await prisma.notification.findMany({
                where: { user_id: userId, status: true },
                orderBy: { created_at: 'desc' },
                include: {
                    lang_translations_notification: {
                        select: { en_string: true, fr_string: true },
                    },
                },
            });

            const formattedNotifications = notifications.map((notif) => {
                const trans = notif.lang_translations_notification;
                const title = lang === 'fr'
                    ? trans?.fr_string || trans?.en_string || 'Unknown'
                    : trans?.en_string || trans?.fr_string || 'Unknown';

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

        

        const mergedData = [...formattedNotifications, ...chatMessages].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        // Pagination logic
        const totalCount = mergedData.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const paginatedData = mergedData.slice(start, start + parseInt(limit));
        const totalPages = Math.ceil(totalCount / limit);

        return response.success(res, res.__('messages.Data retrieved successfully.'), {
            notifications: paginatedData,
            pagination: {
                totalCount,
                totalPages,
                currentPage: parseInt(page),
                pageSize: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPreviousPage: parseInt(page) > 1,
            },
        });
    // } catch (error) {
    //     console.error('Error fetching notifications:', error);
    //     return response.serverError(res, res.__('messages.Server error'), error);
    // }
};