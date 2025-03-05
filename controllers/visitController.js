import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";

const prisma = new PrismaClient();

export const visitSchedule = async (req, res) => {
    const { propertyId, dateAndTime, visitType, property_publisher_id } = req.body;
    const userId = req.user.id;

    try {
        await prisma.propertyVisit.create({
            data: {
                property_id: propertyId,
                scheduled_date: dateAndTime,
                visit_type: visitType,
                user_id: userId,
                property_publisher: property_publisher_id,
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


export const getVisitSchedule = async (req, res) => {

    const { page, limit, startDate, endDate } = req.body;

    
    try {

        const validPage = Math.max(1, parseInt(page, 10));
        const validLimit = Math.max(1, parseInt(limit, 10));
    
        const skip = (validPage - 1) * validLimit;

        let dateFilter = {};
            if (startDate && endDate) {
            dateFilter = {
                scheduled_date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const totalCount = await prisma.propertyVisit.count({
            where: {
              ...dateFilter,
            },
        });


        const visitSchedule = await prisma.propertyVisit.findMany({
            skip,
            take: validLimit,
            orderBy:{
              created_at: 'desc',
            },
            where: {...dateFilter},
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        lang_translations: {
                            select: {
                                en_string: true,
                                fr_string: true,
                            },
                        },
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email_address: true,
                            },
                        }
                    },
                },
                users: true
            }
        });

        const responsePayload = {
            list: visitSchedule,
            totalCount,
            totalPages: Math.ceil(totalCount / validLimit),
            currentPage: validPage,
            itemsPerPage: validLimit,
          };
        // const visitScheduleResponse = visitSchedule.map((visit) => {
        //     const title = visit.lang_translations.en_string;
               
                
        // })
        return response.success(
        res,
        res.__('messages.listFetchedSuccessfully'),
        responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,    
        res.__('messages.internalServerError')
        );
    }
}


export const getUserVisitSchedule = async (req, res) => {

    const { page, limit, startDate, endDate } = req.body;

    
    try {

        const validPage = Math.max(1, parseInt(page, 10));
        const validLimit = Math.max(1, parseInt(limit, 10));
    
        const skip = (validPage - 1) * validLimit;

        let dateFilter = {};
            if (startDate && endDate) {
            dateFilter = {
                scheduled_date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const totalCount = await prisma.propertyVisit.count({
            where: {
              ...dateFilter,
            },
        });


        const visitSchedule = await prisma.propertyVisit.findMany({
            skip,
            take: validLimit,
            orderBy:{
              created_at: 'desc',
            },
            where: {...dateFilter, user_id: req.user.id},
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        lang_translations: {
                            select: {
                                en_string: true,
                                fr_string: true,
                            },
                        },
                        price: true,
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email_address: true,
                            },
                        }
                    },
                },
                users: true
            }
        });

        const responsePayload = {
            list: visitSchedule,
            totalCount,
            totalPages: Math.ceil(totalCount / validLimit),
            currentPage: validPage,
            itemsPerPage: validLimit,
          };
        // const visitScheduleResponse = visitSchedule.map((visit) => {
        //     const title = visit.lang_translations.en_string;
               
                
        // })
        return response.success(
        res,
        res.__('messages.listFetchedSuccessfully'),
        responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,    
        res.__('messages.internalServerError')
        );
    }
}

