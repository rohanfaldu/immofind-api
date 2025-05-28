import { PrismaClient } from '@prisma/client';
import User from '../models/userModel.js';
import response from "../components/utils/response.js";
import passwordGenerator from "../components/utils/passwordGenerator.js";
import crypto from 'crypto';
import slugify from 'slugify';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create a developer
import jwt from 'jsonwebtoken';
const generateUniqueSlug = async (baseSlug, attempt = 0) => {
  const slug = attempt > 0 ? `${baseSlug}-${attempt}` : baseSlug;
  const existingSlug = await prisma.developers.findUnique({
    where: { slug: slug || undefined }, // Handle null or undefined slugs
  });
  
  return existingSlug ? generateUniqueSlug(baseSlug, attempt + 1) : slug;
};
export const createDeveloper = async (req, res) => {
  // Extract locale and auth data
  const lang = req.getLocale(); // Assuming your app supports locale retrieval

  // Verify the authorization token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Authorization token missing or invalid', null, 401);
  }

  const token = authHeader.split(' ')[1];
  let createdUserId;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    createdUserId = decodedToken.id; // The ID of the user creating the developer profile
  } catch (err) {
    return response.error(res, 'Invalid or expired token', null, 401);
  }

  // Destructure request body
  const {
    user_id,
    credit,
    description_en,
    description_fr,
    facebook_link,
    twitter_link,
    youtube_link,
    pinterest_link,
    linkedin_link,
    instagram_link,
    service_area_en,
    service_area_fr,
    tax_number,
    country_code,
    license_number,
    whatsup_number,
    agency_packages,
    cover,
    latitude,
    longitude,
    address,
    city_id
  } = req.body;

  try {
    // Check if the user exists and has the 'developer' role
    const existingUser = await prisma.users.findUnique({
      where: { id: user_id },
      include: { roles: true },
    });

    if (!existingUser) {
      return response.error(res, res.__('messages.userNotFound'), null);
    }

    if (existingUser.roles.name !== 'developer') {
      return response.error(
        res,
        res.__('messages.userNotAuthorizedToCreateDeveloper'),
        null
      );
    }

    // Check if developer profile already exists
    const existingDeveloper = await prisma.developers.findUnique({
      where: { user_id },
    });

    if (existingDeveloper) {
      return response.error(res, res.__('messages.developerAlreadyExists'), null);
    }

    const baseSlug = slugify(existingUser.full_name, { lower: true, replacement: '_', strict: true });
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    // Create translations
    const descriptionTranslation = await prisma.langTranslations.create({
      data: { en_string: description_en, fr_string: description_fr },
    });

    const serviceAreaTranslation = await prisma.langTranslations.create({
      data: { en_string: service_area_en, fr_string: service_area_fr },
    });

    // Prepare developer data
    const developerData = {
      user_id: existingUser.id,
      credit,
      description: descriptionTranslation.id,
      facebookLink: facebook_link,
      twitterLink: twitter_link,
      youtubeLink: youtube_link,
      pinterestLink: pinterest_link,
      linkedinLink: linkedin_link,
      instagramLink: instagram_link,
      whatsappPhone: whatsup_number,
      agencyPackageId: agency_packages,
      serviceArea: serviceAreaTranslation.id,
      taxNumber: tax_number,
      country_code,
      licenseNumber: license_number,
      cover,
      created_by: createdUserId, // Use createdUserId instead of userId
      address : address,
      latitude : latitude ?? 33.5724032,
      longitude : longitude ?? -7.6693941,
      city_id: city_id,
      slug: uniqueSlug
    };

    // Create developer profile
    const developer = await prisma.developers.create({
      data: developerData,
    });

    // Fetch translation data
    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });

    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    // Select translation based on locale
    const description =
      lang === 'fr'
        ? descriptionTranslationData.fr_string
        : descriptionTranslationData.en_string;
    const service_area =
      lang === 'fr'
        ? serviceAreaTranslationData.fr_string
        : serviceAreaTranslationData.en_string;

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
      agency_packages: developer.agencyPackageId,
      cover: developer.cover,
      address: developer.address,
      latitude: developer.latitude,
      longitude: developer.longitude,
      city_id: developer.city_id
    };

    // Convert BigInt fields to string for response
    const safeDeveloper = JSON.parse(
      JSON.stringify(responseData, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response.success(
      res,
      res.__('messages.developerCreatedSuccessfully'),
      { developer: safeDeveloper }
    );
  } catch (err) {
    console.error('Error creating developer:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack }
    );
  }
};





