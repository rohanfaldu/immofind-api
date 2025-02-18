import { PrismaClient } from '@prisma/client';
import User from '../models/userModel.js'; // Assuming you have a User model defined
import sendmail from "../components/utils/sendmail.js";
import crypto from 'crypto';
import response from "../components/utils/response.js";
import jwt from 'jsonwebtoken';

// Initialize Prisma Client
const prisma = new PrismaClient(); // Assuming response utility is in place

// Create an agency
export const createAgency = async (req, res) => {
  try {
    // Extract and validate Authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.error(res, 'Authorization token missing or invalid', null, 401);
    }

    const token = authHeader.split(' ')[1];
    let createdUserId;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      createdUserId = decodedToken.id;
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
      whatsup_number,
      service_area_en,
      service_area_fr,
      tax_number,
      license_number,
      picture,
      cover,
      country_code,
      agency_packages,
      latitude,
      longitude,
      address,
      city_id
    } = req.body;


    // Check if the user already has an agency
    const existingAgency = await prisma.agencies.findUnique({ where: { user_id } });
    if (existingAgency) {
      return response.error(res, res.__('messages.agencyAlreadyExists'), null);
    }

    // Create language translations
    const descriptionTranslation = await prisma.langTranslations.create({
      data: { en_string: description_en, fr_string: description_fr },
    });
    const serviceAreaTranslation = await prisma.langTranslations.create({
      data: { en_string: service_area_en, fr_string: service_area_fr },
    });

    // Validate agency package if provided
    let agencyPackagesName = null;
    if (agency_packages) {
      const agencyPackage = await prisma.agencyPackages.findUnique({
        where: { id: agency_packages },
      });

      if (!agencyPackage) {
        return response.error(res, res.__('messages.invalidAgencyPackage'), null);
      }

      const agencyPackageDetails = await prisma.langTranslations.findFirst({
        where: { id: agencyPackage.name },
        select: { en_string: true, fr_string: true },
      });

      if (!agencyPackageDetails) {
        return response.error(res, res.__('messages.invalidAgencyPackageTranslation'), null);
      }

      agencyPackagesName = agencyPackageDetails;
    }

    // Create the agency
    const newAgency = await prisma.agencies.create({
      data: {
        user_id,
        created_by: createdUserId,
        credit,
        description: descriptionTranslation.id,
        facebook_link,
        twitter_link,
        youtube_link,
        pinterest_link,
        linkedin_link,
        instagram_link,
        whatsup_number,
        country_code,
        service_area: serviceAreaTranslation.id,
        tax_number,
        license_number,
        picture,
        cover,
        agency_packages,
        address : address,
        latitude : latitude,
        longitude : longitude,
        city_id: city_id,
      },
    });

    // Fetch translation data for response
    const descriptionData = await prisma.langTranslations.findUnique({
      where: { id: newAgency.description },
    });
    const serviceAreaData = await prisma.langTranslations.findUnique({
      where: { id: newAgency.service_area },
    });

    const lang = res.getLocale();
    const responseData = {
      id: newAgency.id,
      user_id: newAgency.user_id,
      credit: newAgency.credit,
      description: lang === 'fr' ? descriptionData.fr_string : descriptionData.en_string,
      facebook_link: newAgency.facebook_link,
      twitter_link: newAgency.twitter_link,
      youtube_link: newAgency.youtube_link,
      pinterest_link: newAgency.pinterest_link,
      linkedin_link: newAgency.linkedin_link,
      instagram_link: newAgency.instagram_link,
      whatsup_number: newAgency.whatsup_number,
      service_area: lang === 'fr' ? serviceAreaData.fr_string : serviceAreaData.en_string,
      tax_number: newAgency.tax_number,
      license_number: newAgency.license_number,
      picture: newAgency.picture,
      cover: newAgency.cover,
      agency_packages: newAgency.agency_packages,
      country_code: newAgency.country_code,
      address: newAgency.address,
      latitude: newAgency.latitude,
      longitude: newAgency.longitude,
      city_id: newAgency.city_id,
    };

    // Return success response
    return response.success(res, res.__('messages.agencyCreatedSuccessfully'), {
      agency: responseData,
    });
  } catch (err) {
    console.error('Error creating agency:', err.message);
    return response.serverError(
      res,
      res.__('messages.internalServerError'),
      { error: err.message, stack: err.stack }
    );
  }
};








