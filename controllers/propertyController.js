import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import { validate as isUUID } from "uuid";
import commonFunction from "../components/utils/commonFunction.js";
import axios from "axios";
import { Client } from '@googlemaps/google-maps-services-js';

const GOOGLE_MAPS_API_KEY = "AIzaSyCwhqQx0uqNX7VYhsgByiF9TzXwy81CFag";
import {
  userInclude,
  langTranslationsInclude,
  currencyInclude,
  districtsInclude,
  propertyMetaDetailsInclude,
  propertyTypesInclude,
  cityInclude,
  stateInclude,
  neighborhoodInclude
} from "../components/utils/commonIncludes.js";
import commonFilter from "../components/utils/commonFilters.js"

const prisma = new PrismaClient();
import slugify from 'slugify';

const googleMapsClient = new Client({});

// Get all property type listing
const generateUniqueSlug = async (baseSlug, attempt = 0) => {
  const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
  const existingSlug = await prisma.projectDetails.findUnique({
    where: { slug: slug || undefined }, // Handle null or undefined slugs
  });
  
  return existingSlug ? generateUniqueSlug(baseSlug, attempt + 1) : slug;
};

export const getAgentDeveloperProperty = async (req, res) => {
  try {
    const userInfo = await commonFunction.getLoginUser(req.user.id);

    const { page = 1, limit = 10, flag } = req.body;  // Extract flag from request
    const lang = res.getLocale();
    const whereCondition = userInfo !== 'admin' ? { user_id: req.user.id } : {};

    const include = {
      ...userInclude,
      ...langTranslationsInclude,
      ...currencyInclude,
      ...districtsInclude,
      ...propertyMetaDetailsInclude,
      ...propertyTypesInclude,
    };

    const orderBy = { created_at: 'desc' };

    const paginationResult = await commonFunction.pagination(page, limit, whereCondition, orderBy, include, 'propertyDetails');

    const { totalCount, validPage: currentPage, validLimit: itemsPerPage, finding: properties } = paginationResult;

    // Use Promise.all to wait for all async operations inside map
    let simplifiedProperties = await Promise.all(properties.map(async (property) => {
      const description =
        lang === 'fr'
          ? property.lang_translations_property_details_descriptionTolang_translations.fr_string
          : property.lang_translations_property_details_descriptionTolang_translations.en_string;
      const title =
        lang === 'fr'
          ? property.lang_translations.fr_string
          : property.lang_translations.en_string;
      const type =
        lang === 'fr'
          ? property.property_types?.lang_translations?.fr_string
          : property.property_types?.lang_translations?.en_string;

      const metaDetails = property.property_meta_details.map((meta) => {
        const langObj =
          lang === 'fr'
            ? meta.property_type_listings?.lang_translations?.fr_string
            : meta.property_type_listings?.lang_translations?.en_string;

        return {
          id: meta.property_type_listings?.id || null,
          type: meta.property_type_listings?.type || null,
          key: meta.property_type_listings?.key || null,
          icon: meta.property_type_listings?.icon || null,
          name: langObj,
          value: meta.value,
        };
      });

      const bathRooms =
        metaDetails.find((meta) => meta.key === 'bathrooms')?.value || "0";
      const bedRooms =
        metaDetails.find((meta) => meta.key === 'rooms')?.value || "0";
      const propertyType = res.__('messages.propertyType') + " " + property.transaction;

      const viewProperty = await prisma.propertyView.count({
        where: {
          property_id: property.id  
        }
      });

      const commentsProperty = await prisma.propertyComment.count({
        where: {
          property_id: property.id  
        }
      });

      return {
        id: property.id,
        user_name: property.users?.full_name || null,
        user_image: property.users?.image || null,
        description,
        title,
        slug: property.slug,
        transaction: propertyType,
        transaction_type: property.transaction,
        picture: property.picture,
        video: property.video,
        latitude: property.latitude,
        longitude: property.longitude,
        size: property.size,
        price: property.price,
        created_at: property.created_at,
        bathRooms,
        status: property.status,
        currency: property.currency?.name || null,
        bedRooms,
        district: property.districts?.name || null,
        meta_details: metaDetails,
        type,
        like_count: property.like_count,
        view_count: viewProperty,
        comment_count: commentsProperty,
      };
    }));

    // Apply flag-based filtering
    if (flag === 'like') {
      simplifiedProperties = simplifiedProperties.filter(property => property.like_count > 0);
    } else if (flag === 'comment') {
      simplifiedProperties = simplifiedProperties.filter(property => property.comment_count > 0);
    } else if (flag === 'view') {
      simplifiedProperties = simplifiedProperties.filter(property => property.view_count > 0);
    }

    const responsePayload = {
      totalCount: simplifiedProperties.length, // Update total count after filtering
      totalPages: Math.ceil(simplifiedProperties.length / itemsPerPage),
      currentPage,
      itemsPerPage,
      list: simplifiedProperties,
    };

    // Send response
    return response.success(
      res,
      res.__('messages.propertyFetchSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error('Error fetching property details:', error);

    // Return error response
    return response.error(
      res,
      res.__('messages.errorFetchingProperties')
    );
  }
};


export const propertyComment = async (req, res) => {
  try {
    const { propertyId, comment, rating, property_owner_id } = req.body;
    const userId = req.user.id;

    const existingComment = await prisma.PropertyComment.findFirst({
      where: {
        property_id: propertyId,
        user_id: userId,
      },
    });

    if (existingComment) {
      return response.error(
        res,
        res.__('messages.commentAlreadyExists')
      );
    }

    const newComment = await prisma.propertyComment.create({
      data: {
        property_id: propertyId,
        user_id: userId,
        rating: rating,
        comment: comment,
        property_owner_id: property_owner_id,
      },
    });

    return response.success(
      res,
      res.__('messages.commentAddedSuccessfully'),
      newComment
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
}


export const getPropertyComment = async (req, res) => {
  try {
    const { propertyId, page, limit } = req.body;

    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    const totalCount = await prisma.propertyComment.count({
      where: {
        property_id: propertyId,
      },
    });

    const comments = await prisma.propertyComment.findMany({
      where: {
        property_id: propertyId,
      },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address: true,
            id: true,
          },
        },
      },
      skip,
      take: validLimit,
    });

    const responsePayload = {
      list: comments,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };
    console.log(responsePayload,"responsePayload")

    return response.success(
      res,
      res.__('messages.commentFetchSuccessfully'),
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



export const likeProperty = async (req, res) => {
  const { propertyId, propertyPublisherId } = req.body; // Get the property ID from the request parameters
  const userId = req.user.id; // Assuming user ID is available in req.user after authorization

  try {
    // Create a new like
    await prisma.propertyLike.create({
      data: {
        property_id: propertyId,
        user_id: userId,
        property_publisher: propertyPublisherId,
      },
    });

    // Increment the like count on the property
    await prisma.propertyDetails.update({
      where: { id: propertyId },
      data: { like_count: { increment: 1 } },
    });

    return response.success(
      res,
      res.__('messages.propertyLikedSuccessfully'),
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
};


export const viewProperty = async (req, res) => {
  const { propertyId, propertyPublisherId } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user has already viewed the property
    const existingView = await prisma.propertyView.findFirst({
      where: { user_id: userId, property_id: propertyId },
    });

    if (!existingView) {
      // Create a new view record for first-time viewers
      await prisma.propertyView.create({
        data: {
          property_id: propertyId,
          user_id: userId,
          property_publisher: propertyPublisherId,
          view_count: 1, // Initial view count
        },
      });
    } else {
      // Update the existing record by incrementing the view count
      await prisma.propertyView.updateMany({
        where: {
          user_id: userId,
          property_id: propertyId,
        },
        data: { 
          view_count: { increment: 1 },
        },
      });
    }

    return response.success(
      res,
      res.__('messages.propertyViewedSuccessfully')
    );
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.internalServerError'));
  }
};





export const getUserViewedData = async (req, res) => {
  const { propertyId, page, limit, startDate, endDate } = req.body; // Get the property ID from the request parameters
  try {
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate), // Greater than or equal to start date
          lte: new Date(endDate),   // Less than or equal to end date
        },
      };
    }
    
    const totalCount = await prisma.propertyView.count({
      where: {
        property_id: propertyId,
        ...dateFilter,
      },
    });

    const likedProperties = await prisma.propertyView.findMany({
      where: {
        property_id: propertyId,
        ...dateFilter,
      },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address: true,
            id: true,
            mobile_number: true
          },
        },
      },
      skip,
      take: validLimit,
    });


    const transformedProperties = likedProperties.map(property => ({
      ...property,
      users: {
        ...property.users,
        mobile_number: property.users?.mobile_number ? String(property.users.mobile_number) : null,
      }
    }));
    
    const responsePayload = {
      list: transformedProperties,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };


    return response.success(
      res,
      res.__('messages.likedPropertyListedSuccessfully'),
      responsePayload,
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
}

