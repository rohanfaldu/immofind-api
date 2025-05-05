import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();
const prisma = new PrismaClient();
const getPropertyMetaByKey = async (metaDetails) => {
    return metaDetails
        .filter(meta => meta.property_type_listings?.type === "number");
}
const commonFunction = {
    capitalize: async (str) => {
        const text = str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        console.log(text);
        return text;
    },
    checkPhonember: async (phone) => {
        const phoneNumber = phone.toString();

        if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
            return true;
        } else {
            return false;
        }
    },
    bigIntiger: async (userInfo) => {
        return JSON.parse(
            JSON.stringify(userInfo, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );
    },
    getRole: async (role) => {
        switch (role) {
            case 'developer':
                return 'developer';
            case 'agency':
                return 'agency';
            default:
                return 'user';
        }
        const msg = message.replace(/'/g, "\\'");
        return msg;
    },
    checkDeviceType: async (deviceType) => {
        switch (deviceType) {
            case 'app':
                return 'app';
            case 'web':
                return 'web';
            default:
                return '';
        }
    },
    getLoginUser: async (id) => {
        const loginUserInfo = await prisma.users.findFirst({
            where: {
                id: id
            },
            include: { roles: true }
        });
        if (loginUserInfo) {
            return loginUserInfo.roles.name;
        } else {
            return 'admin';
        }
    },

    pagination: async (page, limit, where, orderBy, include, tableName) => {
        try {
            const validPage = Math.max(1, parseInt(page, 10) || 1);
            const validLimit = Math.max(1, parseInt(limit, 10) || 10);
            const skip = (validPage - 1) * validLimit;

            const totalCount = await prisma[tableName].count({
                where,
            });

            const finding = await prisma[tableName].findMany({
                skip,
                take: validLimit,
                orderBy,
                where,
                include,
            });

            return { totalCount, validPage, validLimit, finding };
        } catch (error) {
            console.error(`Error in pagination for ${tableName}:`, error);
            throw error; // Rethrow the error to be handled in the calling function
        }
    },

    langCondition: async (field, res) => {
        const lang = res.getLocale();
        return {
            [lang === 'fr' ? 'fr_string' : 'en_string']: {
                contains: field,
                mode: 'insensitive',
            },
        }
    },
    calculatePriceScore: async (price, minPrice, maxPrice) => {
        if (price >= minPrice && price <= maxPrice) {
            return 100;
        } else if (price > maxPrice) {
            const percentAbove = ((price - maxPrice) / maxPrice) * 100;
            return (100 - percentAbove >= 90) ? 100 - percentAbove : 0;
        } else {
            const percentBelow = ((minPrice - price) / minPrice) * 100;
            return (100 - percentBelow >= 90) ? 100 - percentBelow : 0;
        }
    },
    calculateSurfaceScore: async (value, min, max) => {
        const updatMinSize = min ?? 0;
        if (value >= updatMinSize && value <= max) {
            return 100;
        } else if (value > max) {
            const percentAbove = ((value - max) / max) * 100;
            return (100 - percentAbove >= 90) ? 100 - percentAbove : 0;
        } else {
            const percentBelow = ((updatMinSize - value) / updatMinSize) * 100;
            return (100 - percentBelow >= 90) ? 100 - percentBelow : 0;
        }
    },
    calculateAmenitiesScore: async (propertyMetaDetails, amenitiesIdArray) => {
        let score = 100;

        if (
            propertyMetaDetails &&
            Array.isArray(amenitiesIdArray) &&
            amenitiesIdArray.length > 0
        ) {
            const booleanIdsSet = new Set(
                propertyMetaDetails
                    .filter(meta => meta.property_type_listings?.type === "boolean")
                    .map(meta => meta.property_type_listings?.id)
            );

            const matchedAmenities = amenitiesIdArray.filter(id => booleanIdsSet.has(id));
            score = Math.round((matchedAmenities.length / amenitiesIdArray.length) * 100);
        }
        return score;
    },
    calculateLocationScore: async (propertyLat, propertyLng, filterLat, filterLng) => {
        let score = 100;

        if (propertyLat && propertyLng && filterLat && filterLng) {
            try {
                const R = 6371; // Radius of Earth in km
                const lat1 = parseFloat(filterLat);
                const lon1 = parseFloat(filterLng);
                const lat2 = parseFloat(propertyLat);
                const lon2 = parseFloat(propertyLng);
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) ** 2;
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c;

                // Custom scoring: within 9 km = decreasing score, max score for <= 1 km
                score = distance <= 9 ? ((10 - distance) * 10) * 0.25 : 0;
            } catch (error) {
                score = 0;
            }
        }

        return score;
    },
    calculateRoomAmenitiesScore: async (propertyMetaDetails, amenitiesIdObjectWithValue) => {
        if (!propertyMetaDetails) {
            console.error("propertyMetaDetails is undefined");
            return 0;
          }
        
          if (!amenitiesIdObjectWithValue || Object.keys(amenitiesIdObjectWithValue).length === 0) {
            return 100;
          }
        
          const bedRoomFields = await getPropertyMetaByKey(propertyMetaDetails); // <-- FIXED
          let totalFilters = 0;
          let matchedFilters = 0;
        
          for (const [amenityId, amenityValue] of Object.entries(amenitiesIdObjectWithValue)) {
            totalFilters++;
        
            let matched = false;
            
            for (const meta of bedRoomFields) {
              if (
                meta.property_type_listings.id === amenityId &&
                String(meta.value) === String(amenityValue)
              ) {
                matched = true;
                break;
              }
            }
        
            if (matched) {
              matchedFilters++;
            }
          }
          console.log(totalFilters,'>>>>>>>>> totalFilters', matchedFilters, '>>>>>>>>>> matchedFilters')
          const score = totalFilters > 0 ? (matchedFilters / totalFilters) * 100 : 0;
          console.log(score, '>>>>>>>>>> score');
          return parseFloat(score.toFixed(2));
    },
    calculateYearScore: async (propertyMetaDetails, targetKey, amenitiesIdObjectWithValue) => {
        if (!propertyMetaDetails) {
            console.error("propertyMetaDetails is undefined");
            return 0;
        }

        const targetMeta = propertyMetaDetails
            .filter(meta => meta.property_type_listings?.type === "number")
            .find(meta => meta.property_type_listings?.key === targetKey);

        if (!amenitiesIdObjectWithValue || Object.keys(amenitiesIdObjectWithValue).length === 0) {
            return 100;
        }

        if (targetMeta) {
            const propertyId = targetMeta.property_type_listings.id;
            const propertyValue = targetMeta.value;

            let totalFilters = 0;
            let matchedFilters = 0;

            for (const [amenityId, amenityValue] of Object.entries(amenitiesIdObjectWithValue)) {
                totalFilters++;
                if (propertyId === amenityId && propertyValue === amenityValue) {
                    matchedFilters++;
                }
            }

            return (matchedFilters / totalFilters) * 100;
        }

        return 0;
    },
    calculationWeight: async () => {
        return {
            price: 0.35,
            location: 0.30,
            surface_area: 0.15,
            property_type: 0,
            amenities: 0.20,
            room_amenities: 0.15,
            year_amenities: 0
        }
    },

};
export default commonFunction;