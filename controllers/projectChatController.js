import { PrismaClient } from '@prisma/client';
import response from "../components/utils/response.js";
import { validate as isUuid } from 'uuid';
const prisma = new PrismaClient();



export const createProjectChat = async (req, res) => {
    try {
        const { property_id, user_id } = req.body;

        if (!property_id || !user_id) {
            return await response.error(res, res.__('messages.fieldError'));
        }

        if (!isUuid(property_id) || !isUuid(user_id)) {
            return await response.error(res, res.__('messages.invalidIdFormat'));
        }

        const chatPropertyCount = await prisma.propertyChat.findFirst({
            where: {
                property_id,
                user_id,
            },
        });

        if (chatPropertyCount) {
            const updateChatCount = await prisma.propertyChat.update({
                where: {
                    id: chatPropertyCount.id
                },
                data: {
                    count: chatPropertyCount.count + 1,
                    updated_at: new Date(),
                },
            });

            return await response.success(
                res,
                res.__('messages.chatCreatedSuccessfully'),
                updateChatCount
            );
        } else {
            const createChatCount = await prisma.propertyChat.create({
                data: {
                    property_id,
                    user_id,
                    count: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            });
            return await response.success(
                res,
                res.__('messages.chatCreatedSuccessfully'),
                createChatCount
            );
        }

    } catch (error) {
        console.error(error);
        return await response.error(
            res,
            res.__('messages.internalServerError'),
            { message: error.message }
        );
    }
}