export const getUserCommentedData = async (req, res) => {
  const { propertyId, page, limit, startDate, endDate } = req.body; // Get date range

  try {
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    // Construct date filter condition
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate), // Greater than or equal to start date
          lte: new Date(endDate),   // Less than or equal to end date
        },
      };
    }

    const totalCount = await prisma.propertyComment.count({
      where: {
        property_id: propertyId,
        ...dateFilter, // Apply date filter
      },
    });

    const commentedProperties = await prisma.propertyComment.findMany({
      where: {
        property_id: propertyId,
        ...dateFilter, // Apply date filter
      },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address: true,
            id: true,
            mobile_number: true
          },
        },
      },
      skip,
      take: validLimit,
    });

    const transformedProperties = commentedProperties.map(property => ({
      ...property,
      users: {
        ...property.users,
        mobile_number: property.users?.mobile_number ? String(property.users.mobile_number) : null,
      }
    }));

    const responsePayload = {
      list: transformedProperties,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };

    return response.success(
      res,
      res.__('messages.likedPropertyListedSuccessfully'),
      responsePayload,
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
};


export const getUserLikedData = async (req, res) => {
  const { propertyId, page, limit, startDate, endDate } = req.body; // Get the property ID from the request parameters
  try {
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate), // Greater than or equal to start date
          lte: new Date(endDate),   // Less than or equal to end date
        },
      };
    }

    const totalCount = await prisma.propertyLike.count({
      where: {
        property_id: propertyId,
        ...dateFilter
      },
    });

    const likedProperties = await prisma.propertyLike.findMany({
      where: {
        property_id: propertyId,
        ...dateFilter
      },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address: true,
            id: true,
            mobile_number: true
          },
        },
      },
      skip,
      take: validLimit,
    });


    const transformedProperties = likedProperties.map(property => ({
      ...property,
      users: {
        ...property.users,
        mobile_number: property.users?.mobile_number ? String(property.users.mobile_number) : null,
      }
    }));
    
    const responsePayload = {
      list: transformedProperties,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };


    return response.success(
      res,
      res.__('messages.likedPropertyListedSuccessfully'),
      responsePayload,
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
}


export const unlikeProperty = async (req, res) => {
  const { propertyId } = req.params; // Get the property ID from the request parameters
  const userId = req.user.id; // Get the user ID from the request object

  try {
    // Delete the like record using the composite unique key
    await prisma.propertyLike.delete({
      where: {
        user_id_property_id: {
          user_id: userId,
          property_id: propertyId,
        },
      },
    });

    // Decrement the like count on the property
    await prisma.propertyDetails.update({
      where: { id: propertyId },
      data: { like_count: { decrement: 1 } },
    });

    return response.success(
      res,
      res.__('messages.propertyUnlikedSuccessfully'),
    );
  } catch (error) {
    console.error(error);
    return response.error(
      res,
      res.__('messages.internalServerError')
    );
  }
};


export const getLikedProperty = async (req, res) => {
  const userId = req.user.id;

  try {

    const { page = 1, limit = 10 } = req.body;
    const lang = res.getLocale();

    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));

    const skip = (validPage - 1) * validLimit;

    const totalCount = await prisma.propertyLike.count({
        where: { user_id: userId },
    });


    const likedProperties = await prisma.propertyLike.findMany({
      skip,
      take: validLimit,
      orderBy: { created_at: 'desc' },
      where: { user_id: userId },
      include: { 
        property: {
          include: {
            lang_translations_property_details_descriptionTolang_translations: true,
            lang_translations: true,
            property_meta_details: {
              include: {
                property_type_listings: {
                  include: {
                    lang_translations: true
                  }
                }
              }
            }
          },
        },
      },
  });

        const simplifiedData = likedProperties.map(like => {
          const property = like.property;
        
          const title = lang === 'fr' 
            ? property.lang_translations?.fr_string || property.lang_translations?.en_string 
            : property.lang_translations?.en_string || property.lang_translations?.fr_string;
        
          const description = lang === 'fr' 
            ? property.lang_translations_property_details_descriptionTolang_translations?.fr_string || '' 
            : property.lang_translations_property_details_descriptionTolang_translations?.en_string || '';
        
            const metaDetails = property.property_meta_details.map((meta) => {
              const langObj =
                lang === 'fr'
                  ? meta.property_type_listings?.lang_translations?.fr_string
                  : meta.property_type_listings?.lang_translations?.en_string;
        
              return {
                id: meta.property_type_listings?.id || null,
                type: meta.property_type_listings?.type || null,
                key: meta.property_type_listings?.key || null,
                icon: meta.property_type_listings?.icon || null,
                name: langObj,
                value: meta.value,
              };
            });

            const bathRooms =
            metaDetails.find((meta) => meta.key === 'bathrooms')?.value || "0";

            const bedRooms = 
            metaDetails.find((meta) => meta.key === 'bedrooms')?.value || "0";
          return {
            ...like,
            property: {
              id: property.id,
              price: property.price,
              state_id: property.state_id,
              city_id: property.city_id,
              district_id: property.district_id,
              vr_link: property.vr_link,
              video: property.video,
              status: property.status,
              user_id: property.user_id,
              is_deleted: property.is_deleted,
              created_at: property.created_at,
              updated_at: property.updated_at,
              created_by: property.created_by,
              updated_by: property.updated_by,
              project_id: property.project_id,
              size: property.size,
              transaction: property.transaction,
              direction: property.direction,
              type: property.type,
              title,
              description,
              picture: property.picture,
              currency_id: property.currency_id,
              neighborhoods_id: property.neighborhoods_id,
              address: property.address,
              latitude: property.latitude,
              longitude: property.longitude,
              slug: property.slug,
              like_count: property.like_count,
              bathRooms,
              bedRooms,
              // Exclude lang_translations and lang_translations_property_details_descriptionTolang_translations
            },
          };
        });
        


      const responsePayload = {
        list: simplifiedData,
        totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
        currentPage: validPage,
        itemsPerPage: validLimit,
      };

      return response.success(
        res,
        res.__('messages.likedPropertyFetchedSuccessfully'),
        responsePayload
      );
  } catch (error) {
      console.error(error);
      return response.error(
        res,
        res.__('messages.errorFetchingProperties')
      );
  }
};