// Get all agencies
export const getAllAgencies = async (req, res) => {
  try {
    const { page = 1, limit = 10, city_id, user_name } = req.body;
    const lang = res.getLocale();

    // Ensure page and limit are valid numbers
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

    const totalCount = await prisma.agencies.count({
      where: filter,
    });


    const agencies = await prisma.agencies.findMany({skip,
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
      return lang === 'fr' ? translation?.fr_string : translation?.en_string;
    };

    const cityName = async (id) => {
      if (!id) return null;
      const city = await prisma.cities.findUnique({ where: { id } });
      console.log('city: ', city);
      return await fetchTranslation(city?.lang_id); // Return the translation
    };
    // Prepare the response data
    const agencyResponseData = await Promise.all(
      agencies.map(async (agency) => {
        const userInfo = await prisma.users.findUnique({
          where: {
            id: agency.user_id,
          }
        });

        return{
          id: agency.id,
          user_id: agency.user_id,
          credit: agency.credit,
          description: await fetchTranslation(agency.description),
          facebook_link: agency.facebook_link,
          twitter_link: agency.twitter_link,
          youtube_link: agency.youtube_link,
          pinterest_link: agency.pinterest_link,
          linkedin_link: agency.linkedin_link,
          city: await cityName(agency.city_id),
          instagram_link: agency.instagram_link,
          whatsup_number: agency.whatsup_number,
          service_area: await fetchTranslation(agency.service_area),
          tax_number: agency.tax_number,
          license_number: agency.license_number,
          agency_packages: agency.agency_packages,
          picture: agency.picture,
          cover: agency.cover,
          meta_id: agency.meta_id,
          is_deleted: agency.is_deleted,
          created_at: agency.created_at,
          updated_at: agency.updated_at,
          created_by: agency.created_by,
          updated_by: agency.updated_by,
          publishing_status_id: agency.publishing_status_id,
          sub_user_id: agency.sub_user_id,
          country_code: agency.country_code,
          user_name: userInfo?.user_name,
          full_name: userInfo?.full_name,
          image: userInfo?.image,
          user_email_adress: userInfo?.email_address,
        }
        
      })
    );

    const responseData = {
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
      list: agencyResponseData,
    };

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

export const getByUserId = async (req, res) => {
  try {
    // Extract user_id from the authenticated user
    const { user_id } = req.body;

    const usersData = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    })

    const agencyData = await prisma.agencies.findUnique({
      where: {
        user_id: user_id,
      },
      select: { // Move select here
        id: true,
        country_code: true,
        whatsup_number: true,
        tax_number: true,
        license_number: true,
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
        agency_packages:true,
        facebook_link: true,
        twitter_link: true,
        youtube_link: true,
        pinterest_link: true,
        linkedin_link: true,
        instagram_link: true,
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

    const agency = {
      id:agencyData?.id,
      description_en: agencyData?.lang_translations_description?.en_string,
      description_fr: agencyData?.lang_translations_description?.fr_string,
      whatsup_number: agencyData?.whatsup_number,
      country_code: agencyData?.country_code,
      service_area_en: agencyData?.lang_translations_service_area?.en_string,
      service_area_fr: agencyData?.lang_translations_service_area?.fr_string,
      credit: agencyData?.credit,
      tax_number: agencyData?.tax_number,
      license_number: agencyData?.license_number,
      agency_packages: agencyData?.agency_packages,
      facebook_link: agencyData?.facebook_link,
      twitter_link: agencyData?.twitter_link,
      youtube_link: agencyData?.youtube_link,
      pinterest_link: agencyData?.pinterest_link,
      linkedin_link: agencyData?.linkedin_link,
      instagram_link: agencyData?.instagram_link,
      cover: agencyData?.cover,
      address: agencyData?.address,
      latitude: agencyData?.latitude,
      longitude: agencyData?.longitude,
      city_id: agencyData?.city_id
    }

    const responseData = {
      user,
      agency
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



// Send password reset email
export const sendMail = async (req, res) => {
    const checkEmail = await User.getUser(req.body.email_address, '');

    if (checkEmail) {
        const code = crypto.randomInt(100000, 999999);
        const to = req.body.email_address;
        const subject = "Password Reset Code";
        const text = `Your password reset code is: ${code}`;

        try {
            const emailData = await sendmail.gmail(to, subject, text); // Wait for email to send

            if (emailData) {
                const data = {
                    reset_password_token: code
                };
                const where = {
                    email_address: req.body.email_address
                };
                const userUpdate = await User.updateUser(where, data);

                if (userUpdate) {
                    return response.success(res, res.__('messages.passwordResetEmailSent'), null);
                } else {
                    return response.error(res, res.__('messages.userDataNotUpdated'), null);
                }
            }
        } catch (error) {
            return response.error(res, res.__('messages.emailSendFailed'), null);
        }
    } else {
        return response.error(res, res.__('messages.userNotFound'), null);
    }
};

// Get an agency by ID
export const getAgencyById = async (req, res) => {
  try {
    // Fetch the agency by its ID using Prisma
    const agency = await prisma.agencies.findUnique({
      where: {
        user_id: req.params.id,
      },
      include: {
        lang_translations_description: true, 
        lang_translations_service_area: true,
        agency_packages_agencies_agency_packagesToagency_packages: {
          include: {
            language: true,
          },
        }
      }
    });

    const lang = res.getLocale();


    const userInfo = await prisma.users.findUnique({
      where: {
        id: agency.user_id,
      }
    });

    const properties = await prisma.propertyDetails.findMany({
      where: { user_id: agency.user_id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address:true,
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
      console.log('city: ', city);
      return await fetchTranslation(city?.lang_id); // Return the translation
    };

    const fetchTranslation = async (id) => {
      if (!id) return null;
      const translation = await prisma.langTranslations.findUnique({ where: { id } });
      return lang === 'fr' ? translation?.fr_string : translation?.en_string;
    };


    const responseData = {
      
      id: agency.id,
      user_id: agency.user_id,
      credit: agency.credit,
      description:  lang === 'fr' ? agency.lang_translations_description?.fr_string : agency.lang_translations_description?.en_string,
      description_en:  lang === 'en' ? agency.lang_translations_description?.en_string : "",
      description_fr:  lang === 'fr' ? agency.lang_translations_service_area?.fr_string : "",
      facebook_link: agency.facebook_link,
      twitter_link: agency.twitter_link,
      youtube_link: agency.youtube_link,
      pinterest_link: agency.pinterest_link,
      linkedin_link: agency.linkedin_link,
      instagram_link: agency.instagram_link,
      whatsup_number: agency.whatsup_number,
      city: await cityName(agency.city_id),
      address: agency.address,
      latitude: agency.latitude,
      longitude: agency.longitude,
      service_area:  lang === 'fr' ? agency.lang_translations_service_area?.fr_string : agency.lang_translations_service_area?.en_string,
      service_area_fr: lang === 'fr' ? agency.lang_translations_service_area?.fr_string : "", 
      service_area_en: lang === 'en' ? agency.lang_translations_service_area?.en_string : "", 
      tax_number: agency.tax_number,
      license_number: agency.license_number,
      agency_packages: agency.agency_packages,
      picture: agency.picture,
      cover: agency.cover,
      meta_id: agency.meta_id,
      is_deleted: agency.is_deleted,
      created_at: agency.created_at,
      updated_at: agency.updated_at,
      created_by: agency.created_by,
      updated_by: agency.updated_by,
      publishing_status_id: agency.publishing_status_id,
      sub_user_id: agency.sub_user_id,
      country_code: agency.country_code,
      user_name: userInfo?.user_name,
      full_name: userInfo?.full_name,
      image: userInfo?.image,
      user_email_adress: userInfo?.email_address,
      user_country_code: userInfo?.country_code,
      user_mobile_number: userInfo?.mobile_number.toString(),
      agency_name: lang === 'fr' ? agency.agency_packages_agencies_agency_packagesToagency_packages?.language?.fr_string : agency.agency_packages_agencies_agency_packagesToagency_packages?.language?.en_string,
      property_details: simplifiedProperties,
    };


    if (agency) {
      return res.status(200).json({
        status: true,
        message: res.__('messages.agencyRetrievedSuccessfully'),
        data: responseData,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: res.__('messages.agencyNotFound'),
        data: null,
      });
    }
  } catch (err) {
    console.error('Error fetching agency:', err);
    return res.status(500).json({
      status: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};

// Update an agency
export const updateAgency = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'Authorization token missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    let user_id;
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      user_id = decodedToken.id;
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: 'Invalid or expired token',
      });
    }

    if (!req.params.id) {
      return res.status(400).json({ status: false, message: 'Agency ID is required' });
    }

    const agency = await prisma.agencies.findUnique({ where: { id: req.params.id } });
    if (!agency) {
      return res.status(404).json({
        status: false,
        message: res.__('messages.agencyNotFound'),
      });
    }

    const {
      credit,
      description_en,
      description_fr,
      facebook_link,
      twitter_link,
      youtube_link,
      pinterest_link,
      linkedin_link,
      instagram_link,
      whatsup_number,
      service_area_en,
      service_area_fr,
      tax_number,
      license_number,
      picture,
      cover,
      country_code,
      agency_packages,
      city_id,
      address,
      latitude,
      longitude,
    } = req.body;

    const updatedAgency = await prisma.agencies.update({
      where: { id: req.params.id },
      data: {
        credit,
        facebook_link,
        twitter_link,
        youtube_link,
        pinterest_link,
        linkedin_link,
        instagram_link,
        whatsup_number,
        tax_number,
        license_number,
        picture,
        cover,
        updated_by: user_id,
        updated_at: new Date(),
        country_code,
        agency_packages,
        city_id: city_id,
        latitude: latitude,
        longitude: longitude,
        address: address,
      },
    });

    if (description_en || description_fr) {
      const descriptionId = agency.description;
      await prisma.langTranslations.update({
        where: { id: descriptionId },
        data: {
          ...(description_en && { en_string: description_en }),
          ...(description_fr && { fr_string: description_fr }),
        },
      });
    }

    if (service_area_en || service_area_fr) {
      const serviceAreaId = agency.service_area;
      await prisma.langTranslations.update({
        where: { id: serviceAreaId },
        data: {
          ...(service_area_en && { en_string: service_area_en }),
          ...(service_area_fr && { fr_string: service_area_fr }),
        },
      });
    }

    const descriptionTranslationData = await prisma.langTranslations.findUnique({
      where: { id: agency.description },
    });
    const serviceAreaTranslationData = await prisma.langTranslations.findUnique({
      where: { id: agency.service_area },
    });

    const lang = res.getLocale();
    const responseData = {
      id: updatedAgency.id,
      user_id: updatedAgency.user_id,
      credit: updatedAgency.credit,
      description: lang === 'fr' ? descriptionTranslationData?.fr_string : descriptionTranslationData?.en_string,
      facebook_link: updatedAgency.facebook_link,
      twitter_link: updatedAgency.twitter_link,
      youtube_link: updatedAgency.youtube_link,
      pinterest_link: updatedAgency.pinterest_link,
      linkedin_link: updatedAgency.linkedin_link,
      instagram_link: updatedAgency.instagram_link,
      whatsup_number: updatedAgency.whatsup_number,
      service_area: lang === 'fr' ? serviceAreaTranslationData?.fr_string : serviceAreaTranslationData?.en_string,
      tax_number: updatedAgency.tax_number,
      license_number: updatedAgency.license_number,
      picture: updatedAgency.picture,
      cover: updatedAgency.cover,
      country_code: updatedAgency.country_code,
      agency_packages: updatedAgency.agency_packages,
      city_id: city_id,
      latitude: latitude,
      longitude: longitude,
      address: address,
    };

    return res.status(200).json({
      status: true,
      message: res.__('messages.agencyUpdatedSuccessfully'),
      data: responseData,
    });
  } catch (err) {
    console.error('Error updating agency:', err);
    return res.status(500).json({
      status: false,
      message: res.__('messages.internalServerError'),
      error: err.message,
    });
  }
};




// Delete an agency
export const deleteAgency = async (req, res) => {
  try {
    const { id: user_id } = req.params; // Extract `id` from `req.params`

    console.log('Request params:', req.params); // Debugging

    // Validate `user_id`
    if (!user_id) {
      return response.error(res, res.__('messages.invalidUserId'), null);
    }

    console.log('Validated user_id:', user_id);

    // Check if the agency exists
    const existingAgency = await prisma.agencies.findUnique({
      where: { user_id },
    });

    if (!existingAgency) {
      return response.error(res, res.__('messages.agencyNotFound'), null);
    }

    console.log('Existing agency found:', existingAgency);

    // Check for property details and related metadata
    const findMeta = await prisma.propertyDetails.findFirst({
      where: { user_id },
    });

    if (findMeta) {
      console.log('Found property details:', findMeta);

      // Delete related metadata
      await prisma.propertyMetaDetails.deleteMany({
        where: { property_detail_id: findMeta.id },
      });
      console.log('Deleted related property meta details.');

      // Delete property details
      await prisma.propertyDetails.deleteMany({
        where: { user_id },
      });
      console.log('Deleted property details.');
    } else {
      console.log('No property details found for user_id:', user_id);
    }

    // Delete agency
    const deletedAgency = await prisma.agencies.delete({
      where: { user_id },
    });

    if (deletedAgency) {
      console.log('Agency deleted successfully:', deletedAgency);
      return response.success(res, res.__('messages.agencyDeletedSuccessfully'), null);
    }

    return response.error(res, res.__('messages.agencyDeletionFailed'), null);
  } catch (err) {
    console.error('Error deleting agency:', err);
    return response.serverError(res, res.__('messages.internalServerError'), err.message);
  }
};


