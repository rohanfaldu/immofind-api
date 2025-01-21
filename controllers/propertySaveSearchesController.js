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