export const getUserLikeProperty = async (req, res) => {
  try {
    const { page, limit, user_like, startDate, endDate } = req.body;

    console.log(user_like,"user_like")
    // Validate user_like (ensure it's not null, undefined, or an empty string)
    if (!user_like || user_like.trim() === "") {
      return response.error(res, res.__('messages.userIdRequired'));
    }

    // Ensure valid pagination numbers
    const validPage = isNaN(parseInt(page, 10)) ? 1 : Math.max(1, parseInt(page, 10));
    const validLimit = isNaN(parseInt(limit, 10)) ? 10 : Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    // Date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    // Fetch properties
    const userLikeProperty = await prisma.propertyLike.findMany({
      where: { user_id: user_like, ...dateFilter },
      skip,
      take: validLimit,
      orderBy: { created_at: 'desc' },
      include: {
        property: true,
        
      }
    });

    // Get total count
    const totalCount = await prisma.propertyLike.count({
      where: { user_id: user_like, ...dateFilter },
    });

    // Prepare response
    const responsePayload = {
      list: userLikeProperty,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };

    return response.success(
      res,
      res.__('messages.likedPropertyFetchedSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.errorFetchingProperties'));
  }
};
export const getUserViewProperty = async (req, res) => {
  try {
    const { page, limit, user_like, startDate, endDate } = req.body;

    console.log(user_like,"user_like")
    // Validate user_like (ensure it's not null, undefined, or an empty string)
    if (!user_like || user_like.trim() === "") {
      return response.error(res, res.__('messages.userIdRequired'));
    }

    // Ensure valid pagination numbers
    const validPage = isNaN(parseInt(page, 10)) ? 1 : Math.max(1, parseInt(page, 10));
    const validLimit = isNaN(parseInt(limit, 10)) ? 10 : Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    // Date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    // Fetch properties
    const userLikeProperty = await prisma.propertyView.findMany({
      where: { user_id: user_like, ...dateFilter },
      skip,
      take: validLimit,
      orderBy: { created_at: 'desc' },
      include: {
        property: true,
        
      }
    });

    // Get total count
    const totalCount = await prisma.propertyView.count({
      where: { user_id: user_like, ...dateFilter },
    });

    // Prepare response
    const responsePayload = {
      list: userLikeProperty,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    };

    return response.success(
      res,
      res.__('messages.likedPropertyFetchedSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.errorFetchingProperties'));
  }
};

export const setUserActivity = async (req, res) => {
  try {
    const existingActivity = await prisma.userActivity.findFirst({
      where: { user_id: req.user.id },
    });
    console.log(existingActivity, 'existingActivity');
    let userActivity;
    if (existingActivity) {
      // Update the existing record
      userActivity = await prisma.userActivity.updateMany({
        where: { user_id: req.user.id },
        data: { last_activity_at: new Date() },
      });
    } else {
      // Create a new record
      userActivity = await prisma.userActivity.create({
        data: {
          user_id: req.user.id,
          last_activity_at: new Date(),
        },
      });
    }

    return response.success(res, res.__('messages.propertyActivityUpdatedSuccessfully'), userActivity);
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.errorUpdatingPropertyActivity'));
  }
};