export const getAcceptedVisitSchedule = async (req, res) => {
    const { page, limit, startDate, endDate } = req.body;
    try {
        const validPage = Math.max(1, parseInt(page, 10));
        const validLimit = Math.max(1, parseInt(limit, 10));
    
        const skip = (validPage - 1) * validLimit;

        let dateFilter = {};
            if (startDate && endDate) {
            dateFilter = {
                scheduled_date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const totalCount = await prisma.propertyVisit.count({
            where: {
              ...dateFilter,
              is_accepted: true,
              property_publisher: req.user.id
            },
        });


        const visitSchedule = await prisma.propertyVisit.findMany({
            skip,
            take: validLimit,
            orderBy:{
              created_at: 'desc',
            },
            where: {...dateFilter, is_accepted: true, property_publisher: req.user.id},
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        lang_translations: {
                            select: {
                                en_string: true,
                                fr_string: true,
                            },
                        },
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email_address: true,
                            },
                        }
                    },
                },
                users: true
            }
        });

        const responsePayload = {
            list: visitSchedule,
            totalCount,
            totalPages: Math.ceil(totalCount / validLimit),
            currentPage: validPage,
            itemsPerPage: validLimit,
          };
        // const visitScheduleResponse = visitSchedule.map((visit) => {
        //     const title = visit.lang_translations.en_string;
               
                
        // })
        return response.success(
        res,
        res.__('messages.listFetchedSuccessfully'),
        responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,    
        res.__('messages.internalServerError')
        );
    }
}
export const getPendingVisitScheduleForCreators = async (req, res) => {
    const { page, limit, startDate, endDate } = req.body;
    try {
        const validPage = Math.max(1, parseInt(page, 10));
        const validLimit = Math.max(1, parseInt(limit, 10));
    
        const skip = (validPage - 1) * validLimit;

        let dateFilter = {};
            if (startDate && endDate) {
            dateFilter = {
                scheduled_date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const totalCount = await prisma.propertyVisit.count({
            where: {
              ...dateFilter,
              is_accepted: false,
              decline_permanent: false,
              property_publisher: req.user.id
            },
        });


        const visitSchedule = await prisma.propertyVisit.findMany({
            skip,
            take: validLimit,
            orderBy:{
              created_at: 'desc',
            },
            where: {...dateFilter, is_accepted: false, decline_permanent: false, property_publisher: req.user.id},
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        lang_translations: {
                            select: {
                                en_string: true,
                                fr_string: true,
                            },
                        },
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email_address: true,
                            },
                        }
                    },
                },
                users: true
            }
        });

        const responsePayload = {
            list: visitSchedule,
            totalCount,
            totalPages: Math.ceil(totalCount / validLimit),
            currentPage: validPage,
            itemsPerPage: validLimit,
          };
        // const visitScheduleResponse = visitSchedule.map((visit) => {
        //     const title = visit.lang_translations.en_string;
               
                
        // })
        return response.success(
        res,
        res.__('messages.listFetchedSuccessfully'),
        responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,    
        res.__('messages.internalServerError')
        );
    }
}
export const getRejectedVisitScheduleForCreators = async (req, res) => {
    const { page, limit, startDate, endDate } = req.body;
    try {
        const validPage = Math.max(1, parseInt(page, 10));
        const validLimit = Math.max(1, parseInt(limit, 10));
    
        const skip = (validPage - 1) * validLimit;

        let dateFilter = {};
            if (startDate && endDate) {
            dateFilter = {
                scheduled_date: {
                gte: new Date(startDate), // Greater than or equal to start date
                lte: new Date(endDate),   // Less than or equal to end date
                },
            };
        }

        const totalCount = await prisma.propertyVisit.count({
            where: {
              ...dateFilter,
              is_accepted: false,
              decline_permanent: true,
              property_publisher: req.user.id
            },
        });


        const visitSchedule = await prisma.propertyVisit.findMany({
            skip,
            take: validLimit,
            orderBy:{
              created_at: 'desc',
            },
            where: {...dateFilter, is_accepted: false, decline_permanent: true, property_publisher: req.user.id},
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        lang_translations: {
                            select: {
                                en_string: true,
                                fr_string: true,
                            },
                        },
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email_address: true,
                            },
                        }
                    },
                },
                users: true
            }
        });

        const responsePayload = {
            list: visitSchedule,
            totalCount,
            totalPages: Math.ceil(totalCount / validLimit),
            currentPage: validPage,
            itemsPerPage: validLimit,
          };
        // const visitScheduleResponse = visitSchedule.map((visit) => {
        //     const title = visit.lang_translations.en_string;
               
                
        // })
        return response.success(
        res,
        res.__('messages.listFetchedSuccessfully'),
        responsePayload
        );
    } catch (error) {
        console.error(error);
        return response.error(
        res,    
        res.__('messages.internalServerError')
        );
    }
}

export const acceptPendingVisit = async (req, res) => {
    const { visitId } = req.body;
    try {
        const visit = await prisma.propertyVisit.update({
            where: { id: visitId },
            data: {
                is_accepted: true,
                is_accepted: true,
            },
        });

        return response.success(
            res,    
            res.__('messages.visitAcceptedSuccessfully'),
            visit
        );
        } catch (error) {
            console.error(error);
            return response.error(
                res,    
                res.__('messages.internalServerError')
            );
    }
}

export const declinePendingVisit = async (req, res) => {
    const { visitId } = req.body;
    try {
        const visit = await prisma.propertyVisit.update({
            where: { id: visitId },
            data: {
                decline_permanent: true,
            },
        });

        return response.success(    
            res,    
            res.__('messages.visitDeclinedSuccessfully'),
            visit
        );
        } catch (error) {
            console.error(error);
            return response.error(
                res,    
                res.__('messages.internalServerError')
            );
        }
}


export const visitReschedule = async (req, res) => {
    const { visitId, dateAndTime, visitType } = req.body;
    try {
        const visit = await prisma.propertyVisit.update({
            where: { id: visitId },
            data: {
                scheduled_date: dateAndTime,
                visit_type: visitType,
            },
        });

        return response.success(    
            res,    
            res.__('messages.visitDeclinedSuccessfully'),
            visit
        );
        } catch (error) {
            console.error(error);
            return response.error(
                res,    
                res.__('messages.internalServerError')
            );
        }
}