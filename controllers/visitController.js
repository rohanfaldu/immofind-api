import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";

const prisma = new PrismaClient();

export const visitSchedule = async (req, res) => {
    const { propertyId, dateAndTime, visitType } = req.body;
    const userId = req.user.id;

    try {
        await prisma.propertyVisit.create({
            data: {
                property_id: propertyId,
                scheduled_date: dateAndTime,
                visit_type: visitType,
                user_id: userId,
                created_at: new Date(),
            },
        });

        return response.success(
        res,
        res.__('messages.propertyVisitScheduledSuccessfully'),
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,
        res.__('messages.internalServerError')
        );
    }
}