export const getAllProperty = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, title, description, city_id, district_id, neighborhoods_id, address, type_id, minPrice, maxPrice, minSize, maxSize, amenities_id_array, amenities_id_object_with_value, direction, developer_id, transaction, filter_latitude, filter_longitude, startDate, endDate} = req.body;
    console.log('Request Body:', req.body.filter_latitude, req.body.filter_longitude);
    const lang = res.getLocale();

    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));

    const skip = (validPage - 1) * validLimit;

    const otherConditions = [
      await commonFilter.titleCondition(title),
      await commonFilter.descriptionCondition(description),
      await commonFilter.cityCondition(city_id),
      await commonFilter.districtCondition(district_id),
      await commonFilter.neighborhoodCondition(neighborhoods_id),
      await commonFilter.addressCondition(address),
      await commonFilter.typeCondition(type_id),
      await commonFilter.priceCondition(minPrice, maxPrice),
      await commonFilter.squareFootSize(minSize, maxSize),
      await commonFilter.amenitiesCondition(amenities_id_array),
      await commonFilter.amenitiesNumberCondition(amenities_id_object_with_value),
      await commonFilter.directionCondition(direction),
      await commonFilter.developerCondition(developer_id),
    ]

    const transactionConditions = [
      await commonFilter.transactionCondition(transaction)
    ]

    const combinedCondition = {
      AND: [
        { AND: transactionConditions.filter(Boolean) },
        { OR: otherConditions.filter(Boolean) },
        user_id ? { user_id: user_id } : {},
      ],
    };


    let dateFilter = {};
    if (startDate && endDate) {
    dateFilter = {
        created_at: {
        gte: new Date(startDate), // Greater than or equal to start date
        lte: new Date(endDate),   // Less than or equal to end date
        },
    };
}

    const totalCount = await prisma.propertyDetails.count({
      where: {
        ...combinedCondition,
        ...dateFilter
      },
    });

    const properties = await prisma.propertyDetails.findMany({
      skip,
      take: validLimit,
      orderBy:{
        created_at: 'desc',
      },
      where: {
          ...combinedCondition,
          ...dateFilter
      },
      include: {
        ...userInclude,
        ...langTranslationsInclude,
        ...districtsInclude,
        ...propertyMetaDetailsInclude,
        ...currencyInclude,
        ...cityInclude,
        ...stateInclude,
        ...neighborhoodInclude,
        ...propertyTypesInclude
      },
    });


    const isFrench = lang === 'fr'; 
    const cities = await prisma.cities.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        created_at: true,
        lang: {
          select: {
            fr_string: isFrench,
            en_string: !isFrench,
          },
        },
        ...stateInclude,
        ...districtsInclude
      },
    });

    const developers = await prisma.developers.findMany({
      where: {
        is_deleted: false,
      }
    });


    const developerResponseData = await Promise.all(
      developers.map(async (developer) => {
        const userInfo = await prisma.users.findUnique({
          where: {
            id: developer.user_id,
          }
        });
        return{
          id: developer.id,
          user_id: developer.user_id,
          user_name: userInfo?.user_name,
          full_name: userInfo?.full_name,
          image: userInfo?.image,
          user_email_adress: userInfo?.email_address,
        }
      })
    );


    const transformedCities = cities.map((city) => ({
      id: city.id,
      city_name: isFrench ? city.lang.fr_string : city.lang.en_string,
      latitude: city.latitude,
      longitude: city.longitude,
      created_at: city.created_at, 
      state: city.states.id
    }));


    let likedPropertyIds = [];
    if (req.user?.id) {
    const likedProperties = await prisma.propertyLike.findMany({
      where: {
        user_id: req.user.id,
      },
      select: {
        property_id: true,
      },
    });

    likedPropertyIds = likedProperties.map((like) => like.property_id);
  }


    const simplifiedProperties = await Promise.all(
      properties.map(async (property) => {
        const description =
          lang === 'fr'
            ? property.lang_translations_property_details_descriptionTolang_translations.fr_string
            : property.lang_translations_property_details_descriptionTolang_translations.en_string;
    
        const title =
          lang === 'fr'
            ? property.lang_translations.fr_string
            : property.lang_translations.en_string;
    
        const type =
          lang === 'fr'
            ? property.property_types?.lang_translations?.fr_string
            : property.property_types?.lang_translations?.en_string;
    
        const neighborhood =
          lang === 'fr'
            ? property.neighborhoods?.langTranslation?.fr_string
            : property.neighborhoods?.langTranslation?.en_string;
    
        const metaDetails = property.property_meta_details.map((meta) => {
          const langObj =
            lang === 'fr'
              ? meta.property_type_listings?.lang_translations?.fr_string
              : meta.property_type_listings?.lang_translations?.en_string;
    
          return {
            id: meta.property_type_listings?.id || null,
            type: meta.property_type_listings?.type || null,
            key: meta.property_type_listings?.key || null,
            icon: meta.property_type_listings?.icon || null,
            name: langObj,
            value: meta.value,
          };
        });

        
        



    
        const bathRooms =
          metaDetails.find((meta) => meta.key === 'bathrooms')?.value || "0";
        const bedRooms =
          metaDetails.find((meta) => meta.key === 'rooms')?.value || "0";
        
        const propertyType = res.__('messages.propertyType') + " " + property.transaction;
        let responseProjectData = null;
        if(property.project_id !== null){
          const projectDetail = await prisma.projectDetails.findUnique({
            where: { id: property.project_id },
          });
      
          const descriptionData = await prisma.langTranslations.findUnique({
            where: { id: projectDetail.description },
          });
      
          const titleData = await prisma.langTranslations.findUnique({
            where: { id: projectDetail.title },
          });
  
          responseProjectData = {
            id: projectDetail.id,
            icon: projectDetail.icon,
            slug: projectDetail.slug,
            title: lang === 'fr' ? titleData.fr_string : titleData.en_string,
            description: lang === 'fr' ? descriptionData.fr_string : descriptionData.en_string,
          }
        }
        
        let price_score = 100;
        let location_score = 25;
        let surface_are_score = 100;
        let property_type_score = 100;
        let amenities_score = 100;
        let room_amenities_score = 100; // Initialize matchPercentage with 0
        let year_amenities_score = 100;

        // Price calculation
        if (property.price >= minPrice && property.price <= maxPrice) {
          price_score = 100;
        } else if (property.price > maxPrice) {
          const percentAbove = ((property.price - maxPrice) / maxPrice) * 100;
          if (100 - percentAbove >= 50) {
            price_score = 100 - percentAbove;
          } else {
            price_score = 0;
          }
        } else if (property.price < minPrice) {
          const percentBelow = ((minPrice - property.price) / minPrice) * 100;
          if (100 - percentBelow >= 50) {
            price_score = 100 - percentBelow;
          } else {
            price_score = 0;
          }
        }

        // Surface area calculation
        if (property.size >= minSize && property.size <= maxSize) {
          surface_are_score = 100;
        } else if (property.size > maxSize) {
          const percentAbove = ((property.size - maxSize) / maxSize) * 100;
          if (100 - percentAbove >= 50) {
            surface_are_score = 100 - percentAbove;
          } else {
            surface_are_score = 0;
          }
        } else if (property.size < minSize) {
          const percentBelow = ((minSize - property.size) / minSize) * 100;
          if (100 - percentBelow >= 50) {
            surface_are_score = 100 - percentBelow;
          } else {
            surface_are_score = 0;
          }
        }


        //Boolean amenities filter 
        if (property && property.property_meta_details) {
          const booleanIdsSet = new Set(
              property.property_meta_details
                  .filter(meta => meta.property_type_listings?.type === "boolean")
                  .map(meta => meta.property_type_listings?.id)
          );
      
          let matchedAmenities = [];
          
          // Handle case when amenities_id_array is an empty string or undefined
          if (!amenities_id_array || amenities_id_array === "") {
              amenities_score = 100; // Default score for empty or undefined amenities_id_array
          } else if (Array.isArray(amenities_id_array)) {
              const allMatch = amenities_id_array.every(id => booleanIdsSet.has(id));
      
              if (allMatch) {
                  amenities_score = 100;
              } else {
                  matchedAmenities = amenities_id_array.filter(id => booleanIdsSet.has(id));
                  const totalRequested = amenities_id_array.length;
                  const totalMatched = matchedAmenities.length;
                  amenities_score = (totalMatched / totalRequested) * 100;
              }
          } else {
              amenities_score = 100;
          }
      
          // console.log("Match Percentage:", amenities_score);
      } else {
          console.error("Property or property_meta_details is undefined:", property);
      }
      


        //Bedrooms amenities filter
        if (property && property.property_meta_details) {
          const bedRooms = property.property_meta_details
            .filter(meta => meta.property_type_listings?.type === "number")
            .find(meta => meta.property_type_listings.key === "rooms");
        
          if (!amenities_id_object_with_value || Object.keys(amenities_id_object_with_value).length === 0) {
            room_amenities_score = 100;
          } else if(bedRooms){
            const propertyId = bedRooms.property_type_listings.id;
            const propertyValue = bedRooms.value;
        
            let totalFilters = 0;
            let matchedFilters = 0;
            for (const [amenityId, amenityValue] of Object.entries(amenities_id_object_with_value)) {
              totalFilters++;
        
              if (propertyId === amenityId && propertyValue === amenityValue) {
                matchedFilters++;
              }
            }
        
            room_amenities_score = (matchedFilters / totalFilters) * 100;
          }
        } else {
          console.error("Property or property_meta_details is undefined:", property);
        }

        //Year of construction calculation
        if (property && property.property_meta_details) {
          const yearOfConstruction = property.property_meta_details
            .filter(meta => meta.property_type_listings?.type === "number")
            .find(meta => meta.property_type_listings.key === "year_of_construction");
        
          if (!amenities_id_object_with_value || Object.keys(amenities_id_object_with_value).length === 0) {
            year_amenities_score = 100;
          } else if(yearOfConstruction){
            const propertyId = yearOfConstruction.property_type_listings.id;
            const propertyValue = yearOfConstruction.value;
        
            let totalFilters = 0;
            let matchedFilters = 0;
            for (const [amenityId, amenityValue] of Object.entries(amenities_id_object_with_value)) {
              totalFilters++;
        
              if (propertyId === amenityId && propertyValue === amenityValue) {
                matchedFilters++;
              }
            }
        
            year_amenities_score = (matchedFilters / totalFilters) * 100;
          }
        
          // console.log(`Match Percentage: ${year_amenities_score}%`);
        } else {
          console.error("Property or property_meta_details is undefined:", property);
        }

      
        //location calculation
        // let location_score = 100;
        if (filter_latitude && filter_longitude && property.latitude && property.longitude) {
          try {
            // Format coordinates properly as strings
            const origin = `${filter_latitude},${filter_longitude}`;
            const destination = `${property.latitude},${property.longitude}`;
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
            
            const response = await axios.get(url);
            // console.log('Distance Matrix Response:', JSON.stringify(response.data, null, 2));
            
            if (response.data.status === 'OK' && 
                response.data.rows && 
                response.data.rows[0] && 
                response.data.rows[0].elements && 
                response.data.rows[0].elements[0] && 
                response.data.rows[0].elements[0].status === 'OK') {
              
              const element = response.data.rows[0].elements[0];
              const distanceInMeters = element.distance.value;
              const distanceInKm = distanceInMeters / 1000;
              const durationText = element.duration.text;
        
              // Calculate score based on actual driving distance
              if (distanceInKm <= 9) {
                location_score = ((10 - distanceInKm) * 10) * 25 / 100;
              } else{
                location_score = 0;
              }
              
        
              // Add the exact distance and duration to the property object
              property.exact_distance = {
                text: element.distance.text,
                value: distanceInKm,
                duration: durationText
              };
              
              console.log('Successfully calculated distance:', property.exact_distance);
            } else {
              location_score = 0;
            }
          } catch (error) {
            console.error('Error calculating distance:', error.message);
            // Fallback to straight-line distance calculation
            const R = 6371; // Earth's radius in kilometers
            const lat1 = parseFloat(filter_latitude);
            const lon1 = parseFloat(filter_longitude);
            const lat2 = parseFloat(property.latitude);
            const lon2 = parseFloat(property.longitude);
            
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            
            property.exact_distance = {
              text: `${distance.toFixed(2)} km (straight-line)`,
              value: parseFloat(distance.toFixed(2)),
              duration: 'N/A'
            };
            
            console.log('Fallback distance calculated:', property.exact_distance);
          }
        }
        
    
        const price_weight = 0.30
        // const location_weight = 0.25
        const surface_area = 0.10
        const property_type = 0.10
        const amenities = 0.10
        const roomAmenities = 0.10
        const yearAmenities = 0.05

        //location score static, 
        const final_score = (price_score * price_weight + location_score + surface_are_score * surface_area + property_type_score * property_type + amenities_score * amenities + roomAmenities * room_amenities_score + yearAmenities *year_amenities_score)

        const user_role = await prisma.roles.findUnique({
          where: {
            id: property.users?.role_id,
          }
        });

        let developerSocial = null;

        if (user_role.name === "developer") {
          const developer = await prisma.developers.findUnique({
            where: {
              user_id: property.users.id
            }
          });
          console.log(developer,"ll")
        
          if (developer) {
            developerSocial = {
              twitter: developer.twitterLink || null,
              facebook: developer.facebookLink || null,
              instagram: developer.instagramLink || null
            };
          }
        } else if (user_role.name === "agency") {
          const agency = await prisma.agencies.findUnique({
            where: {
              user_id: property.users.id
            }
          });
        
          if (agency) {
            developerSocial = {
              twitter: agency.twitter_link || null,
              facebook: agency.facebook_link || null,
              instagram: agency.instagram_link || null
            };
          }
        }
        return {
          id: property.id,
          user_name: property.users?.full_name || null,
          user_image: property.users?.image || null,
          user_role: user_role.name,
          user_id: property.users?.id,
          user_twitter: developerSocial?.twitter || null,
          user_facebook: developerSocial?.facebook || null,
          user_instagram: developerSocial?.instagram || null,
          phone_number: property.users?.mobile_number.toString(),
          country_code: property.users?.country_code,
          email_address: property.users?.email_address || null,
          description,
          title,
          slug: property.slug,
          transaction: propertyType,
          transaction_type: property.transaction,
          status: property.status,
          picture: property.picture,
          video: property.video,
          latitude: property.latitude,
          longitude: property.longitude,
          direction: property.direction,
          address: property.address,
          size: property.size,
          price: property.price,
          created_at: property.created_at,
          bathRooms,
          bedRooms,
          district: 
            property.districts?.langTranslation &&
            (lang === "fr"
              ? property.districts.langTranslation.fr_string
              : property.districts.langTranslation.en_string),
          state:
          (lang === "fr"
            ? property.states?.lang?.fr_string
            : property.states?.lang?.en_string),
          city:
            lang === "fr"
              ? property.cities?.lang?.fr_string
              : property.cities?.lang?.en_string,
          neighborhood: 
            lang === "fr"
              ? property.neighborhoods?.lang?.fr_string
              : property.neighborhoods?.lang?.en_string,
          images: property.images_data,
          meta_details: metaDetails,
          currency: property.currency?.name || null,
          neighborhood,
          type_details: {
            id: property.property_types?.id || null,
            title: type,
          },
          project_details: responseProjectData,
          like: likedPropertyIds.includes(property.id),
          filter_result:{
            location: location_score ,
            price: price_score * price_weight,
            surface_area: surface_are_score * surface_area,
            property_type: property_type_score * property_type,
            amenities: amenities_score * amenities,
            room_amenities: roomAmenities * room_amenities_score,
            construction_year_amenities: yearAmenities * year_amenities_score,
            total_percentage: Math.ceil(parseFloat(final_score.toFixed(2))),
            exact_distance: property.exact_distance || null
          }
        };
      })
    );
    

    const data = await prisma.propertyDetails.findMany({
      orderBy:{
        created_at: 'desc',
      },
      include: {
        ...userInclude,
        ...langTranslationsInclude,
        ...districtsInclude,
        ...propertyMetaDetailsInclude,
        ...currencyInclude,
        ...cityInclude,
        ...stateInclude,
        ...neighborhoodInclude,
        ...propertyTypesInclude
      },
    });



    const maxPriceSliderRange = Math.max(
      ...data.map((property) => property.price || 0)
    );

    const maxSizeSliderRange = Math.max(
      ...data.map((property) => property.size || 0)
    );

    const listings = await prisma.propertyTypeListings.findMany({
      where: {
        is_filtered: true
      },
      include: {
        lang_translations: true,
      },
    });

      const propertyTypes = await prisma.propertyTypes.findMany({
        include: {
          lang_translations: true,
        },
      });


      const simplifiedTypeProperties = await Promise.all(
        propertyTypes.map(async (property) => {
          const user = property.created_by
            ? await prisma.users.findUnique({
                where: { id: property.created_by },
                select: { user_name: true },
              })
            : null;
  
          return {
            id: property.id,
            title:
              property.lang_translations
                ? lang === 'fr'
                  ? property.lang_translations.fr_string
                  : property.lang_translations.en_string
                : 'No title available',
            created_by: user ? user.user_name : 'Unknown User',
            createdAt: property.created_at,
          };
        })
      );

    const simplifiedListings = listings.map((listing) => ({
      id: listing.id,
      name:
        listing.lang_translations
          ? lang === 'fr'
            ? listing.lang_translations.fr_string
            : listing.lang_translations.en_string
          : 'No name available',
      type: listing.type,
      key: listing.key,
      category: listing.category?.toString() || null,
    }));

    const responsePayload = {
      list: simplifiedProperties,
      property_meta_details: simplifiedListings,
      property_types: simplifiedTypeProperties,
      cities: transformedCities,
      maxPriceSliderRange,
      maxSizeSliderRange,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
      developers: developerResponseData
    };
    return response.success(
      res,
      res.__('messages.propertyFetchSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error('Error fetching property details:', error);
    return response.error(
      res,
      res.__('messages.errorFetchingProperties')
    );
  }
};