// Get all developers

export const getAllDevelopers = async (req, res) => {
  try {
    const { page = 1, limit = 10, city_id, user_name  } = req.body;
    const lang = res.getLocale();

    const validPage = Math.max(1, parseInt(page, 10)); // Default to 1 if invalid
    const validLimit = Math.max(1, parseInt(limit, 10)); // Default to 1 if invalid

    // Calculate the offset (skip) for pagination
    const skip = (validPage - 1) * validLimit;

    // Fetch total count for properties
    
    const filter = {};
    if (city_id) {
      filter.city_id = city_id;
    }

    if (user_name) {
      filter.users = { 
        // Use a case-insensitive partial match:
        user_name: { contains: user_name, mode: 'insensitive' }
      };
    }

    const totalCount = await prisma.developers.count({
      where: filter,
    });


    const developers = await prisma.developers.findMany({skip,
      take: validLimit,
      where: filter,
      include: {
        lang_translations_description: true, 
        lang_translations_service_area: true,
      },});


    // Helper function to fetch translations
    const fetchTranslation = async (id) => {
      if (!id) return null;
      const translation = await prisma.langTranslations.findUnique({ where: { id } });
      // console.logg('translation: ', translation);
      return lang === 'fr' ? translation?.fr_string : translation?.en_string;
    };

    const cityName = async (id) => {
      if (!id) return null;
      const city = await prisma.cities.findUnique({ where: { id } });
      // console.logg('city: ', city);
      return await fetchTranslation(city?.lang_id); // Return the translation
    };
    
    // Prepare the response data

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
          credit: developer.credit,
          description: await fetchTranslation(developer.description),
          city: await cityName(developer.city_id),
          facebook_link: developer.facebookLink,
          twitter_link: developer.twitterLink,
          youtube_link: developer.youtubeLink,
          pinterest_link: developer.pinterestLink,
          linkedin_link: developer.linkedinLink,
          instagram_link: developer.instagramLink,
          whatsup_number: developer.whatsup_number,
          service_area: await fetchTranslation(developer.serviceArea),
          tax_number: developer.taxNumber,
          license_number: developer.licenseNumber,
          agency_packages: developer.agencyPackageId,
          picture: developer.picture,
          cover: developer.cover,
          meta_id: developer.meta_id,
          is_deleted: developer.is_deleted,
          created_at: developer.created_at,
          updated_at: developer.updated_at,
          created_by: developer.created_by,
          updated_by: developer.updated_by,
          cover: developer.cover,
          publishing_status_id: developer.publishingStatusId,
          sub_user_id: developer.sub_user_id,
          country_code: developer.country_code, 
          user_name: userInfo?.user_name,
          full_name: userInfo?.full_name,
          image: userInfo?.image,
          user_email_adress: userInfo?.email_address,
          slug: developer.slug,
        }
      })
    );
    console.log(developerResponseData, ">>>>>>>>>>>>>> developerResponseData")
    const safeDevelopers = developerResponseData.map(developer =>
      JSON.parse(
        JSON.stringify(developer, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      ));

    const responseData = {
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
      list: safeDevelopers,
    };

    
    // Return success response with the agencies data
    return res.status(200).json({
      status: true,
      message: res.__('messages.develoersRetrievedSuccessfully'),
      data: responseData,
    });
  } catch (err) {
    // Handle any errors that occur during the query
    console.error('Error fetching agencies:', err);
    return res.status(500).json({
      status: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};



export const getDeveloperById = async (req, res) => {
  try {
    const { developer_slug } = req.body;
    const lang = res.getLocale();
    if (!developer_slug) {
      return response.error(
        res,
        res.__('messages.developerIdMissing'),
        null,
        400 // Bad Request
      );
    }

    const developer = await prisma.developers.findUnique({
      where: { slug: developer_slug },
      include: {
        lang_translations_description: true, 
        lang_translations_service_area: true,
      }
    });

    // console.logg(developer,"developer")

    const fetchTranslation = async (id) => {
      if (!id) return null;
      const translation = await prisma.langTranslations.findUnique({ where: { id } });
      return lang === 'fr' ? translation?.fr_string : translation?.en_string;
    };

    const userInfo = await prisma.users.findUnique({
      where: {
        id: developer.user_id,
      }
    });

    const properties = await prisma.propertyDetails.findMany({
      where: { user_id: developer.user_id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address:true,
            mobile_number: true,
            country_code: true,
          },
        },
        lang_translations_property_details_descriptionTolang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        districts: {
        select: {
            langTranslation: {
            select: {
                en_string: true,
                fr_string: true,
            },
            },
        },
        },
        property_meta_details: {
          select: {
            value: true,
            property_type_listings: {
              select: {
                id: true,
                name: true,
                type: true,
                icon: true,
                key: true,
                lang_translations: {
                  select: {
                    en_string: true,
                    fr_string: true,
                  },
                },
              },
            },
          },
        },
        currency: {
          select: {
              name: true,
              symbol: true,
              status: true
          }
        },
        cities: {
          select: {
            lang: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
        states:{
          select: {
            lang: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
        neighborhoods: {
          select: {
              langTranslation: {
              select: {
                  en_string: true,
                  fr_string: true,
              },
              },
          },
          },
        property_types: {
          select: {
            id: true,
            title: true,
            lang_translations: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
      },
    });

    const projectList = await prisma.projectDetails.findMany({
      where: { user_id: developer.user_id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
          },
        },
        lang_translations_title: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations_description: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        states: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        districts: {
          select: { 
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
        },
        currency: {  // Include the currency relation
          select: {
            id: true,
            name: true,
            symbol: true,  // Adjust this field name based on your Currency model definition
          },
        },
        neighborhoods: {
          select: {
            langTranslation: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
        project_meta_details: {
          select: {
            value: true,
            project_type_listing: {
              select: {
                id: true,
                name: true,
                type: true,
                key: true,
                icon: true,
                lang_translations: {
                  select: {
                    en_string: true,
                    fr_string: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const simplifiedProject = projectList.map((project) => {
        return{
        id: project.id,
        user_name: project.users?.full_name || null,
        user_image: project.users?.image || null,
        title_en: project.lang_translations_title?.en_string,
        title_fr: project.lang_translations_title?.fr_string,
        description_fr: project.lang_translations_description?.fr_string,
        description_en: project.lang_translations_description?.en_string,
        slug: project.slug,
        state: lang === 'fr' ? project.states?.lang?.fr_string : project.states?.lang?.en_string,
        city: lang === 'fr' ? project.cities?.lang?.fr_string : project.cities?.lang?.en_string,
        district: lang === 'fr' ? project.districts?.langTranslation?.fr_string : project.districts?.langTranslation?.en_string,
        neighborhood: lang === 'fr' ? project.neighborhoods?.langTranslation?.fr_string : project.neighborhoods?.langTranslation?.en_string,
        latitude: project.latitude,
        longitude: project.longitude,
        currency: project.currency?.name || null,
        address: project.address,
        price: project.price,
        icon: project.icon,
        vr_link: project.vr_link,
        picture: project.picture,
        video: project.video,
        created_at: project.created_at,
        updated_at: project.updated_at,
        created_by: project.created_by,
        updated_by: project.updated_by,
        status: project.status,
        meta_details: project.project_meta_details.map((meta) => ({
          id: meta.project_type_listing?.id || null,
          type: meta.project_type_listing?.type || null,
          key: meta.project_type_listing?.key || null,
          name: lang === 'en'
            ? meta.project_type_listing?.lang_translations?.en_string
            : meta.project_type_listing?.lang_translations?.fr_string,
          value: meta.value,
          icon: meta.project_type_listing?.icon || null,
        })),
        }
    })

    // Simplify and process the property details
    const simplifiedProperties = properties.map((property) => {
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

      return {
        id: property.id,
        user_name: property.users?.full_name || null,
        user_image: property.users?.image || null,
        email_address:property.users?.email_address || null,
        description,
        title,
        transaction: propertyType,
        transaction_type: property.transaction,
        picture: property.picture,
        video: property.video,
        latitude: property.latitude,
        longitude: property.longitude,
        address: property.address,
        size: property.size,
        price: property.price,
        created_at: property.created_at,
        slug: property.slug,
        bathRooms,
        bedRooms,
        district: 
        property.districts?.langTranslation &&
        (lang === "fr"
          ? property.districts.langTranslation.fr_string
          : property.districts.langTranslation.en_string),
        images: property.images_data,
        currency: property.currency?.name || null,
        neighborhood,
        city: lang === 'fr' ? property.cities?.lang?.fr_string : property.cities?.lang?.en_string,
        state: lang === 'fr' ? property.states?.lang?.fr_string : property.states?.lang?.en_string,
        type_details: [{
          id: property.property_types?.id || null,
          title: type,
        }],
      };
    });

    const cityName = async (id) => {
      if (!id) return null;
      const city = await prisma.cities.findUnique({ where: { id } });
      // console.logg('city: ', city);
      return await fetchTranslation(city?.lang_id); // Return the translation
    };

    const responseData = {
      id: developer.id,
        user_id: developer.user_id,
        credit: developer.credit,
        description: await fetchTranslation(developer.description),
        description_en: developer.lang_translations_description?.en_string,
        description_fr: developer.lang_translations_description?.fr_string,
        facebook_link: developer.facebookLink,
        twitter_link: developer.twitterLink,
        youtube_link: developer.youtubeLink,
        pinterest_link: developer.pinterestLink,
        linkedin_link: developer.linkedinLink,
        instagram_link: developer.instagramLink,
        whatsup_number: developer.whatsup_number,
        service_area: await fetchTranslation(developer.serviceArea),
        tax_number: developer.taxNumber,
        license_number: developer.licenseNumber,
        agency_packages: developer.agencyPackageId,
        picture: developer.picture,
        city: await cityName(developer.city_id),
        address: developer.address,
        latitude: developer.latitude,
        longitude: developer.longitude,
        cover: developer.cover,
        meta_id: developer.meta_id,
        is_deleted: developer.is_deleted,
        created_at: developer.created_at,
        updated_at: developer.updated_at,
        created_by: developer.created_by,
        updated_by: developer.updated_by,
        publishing_status_id: developer.publishingStatusId,
        sub_user_id: developer.sub_user_id,
        country_code: developer.country_code,
        user_name: userInfo?.user_name,
        full_name: userInfo?.full_name,
        image: userInfo?.image,
        user_email_adress: userInfo?.email_address,
        user_mobile_number: userInfo?.mobile_number,
        user_country_code: userInfo?.country_code,
        property_details: simplifiedProperties,
        project_details: simplifiedProject
    };


    if (!developer) {
      return response.error(
        res,
        res.__('messages.developerNotFound'),
        null,
        404
      );
    }

    const safeDeveloper = JSON.parse(
      JSON.stringify(responseData, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response.success(
      res,
      res.__('messages.developerRetrievedSuccessfully'),
      { developer: safeDeveloper }
    );
  } catch (err) {
    console.error('Error retrieving developer:', err);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack }
    );
  }
};



export const getByUserId = async (req, res) => {
  try {
    // Extract user_id from the authenticated user
    const { user_id } = req.body;

    const usersData = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    })

    const developerData = await prisma.developers.findUnique({
      where: {
        user_id: user_id,
      },
      select: { // Move select here
        id: true,
        country_code: true,
        whatsappPhone: true,
        taxNumber: true,
        licenseNumber: true,
        credit: true,
        lang_translations_description: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        lang_translations_service_area: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        agencyPackageId:true,
        facebookLink: true,
        twitterLink: true,
        youtubeLink: true,
        pinterestLink: true,
        linkedinLink: true,
        instagramLink: true,
        cover: true,
        address: true,
        latitude: true,
        longitude: true,
        city_id: true,
      },
    });

    const user = {
      user_name: usersData?.user_name,
      full_name: usersData?.full_name,
      image: usersData?.image,
      user_email_adress: usersData?.email_address,
       mobile_number: usersData?.mobile_number?.toString(),
      password:usersData?.password,
      country_code:usersData?.country_code
    }

    const developer = {
      id:developerData?.id,
      description_en: developerData?.lang_translations_description?.en_string,
      description_fr: developerData?.lang_translations_description?.fr_string,
      whatsup_number: developerData?.whatsappPhone,
      country_code: developerData?.country_code,
      service_area_en: developerData?.lang_translations_service_area?.en_string,
      service_area_fr: developerData?.lang_translations_service_area?.fr_string,
      credit: developerData?.credit,
      tax_number: developerData?.taxNumber,
      license_number: developerData?.licenseNumber,
      agency_packages: developerData?.agencyPackageId,
      facebook_link: developerData?.facebookLink,
      twitter_link: developerData?.twitterLink,
      youtube_link: developerData?.youtubeLink,
      pinterest_link: developerData?.pinterestLink,
      linkedin_link: developerData?.linkedinLink,
      instagram_link: developerData?.instagramLink,
      cover: developerData?.cover,
      address: developerData?.address,
      latitude: developerData?.latitude,
      longitude: developerData?.longitude,
      city_id: developerData?.city_id
    }

    const responseData = {
      user,
      developer
    }


    // Return success response with the agencies data
    return res.status(200).json({
      status: true,
      message: res.__('messages.agenciesRetrievedSuccessfully'),
      data: responseData,
    });
  } catch (err) {
    // Handle any errors that occur during the query
    console.error('Error fetching agencies:', err);
    return res.status(500).json({
      status: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};




const transformBigIntToString = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};
// Update a developer
export const updateDeveloper = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Validate the UUID format
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    if (!isValidUUID) {
      return response.error(res, res.__('messages.invalidUUIDFormat'), null);
    }

    const {
      description_en,
      description_fr,
      service_area_en,
      service_area_fr,
      credit,
      facebook_link,
      twitter_link,
      youtube_link,
      pinterest_link,
      linkedin_link,
      instagram_link,
      whatsup_number,
      country_code,
      tax_number,
      license_number,
      agency_packages,
      cover,
      city_id,
      address,
      latitude,
      longitude,
    } = req.body;

    // Check if the developer exists
    const existingDeveloper = await prisma.developers.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      return response.error(res, res.__('messages.developerNotFound'), null);
    }

    // Update developer details
    const developer = await prisma.developers.update({
      where: { id },
      data: {
        credit,
        facebookLink: facebook_link,
        twitterLink: twitter_link,
        youtubeLink: youtube_link,
        pinterestLink: pinterest_link,
        linkedinLink: linkedin_link,
        instagramLink: instagram_link,
        whatsappPhone: whatsup_number,
        country_code,
        taxNumber: tax_number,
        licenseNumber: license_number,
        updated_by: user_id,
        updated_at: new Date(),
        agencyPackageId: agency_packages,
        cover: cover,
        city_id: city_id,
        latitude: latitude ?? 33.5724032,
        longitude: longitude ?? -7.6693941,
        address: address,
      },
    });

    // Update descriptions if provided
    if (description_en || description_fr) {
      const descriptionId = developer.description;
      await prisma.langTranslations.update({
        where: { id: descriptionId },
        data: {
          ...(description_en && { en_string: description_en }),
          ...(description_fr && { fr_string: description_fr }),
        },
      });
    }

    if (service_area_en || service_area_fr) {
      const serviceAreaId = developer.serviceArea;
      await prisma.langTranslations.update({
        where: { id: serviceAreaId },
        data: {
          ...(service_area_en && { en_string: service_area_en }),
          ...(service_area_fr && { fr_string: service_area_fr }),
        },
      });
    }

    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.description },
    });
    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: developer.serviceArea },
    });

    const lang = res.getLocale();

    const responseData = {
      id: developer.id,
      user_id: developer.user_id,
      credit: developer.credit,
      description: lang === 'fr' ? descriptionTranslationData?.fr_string : descriptionTranslationData?.en_string,
      facebook_link: developer.facebookLink,
      twitter_link: developer.twitterLink,
      youtube_link: developer.youtubeLink,
      pinterest_link: developer.pinterestLink,
      linkedin_link: developer.linkedinLink,
      instagram_link: developer.instagramLink,
      whatsapp_phone: developer.whatsappPhone,
      service_area: lang === 'fr' ? serviceAreaTranslationData?.fr_string : serviceAreaTranslationData?.en_string,
      tax_number: developer.taxNumber,
      country_code: developer.country_code,
      license_number: developer.licenseNumber,
      agency_packages: developer.agencyPackageId,
      cover: developer.cover,
    };

    const safeResponse = transformBigIntToString(responseData);

    return response.success(res, res.__('messages.developerUpdatedSuccessfully'), safeResponse);
  } catch (err) {
    console.error('Error updating developer:', err);
    return response.serverError(res, res.__('messages.internalServerError'), err.message);
  }
};





// // Delete a developer
// export const deleteDeveloper = async (req, res) => {
//     const { id } = req.params; // Assuming the developer ID is passed in the request params

//     try {
//         // Step 1: Fetch the developer by ID
//         const developer = await prisma.developers.findUnique({
//             where: { id: id },  // Look up the developer by the ID
//         });

//         if (!developer) {
//             // Developer not found
//             return response.error(res, res.__('messages.developerNotFound'), null);
//         }

//         // Step 2: Delete the developer using the `user_id`
//         const deletedDeveloper = await prisma.developers.delete({
//             where: { user_id: developer.user_id },  // Delete using the developer's `user_id`
//         });

//         // Step 3: Delete the associated user from the `users` table
//         const deletedUser = await prisma.users.delete({
//             where: { id: developer.user_id },  // Assuming `user_id` maps to the `users` table
//         });

//         // Send a success response with the details of deleted developer and user
//         return response.success(
//             res,
//             res.__('messages.developerAndUserDeletedSuccessfully')
//         );
//     } catch (err) {
//         // Log the error for debugging
//         console.error('Error deleting developer and user:', err);

//         // Return a server error response
//         return response.serverError(res, res.__('messages.internalServerError'), err.message);
//     }
// };



export const deleteDeveloper = async (req, res) => {
  try {
    const { id: user_id } = req.params;

    if (!user_id) {
      return response.error(res, res.__('messages.invalidUserId'), null);
    }

    const existingDeveloper = await prisma.developers.findUnique({
      where: { user_id },
    });

    if (!existingDeveloper) {
      return response.error(res, res.__('messages.developerNotFound'), null);
    }

    // Fetch property details (adjusted for `findFirst`)
    const findMeta = await prisma.propertyDetails.findFirst({
      where: { user_id },
    });

    // console.logg(findMeta,"findMeta")

    // Perform all deletions in a transaction
    await prisma.$transaction([
      // Delete related project meta details
      prisma.projectMetaDetails.deleteMany({
        where: { project_detail_id: findMeta?.project_id },
      }),
      
      // Delete property meta details if applicable
      prisma.propertyMetaDetails.deleteMany({
        where: { property_detail_id: findMeta?.id },
      }),
    
      // Delete property details
      prisma.propertyDetails.deleteMany({
        where: { user_id },
      }),
    
      // Delete project details
      prisma.projectDetails.deleteMany({
        where: { user_id },
      }),
    
      // Finally, delete the developer
      prisma.developers.delete({
        where: { user_id },
      }),
    ]);
    

    return response.success(res, res.__('messages.developerDeletedSuccessfully'), null);
  } catch (err) {
    console.error('Error deleting developer:', err);
    return response.serverError(res, res.__('messages.internalServerError'), err.message);
  }
};