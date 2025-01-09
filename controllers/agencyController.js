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
    // Extract user_id from the authenticated user
    const { user_id } = req.body;

    const { page = 1, limit = 10 } = req.body;
    const lang = res.getLocale();

    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, parseInt(page, 10)); // Default to 1 if invalid
    const validLimit = Math.max(1, parseInt(limit, 10)); // Default to 1 if invalid

    // Calculate the offset (skip) for pagination
    const skip = (validPage - 1) * validLimit;

    // Fetch total count for properties
    
  
    const totalCount = await prisma.agencies.count();


    const agencies = await prisma.agencies.findMany({skip,
      take: validLimit,
      include: {
        lang_translations_description: true, 
        lang_translations_service_area: true,
      },});
      console.log(agencies);

    // If no agencies found
    if (!agencies || agencies.length === 0) {
      return res.status(404).json({
        status: false,
        message: res.__('messages.noAgenciesFound'),
      });
    }

    // Helper function to fetch translations
    const fetchTranslation = async (id) => {
      if (!id) return null;
      const translation = await prisma.langTranslations.findUnique({ where: { id } });
      return lang === 'fr' ? translation?.fr_string : translation?.en_string;
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
        instagram_link: true
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
      instagram_link: agencyData?.instagram_link
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
        id: req.params.id,
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
      agency_packages
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
        agency_packages
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
      agency_packages: updatedAgency.agency_packages
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
    const { id } = req.params;

    // Validate UUID format
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    if (!isValidUUID) {
      return response.error(res, res.__('messages.invalidUUIDFormat'), null);
    }
    // Check if agency exists
    const existingAgency = await prisma.agencies.findUnique({
      where: { id },
    });

// console.log(existingAgency);

    if (!existingAgency) {
      return response.error(res, res.__('messages.agencyNotFound'), null);
    }

    // Delete agency
    const deletedAgency = await prisma.agencies.delete({
      where: { id },
    });

    if (deletedAgency) {
      return response.success(res, res.__('messages.agencyDeletedSuccessfully'), null);
    }

  } catch (err) {
    console.error('Error deleting agency:', err);
    return response.serverError(res, res.__('messages.internalServerError'), err.message);
  }
};