export const getPropertyById = async (req, res) => {
  try {
    const { property_slug } = req.body;
    if (!property_slug) {
      return response.error(res, res.__('messages.invalidPropertyId'));
    }

    const property = await prisma.propertyDetails.findUnique({
      where: { slug: property_slug },
      include: {
        ...userInclude,
        ...langTranslationsInclude,
        ...districtsInclude,
        ...cityInclude,
        ...stateInclude,
        ...propertyMetaDetailsInclude,
        ...currencyInclude,
        ...neighborhoodInclude,
        ...propertyTypesInclude
      },
    });

    if (!property) {
      return response.error(res, res.__('messages.propertyNotFound'));
    }

    const lang = res.getLocale();
    const metaDetails = property.property_meta_details.map((meta) => {
      const langObj =
        lang === 'fr'
          ? meta.property_type_listings?.lang_translations?.fr_string
          : meta.property_type_listings?.lang_translations?.en_string;

      return {
        id: meta.property_type_listings?.id || null,
        type: meta.property_type_listings?.type || null,
        key: meta.property_type_listings?.key || null,
        icon: meta.property_type_listings?.icon || null,
        name: langObj,
        value: meta.value,
      };
    });


    let likedPropertyIds = [];
    if (req.user?.id) {
    const likedProperties = await prisma.propertyLike.findMany({
      where: {
        user_id: req.user.id,
      },
      select: {
        property_id: true,
      },
    });

    likedPropertyIds = likedProperties.map((like) => like.property_id);
  }


    const responsePayload = {
      id: property.id,
      user_name: property.users?.full_name || null,
      user_image: property.users?.image || null,
      email_address: property.users?.email_address || null,
      description_en: property.lang_translations_property_details_descriptionTolang_translations.en_string,
      description_fr: property.lang_translations_property_details_descriptionTolang_translations.fr_string,
      title_en: property.lang_translations.en_string,
      title_fr: property.lang_translations.fr_string,
      direction: property.direction,
      transaction_type: property.transaction,
      picture: property.picture,
      video: property.video,
      latitude: property.latitude,
      longitude: property.longitude,
      address: property.address,
      size: property.size,
      price: property.price,
      created_at: property.created_at,
      district:
        lang === "fr"
          ? property.districts?.langTranslation?.fr_string
          : property.districts?.langTranslation?.en_string,
      city:
        lang === "fr"
          ? property.cities?.lang?.fr_string
          : property.cities?.lang?.en_string,
      state:
        lang === "fr"
          ? property.states?.lang?.fr_string
          : property.states?.lang?.en_string,
      neighborhood: 
        lang === "fr"
          ? property.neighborhoods?.langTranslation?.fr_string
          : property.neighborhoods?.langTranslation?.en_string,
        
      images: property.images_data,
      meta_details: metaDetails,
      currency: property.currency?.name || null,
      like: likedPropertyIds.includes(property.id),
      type_details: {
        id: property.property_types?.id || null,
        title: lang === 'fr' ? property.property_types?.lang_translations?.fr_string : property.property_types?.lang_translations?.en_string,
      },
    };

    return response.success(
      res,
      res.__('messages.propertyFetchSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error('Error fetching property by ID:', error);

    return response.error(
      res,
      res.__('messages.errorFetchingProperties')
    );
  }
};

export const getPropertyByIdWithId = async (req, res) => {
  try {
    const { property_slug } = req.body;
    if (!property_slug) {
      return response.error(res, res.__('messages.invalidPropertyId'));
    }

    const property = await prisma.propertyDetails.findUnique({
      where: { slug: property_slug },
      include: {
        ...userInclude,
        ...langTranslationsInclude,
        ...districtsInclude,
        ...cityInclude,
        ...stateInclude,
        ...propertyMetaDetailsInclude,
        ...currencyInclude,
        ...neighborhoodInclude,
        ...propertyTypesInclude
      },
    });

    if (!property) {
      return response.error(res, res.__('messages.propertyNotFound'));
    }

    const lang = res.getLocale();
    const metaDetails = property.property_meta_details.map((meta) => {
      const langObj =
        lang === 'fr'
          ? meta.property_type_listings?.lang_translations?.fr_string
          : meta.property_type_listings?.lang_translations?.en_string;

      return {
        id: meta.property_type_listings?.id || null,
        type: meta.property_type_listings?.type || null,
        key: meta.property_type_listings?.key || null,
        icon: meta.property_type_listings?.icon || null,
        name: langObj,
        value: meta.value,
      };
    });

    const responsePayload = {
      id: property.id,
      user: property.users?.id || null,
      email_address: property.users?.email_address || null,
      description_en: property.lang_translations_property_details_descriptionTolang_translations.en_string,
      description_fr: property.lang_translations_property_details_descriptionTolang_translations.fr_string,
      title_en: property.lang_translations.en_string,
      title_fr: property.lang_translations.fr_string,
      transaction_type: property.transaction,
      direction: property.direction,
      picture: property.picture,
      video: property.video,
      latitude: property.latitude,
      longitude: property.longitude,
      address: property.address,
      size: property.size,
      price: property.price,
      created_at: property.created_at,
      district: property.districts?.id || null,
      city:property.cities?.id || null,
      state: property.states?.id || null,
      images: property.images_data,
      meta_details: metaDetails,
      currency: property.currency?.id || null,
      neighborhood: property.neighborhoods?.id || null,
      project_id: property.project_id,
      type_details: {
        id: property.property_types?.id || null,
        title: lang === 'fr' ? property.property_types?.lang_translations?.fr_string : property.property_types?.lang_translations?.en_string,
      },
    };

    return response.success(
      res,
      res.__('messages.propertyFetchSuccessfully'),
      responsePayload
    );
  } catch (error) {
    console.error('Error fetching property by ID:', error);

    return response.error(
      res,
      res.__('messages.errorFetchingProperties')
    );
  }
};


export const createProperty = async (req, res) => {
    try {
        const createdBy = req.user.id;
        const { title_en, title_fr, description_en, description_fr, price, currency_id, neighborhoods_id, district_id, city_id, state_id, latitude,
                longitude, address, vr_link, picture, video, user_id, type_id, transaction, project_id, size, meta_details, direction} = req.body;

        const user = await prisma.users.findFirst({
          where: { id: user_id, roles: { name: { in: ['developer', 'agency'], }, }, },
        });
        
        if(!user){
          return response.error(res, res.__('messages.onlyDeveloperAgencyCreat'), null, 400);
        }
        
        const propertyTitleExist = await prisma.propertyDetails.findFirst({
          where: {
            OR: [
              { lang_translations: { en_string: title_en } },
              { lang_translations: { fr_string: title_fr } },
            ],
          },
        })
        
        if(propertyTitleExist){
          return response.error(res, res.__('messages.propertyExists'), null, 400);
        }
        
        const baseSlug = slugify(title_en, { lower: true, replacement: '_', strict: true });
        const uniqueSlug = await generateUniqueSlug(baseSlug);
        const titleTranslation = await prisma.langTranslations.create({
            data: {
                en_string: title_en,
                fr_string: title_fr,
                created_by: user_id,
            },
        });

        const descriptionTranslation = await prisma.langTranslations.create({
            data: {
                en_string: description_en,
                fr_string: description_fr,
                created_by: user_id,
            },
        });
 
        const newProperty = await prisma.propertyDetails.create({
            data: {
                title: titleTranslation.id, 
                description: descriptionTranslation.id,
                price: price,
                slug: uniqueSlug,
                direction: direction,
                currency_id: currency_id,
                neighborhoods_id: neighborhoods_id || null,
                district_id: district_id || null,
                city_id: city_id,
                state_id: state_id,
                latitude: latitude,
                longitude: longitude,
                address: address,
                project_id: project_id || null,
                vr_link: vr_link || null,
                picture: picture || null,
                video: video || null,
                user_id: user_id,
                type: type_id,
                transaction: transaction,
                size: size || null,
                created_by:createdBy,
                property_meta_details: {
                    create: meta_details.map((meta) => ({
                        value: meta.value,
                        property_type_id: meta.property_type_id,
                    })),
                },
            },
        });

        const createdProperty = await prisma.propertyDetails.findUnique({
            where: { id: newProperty.id },
            include: {
                ...userInclude,
                ...langTranslationsInclude,
                ...districtsInclude,
                ...propertyMetaDetailsInclude,
                ...currencyInclude,
                ...neighborhoodInclude,
                ...propertyTypesInclude
            },
        });

        const lang = res.getLocale();
        const simplifiedProperty = {
            id: createdProperty.id,
            user_name: createdProperty.users?.full_name || null,
            user_image: createdProperty.users?.image || null,
            description: lang === 'fr'
                ? createdProperty.lang_translations_property_details_descriptionTolang_translations.fr_string
                : createdProperty.lang_translations_property_details_descriptionTolang_translations.en_string,
            title: lang === 'fr' ? createdProperty.lang_translations.fr_string : createdProperty.lang_translations.en_string,
            transaction: `${res.__('messages.propertyType')} ${createdProperty.transaction}`,
            transaction_type: createdProperty.transaction,
            direction: createdProperty.direction,
            latitude: createdProperty.latitude,
            longitude: createdProperty.longitude,
            address: createdProperty.address,
            size: createdProperty.size,
            price: createdProperty.price,
            picture: createdProperty.picture,
            bathRooms: createdProperty.property_meta_details.find((meta) => meta.property_type_listings.key === 'bathrooms')?.value || "0",
            bedRooms: createdProperty.property_meta_details.find((meta) => meta.property_type_listings.key === 'rooms')?.value || "0",
            district: createdProperty.districts?.langTranslation
                ? lang === 'fr'
                ? createdProperty.districts.langTranslation.fr_string
                : createdProperty.districts.langTranslation.en_string
                : null,
            meta_details: createdProperty.property_meta_details.map((meta) => {
                const langObj = lang === 'en'
                    ? meta.property_type_listings?.lang_translations?.en_string
                    : meta.property_type_listings?.lang_translations?.fr_string;

                return {
                    id: meta.property_type_listings?.id || null,
                    type: meta.property_type_listings?.type || null,
                    key: meta.property_type_listings?.key || null,
                    name: langObj,
                    value: meta.value,
                };
            }),
            type: lang === 'fr'
                ? createdProperty.property_types?.lang_translations?.fr_string
                : createdProperty.property_types?.lang_translations?.en_string,

            currency: createdProperty.currency
            ? createdProperty.currency.symbol
            : null,


            neighborhood: createdProperty.neighborhoods?.langTranslation
                ? lang === 'fr'
                ? createdProperty.neighborhoods.langTranslation.fr_string
                : createdProperty.neighborhoods.langTranslation.en_string
                : null,
        };
        return await response.success(res, res.__('messages.propertyCreatedSuccessfully'), simplifiedProperty);
    } catch (error) {
        console.error('Error creating property:', error);
        return await response.serverError(res, res.__('messages.errorCreatingProperty'));
    }
};


export const updateProperty = async (req, res) => {
  const updatedBy = req.user.id;
  const { propertyId, title_en, title_fr, description_en, description_fr, price, currency_id, neighborhoods_id, district_id, city_id,
          state_id, latitude, longitude, address, vr_link, picture, video, user_id, type_id, transaction, size, meta_details, direction} = req.body;

  try {
    if (!propertyId || !isUUID(propertyId)) {
      return await response.error(res, res.__('messages.invalidPropertyId'));
    }

    const existingProperty = await prisma.propertyDetails.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return await response.error(res, res.__('messages.propertyNotFound'));
    }


    const propertyTitleExist = await prisma.propertyDetails.findFirst({
      where: {
        OR: [
          { lang_translations: { en_string: title_en } },
          { lang_translations: { fr_string: title_fr } },
        ],
      },
    })

    if(propertyTitleExist && propertyTitleExist.id !== existingProperty.id){
      return response.error(res, res.__('messages.propertyExists'), null, 400);
    }

    if (title_en || title_fr) {
      await prisma.langTranslations.update({
        where: { id: existingProperty.title },
        data: {
          en_string: title_en || existingProperty.title_en,
          fr_string: title_fr || existingProperty.title_fr,
          updated_by: user_id,
        },
      });
    }

    if (description_en || description_fr) {
      await prisma.langTranslations.update({
        where: { id: existingProperty.description },
        data: {
          en_string: description_en || existingProperty.description_en,
          fr_string: description_fr || existingProperty.description_fr,
          updated_by: user_id,
        },
      });
    }

    if (district_id && !isUUID(district_id)) {
      return await response.error(res, res.__('messages.invalidDistrictId'));
    }

    const updateData = {
      price: price !== undefined ? price : existingProperty.price,
      district_id: district_id !== undefined ? district_id : existingProperty.district_id,
      city_id: city_id !== undefined ? city_id : existingProperty.city_id,
      state_id: state_id !== undefined ? state_id : existingProperty.state_id,
      latitude: latitude !== undefined ? latitude : existingProperty.latitude,
      direction: direction !== undefined ? direction : existingProperty.direction,
      address: address !== undefined ? address : existingProperty.address,
      currency_id: currency_id !== undefined ? currency_id : existingProperty.currency_id,
      neighborhoods_id: neighborhoods_id !== undefined ? neighborhoods_id : existingProperty.neighborhoods_id,
      longitude: longitude !== undefined ? longitude : existingProperty.longitude,
      vr_link: vr_link !== undefined ? vr_link : existingProperty.vr_link,
      picture: picture !== undefined ? picture : existingProperty.picture,
      video: video !== undefined ? video : existingProperty.video,
      user_id,
      type: type_id !== undefined ? type_id : existingProperty.type,
      transaction: transaction !== undefined ? transaction : existingProperty.transaction,
      size: size !== undefined ? size : existingProperty.size,
      updated_by:updatedBy
    };

    const updatedProperty = await prisma.propertyDetails.update({
      where: { id: propertyId },
      data: 
        updateData
    });

    if (meta_details && meta_details.length > 0) {
      await prisma.propertyMetaDetails.deleteMany({
        where: { property_detail_id: propertyId },
      });

      await prisma.propertyMetaDetails.createMany({
        data: meta_details.map((meta) => ({
          property_detail_id: propertyId,
          value: meta.value,
          property_type_id: meta.property_type_id,
        })),
      });
    }

    const updatedPropertyDetails = await prisma.propertyDetails.findUnique({
      where: { id: updatedProperty.id },
      include: {
        ...userInclude,
        ...langTranslationsInclude,
        ...districtsInclude,
        ...cityInclude,
        ...stateInclude,
        ...neighborhoodInclude,
        ...currencyInclude,
        ...propertyMetaDetailsInclude,
        ...propertyTypesInclude
      },
    });

    const lang = res.getLocale();
    const simplifiedProperty = {
      id: updatedPropertyDetails.id,
      user_name: updatedPropertyDetails.users?.full_name || null,
      user_image: updatedPropertyDetails.users?.image || null,
      description:
        lang === "fr"
          ? updatedPropertyDetails.lang_translations_property_details_descriptionTolang_translations.fr_string
          : updatedPropertyDetails.lang_translations_property_details_descriptionTolang_translations.en_string,
      title:
        lang === "fr"
          ? updatedPropertyDetails.lang_translations.fr_string
          : updatedPropertyDetails.lang_translations.en_string,
      transaction: `${res.__("messages.propertyType")} ${updatedPropertyDetails.transaction}`,
      transaction_type: updatedPropertyDetails.transaction,
      latitude: updatedPropertyDetails.latitude,
      longitude: updatedPropertyDetails.longitude,
      address: updatedPropertyDetails.address,
      direction: updatedPropertyDetails.direction,
      size: updatedPropertyDetails.size,
      price: updatedPropertyDetails.price,
      currency: updatedPropertyDetails.currency.symbol,
      bathRooms:
        updatedPropertyDetails.property_meta_details.find(
          (meta) => meta.property_type_listings.key === "bathrooms"
        )?.value || 0,
      bedRooms:
        updatedPropertyDetails.property_meta_details.find(
          (meta) => meta.property_type_listings.key === "rooms"
        )?.value || 0,
      district:
        updatedPropertyDetails.districts?.langTranslation &&
        (lang === "fr"
          ? updatedPropertyDetails.districts.langTranslation.fr_string
          : updatedPropertyDetails.districts.langTranslation.en_string),
      city:
      (lang === "fr"
        ? updatedPropertyDetails.cities.lang.fr_string
        : updatedPropertyDetails.cities.lang.en_string),
      state:
      (lang === "fr"
        ? updatedPropertyDetails.states?.lang?.fr_string
        : updatedPropertyDetails.states?.lang?.en_string),
      neighborhood:
        updatedPropertyDetails.neighborhoods?.langTranslation &&
        (lang === "fr"
          ? updatedPropertyDetails.neighborhoods.langTranslation.fr_string
          : updatedPropertyDetails.neighborhoods.langTranslation.en_string),
      meta_details: updatedPropertyDetails.property_meta_details.map((meta) => ({
        id: meta.property_type_listings?.id || null,
        type: meta.property_type_listings?.type || null,
        key: meta.property_type_listings?.key || null,
        name:
          lang === "en"
            ? meta.property_type_listings?.lang_translations?.en_string
            : meta.property_type_listings?.lang_translations?.fr_string,
        value: meta.value,
      })),
      type:
        lang === "fr"
          ? updatedPropertyDetails.property_types?.lang_translations?.fr_string
          : updatedPropertyDetails.property_types?.lang_translations?.en_string,
    };

    return await response.success(res, res.__('messages.propertyUpdatedSuccessfully'), simplifiedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    return await response.serverError(res, res.__('messages.errorUpdatingProperty'));
  }
};


export const deleteProperty = async (req, res) => {
    const { propertyId } = req.params;

    try {
        if (!propertyId) {
            return await response.error(res, res.__('messages.propertyIdRequired'));
        }

        const existingProperty = await prisma.propertyDetails.findUnique({
            where: { id: propertyId },
        });

        if (!existingProperty) {
          return await response.error(res, res.__('messages.propertyNotFound'));
        }

        await prisma.propertyMetaDetails.deleteMany({
            where: { property_detail_id: propertyId },
        });

        await prisma.propertyDetails.delete({
            where: { id: propertyId },
        });

        return await response.success(res, res.__('messages.propertyDeletedSuccessfully'), null);
    } catch (error) {
        console.error('Error deleting property:', error);
        return await response.serverError(res, res.__('messages.errorDeletingProperty'));
    }
};


export const statusUpdateProperty = async (req, res) => {
  const { id } = req.body;

  try {
    // Check if id is provided
    if (!id) {
      return await response.error(res, res.__('messages.idRequired'));
    }

    // Find the existing property
    const existingProperty = await prisma.propertyDetails.findUnique({
      where: { id: id },
    });

    // Check if the property exists
    if (!existingProperty) {
      return await response.error(res, res.__('messages.projectNotFound'));
    }

    // Toggle the status
    const updatedStatus = !existingProperty.status;

    // Update the property status
    await prisma.propertyDetails.update({
      where: { id: id },
      data: {
        status: updatedStatus,
      },
    });

    // Update the related property meta details if necessary
    await prisma.propertyMetaDetails.updateMany({
      where: { property_detail_id: id },
      data: {
        property_detail_id: id 
      },
    });

    // Return success response
    return await response.success(res, res.__('messages.propertyUpdatedSuccessfully'), null);
  } catch (error) {
    console.error('Error statusUpdate property:', error);
    return await response.serverError(res, res.__('messages.errorstatusUpdateProperty'));
  }
};
