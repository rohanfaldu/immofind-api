import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';

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

const prisma = new PrismaClient();

// Store Recommended Propert //
export const createPropertyRecommended = async (req, res) => {
    const { property_id, user_id } = req.body;

    // Validate required fields
    if (!property_id || !user_id) {
        return response.error(res, res.__('messages.missingFields'));
    }

    try {
        // Validate User existence
        const userExists = await prisma.users.count({
            where: { id: user_id }
        });
        if (userExists === 0) {
            return response.error(res, res.__('messages.userNotFound'));
        }

        // Validate Property existence
        const propertyExists = await prisma.propertyDetails.count({
            where: { id: property_id }
        });
        if (propertyExists === 0) {
            return response.error(res, res.__('messages.propertyNotFound'));
        }

        // Check if a recommendation already exists
        const existingRecommendation = await prisma.propertyRecommended.findFirst({
            where: {
                property_id,
                user_id
            }
        });

        let recommendation;

        if (existingRecommendation) {
            // If exists, update the updated_at field
            recommendation = await prisma.propertyRecommended.update({
                where: {
                    id: existingRecommendation.id
                },
                data: {
                    updated_at: new Date()
                },
                include: {
                    user_property_recommended: true,
                    property_detail_recommnded: true,
                }
            });
        } else {
            // If not exists, create a new recommendation
            recommendation = await prisma.propertyRecommended.create({
                data: {
                    property_id,
                    user_id,
                },
                include: {
                    user_property_recommended: true,
                    property_detail_recommnded: true,
                }
            });
        }

        return response.success(res, res.__('messages.propertyRecommendedSuccess'), recommendation);

    } catch (error) {
        console.error('Error in createPropertyRecommended:', error);
        return response.error(res, res.__('messages.propertyRecommendedError'));
    }
};



// Get Recommended Propert //
export const getRecommendedProperties = async (req, res) => {
try {

    const user_id = req.user?.id;
    const propertyCount = await prisma.propertyRecommended.count({
        where: { user_id: user_id }
    }); 
    
    if(propertyCount === 0){
        return response.error(res, res.__('No Property Found'));
    }

    const propertylist = await prisma.propertyRecommended.findMany({
        where: { user_id: user_id }
    });
    
    let allPropertyList = [];

    await Promise.all(propertylist.map(async (propertyData) => {

        const property = await prisma.propertyDetails.findUnique({
            where: { id: propertyData.property_id },
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


        const lang = res.getLocale();

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
            // console.log(developer,"ll")

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

        let responseProjectData = null;
        if (property.project_id !== null) {
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
            vr_link: property.vr_link ?? null,
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
            type_details: {
                id: property.property_types?.id || null,
                title: type,
            },
            project_details: responseProjectData,
            like: likedPropertyIds.includes(property.id),
            filter_result: {
                location: 0,
                price: 0,
                surface_area: 0,
                property_type: 0,
                amenities: 0,
                room_amenities: 0,
                construction_year_amenities: 0,
                total_percentage: 0,
                exact_distance: 0
            }
        };
        if (responsePayload) {
            allPropertyList.push(responsePayload);
        }
    }));
    return response.success(res, res.__('messages.propertyRecommendedSuccess'), allPropertyList);

    } catch (error) {
        return response.error(res, res.__('something went wrong'));
    }
};