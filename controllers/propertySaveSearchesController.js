import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import { validate as isUUID } from "uuid";

const prisma = new PrismaClient();
import slugify from 'slugify';


export const savePropertySaveSearches = async (req, res) => {
    try {
        // Log the incoming request body for debugging
        console.log('Request Body:', req.body);

        const {
            title = null,
            description = null,
            city_id = null,
            district_id = null,
            neighborhoods_id = null,
            address = null,
            type_id = null,
            min_price = null, // Default to null if not provided
            max_price = null,
            min_size = null,
            max_size = null,
            direction = null,
            developer_id = null,
            transaction = null,
            amenities_type_boolean = [], // Default to empty array
            amenities_type_number = {}, // Default to empty object
        } = req.body;

        await prisma.PropertySaveSearches.create({
            data: {
                title,
                description,
                city_id,
                district_id,
                neighborhoods_id,
                address,
                type: type_id,
                min_price,
                max_price,
                min_size,
                max_size,
                direction,
                developer_id,
                transaction,
                amenities_type_boolean,
                amenities_type_number,
                user_id: req.user?.id || null, // Handle user_id gracefully
                created_at: new Date(),
                created_by: req.user?.id || null, // Handle created_by gracefully
            },
        });

        return await response.success(res, res.__('messages.propertySearchesSavedSuccessfully'));
    } catch (error) {
        console.error('Error creating property:', error);
        return await response.serverError(res, res.__('messages.errorCreatingProperty'));
    }
}


export const getPropertySaveSearches = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            user_id = null,
          } = req.body;
      
        const lang = res.getLocale(); // Only once!
        
        if (!isUUID(user_id)) {
            return await response.badRequest(res, res.__('messages.invalidIdFormat'));
        }

        // Safely parse and validate page/limit
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNumber - 1) * limitNumber;
    
        const totalCount = await prisma.propertySaveSearches.count({ where: {user_id} });

        // Validate the ID format
        
        const propertySaveSearches = await prisma.propertySaveSearches.findMany({
            where: { user_id },
        });

        if (!propertySaveSearches) {
            return await response.notFound(res, res.__('messages.propertyNotFound'));
        }

        const totalPages = Math.ceil(totalCount / limitNumber);

        // Send final response
        return response.success(res, res.__('messages.blogListFetched'), {
          totalCount: totalCount,
          totalPages,
          currentPage: pageNumber,
          limit: limitNumber,
          list: propertySaveSearches
        });
    } catch (error) {
        console.error('Error fetching property:', error);
        return await response.serverError(res, res.__('messages.errorFetchingProperty'));
    }
}