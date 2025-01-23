import { PrismaClient } from '@prisma/client';
import response from "../components/utils/response.js";
import { validate as isUuid } from 'uuid';
import jwt from 'jsonwebtoken';
// Initialize Prisma Client
const prisma = new PrismaClient();
// Create District
export const createDistrict = async (req, res) => {
  try {
    const { city_id, en_name, fr_name, latitude, longitude } = req.body;

    // Validate required fields
    if (!city_id || (!en_name && !fr_name)) {
      return response.error(
        res,
        res.__('messages.fieldError', { field: 'city_id, en_name, or fr_name' })
      );
    }

    // Validate `city_id` format and existence
    if (!isUuid(city_id)) {
      return response.error(res, res.__('messages.invalidCityIdFormat'));
    }

    const cityExists = await prisma.cities.findUnique({ where: { id: city_id } });
    if (!cityExists) {
      return response.error(res, res.__('messages.invalidCityId'));
    }

    // Authenticate user
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return response.error(res, res.__('messages.authTokenRequired'));
    }

    const token = authHeader.split(' ')[1];
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      return response.error(res, res.__('messages.invalidToken'));
    }

    const isValidLatitude = typeof latitude === 'number' && latitude >= -90 && latitude <= 90;
    const isValidLongitude = typeof longitude === 'number' && longitude >= -180 && longitude <= 180;

    if (!isValidLatitude || !isValidLongitude) {
      return await response.error(
        res,
        res.__('messages.invalidCoordinates'),
        { latitude, longitude }
      ); // Error if coordinates are invalid
    }

    // Check for existing translation
    const existingTranslation = await prisma.districts.findFirst({
      where: {
        city_id,
        OR: [
          { langTranslation: { en_string: en_name } },
          { langTranslation: { fr_string: fr_name } },
        ],
      },
    });

    if (existingTranslation) {
      return response.error(res, res.__('messages.translationAlreadyExists'));
    }

    // Create new language translation
    const langTranslation = await prisma.langTranslations.create({
      data: { en_string: en_name, fr_string: fr_name },
    });


    // Create new district
    const district = await prisma.districts.create({
      data: {
        city_id,
        lang_id: langTranslation.id,
        latitude,
        longitude,
        created_by: userId,
      },
    });

    // Prepare and send response
    const cityTranslation = await prisma.langTranslations.findUnique({
      where: { id: cityExists.lang_id },
    });

    const lang = res.getLocale();
    const responseData = {
      id: district.id,
      city_name: lang === 'fr' ? cityTranslation.fr_string : cityTranslation.en_string,
      district_name: lang === 'fr' ? langTranslation.fr_string : langTranslation.en_string,
      latitude: district.latitude,
      longitude: district.longitude,
      is_deleted: district.is_deleted,
      created_at: district.created_at,
      updated_at: district.updated_at,
      created_by: district.created_by,
      updated_by: district.updated_by,
    };

    return response.success(res, res.__('messages.districtCreatedSuccessfully'), responseData);
  } catch (error) {
    console.error('Error creating district:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};




// Get Districts by City
export const getDistrictsByCity = async (req, res) => {
  try {
    const { city_id, lang, district_name } = req.body; // Extract city_id, lang, and district_name from the request body

    // Validate city_id presence
    if (!city_id) {
      return response.error(
        res,
        res.__('messages.cityIdRequired') // Error if city_id is missing
      );
    }

    // Validate city_id format
    if (!isUuid(city_id)) {
      return response.error(
        res,
        res.__('messages.invalidCityIdFormat') // Error if city_id is not a valid UUID
      );
    }

    // Verify if city_id exists
    const cityExists = await prisma.cities.findUnique({
      where: { id: city_id },
    });

    if (!cityExists) {
      return response.error(
        res,
        res.__('messages.invalidCityId') // Error if city_id does not exist
      );
    }

    const isFrench = lang === 'fr'; // Determine if the language is French

    // Fetch districts by city_id with language-specific translations
    const districts = await prisma.districts.findMany({
      where: {
        city_id,
        langTranslation: district_name
          ? {
              OR: [
                { fr_string: { contains: district_name, mode: 'insensitive' } },
                { en_string: { contains: district_name, mode: 'insensitive' } },
              ],
            }
          : undefined,
      },
      select: {
        id: true,
        langTranslation: {
          select: {
            fr_string: isFrench,
            en_string: !isFrench,
          },
        },
        latitude: true,
        longitude: true,
        created_at: true,
        updated_at: true,
      },
    });


    // Transform the response to include only the relevant language string
    const transformedDistricts = districts.map((district) => ({
      id: district.id,
      name: district.langTranslation?.fr_string || district.langTranslation?.en_string, // Use the appropriate language string
      latitude: district.latitude,
      longitude: district.longitude,
      created_at: district.created_at,
      updated_at: district.updated_at,
    }));

    // Return success response with transformed data
    return response.success(
      res,
      res.__('messages.districtsFetchedSuccessfully'),
      transformedDistricts
    );
  } catch (error) {
    console.error('Error fetching districts:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
      stack: error.stack,
    }); // Return server error
  }
};




// Get District by ID
export const getDistrictById = async (req, res) => {
  try {
    const { id } = req.body; // Extract id and lang from the request body

    // Validate ID
    if (!id) {
      return response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
    }
  // Validate city_id format
    if (!isUuid(id)) {
      return response.error(
        res,
        res.__('messages.invalidDistrictIdFormat') // Error if city_id is not a valid UUID
      );
    }

    // Verify if city_id exists
    // const cityExists = await prisma.cities.findUnique({
    //   where: { id: id },
    // });

    // if (!cityExists) {
    //   return response.error(
    //     res,
    //     res.__('messages.invalidCityId') // Error if city_id does not exist
    //   );
    // }

    // Fetch district by ID with language-specific translations
    const district = await prisma.districts.findUnique({
      where: { id: id },
      select: {
        id: true,
        langTranslation: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        city_id: true,
        latitude: true,
        longitude: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!district) {
      return response.error(res, res.__('messages.districtNotFound')); // Error if not found
    }


    const transformedDistrict = {
      id: district.id,
      en_name: district.langTranslation?.en_string || 'Unknown',
      fr_name: district.langTranslation?.fr_string || 'Unknown',
      latitude: district.latitude,
      city_id: district.city_id,
      longitude: district.longitude,
      created_at: district.created_at,
      updated_at: district.updated_at,
    };

    return response.success(res, res.__('messages.districtFetchedSuccessfully'), transformedDistrict); // Success message
  } catch (error) {
    console.error('Error fetching district:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};


export const getDistricts = async (req, res) => {
  try {
    const { page = 1, limit = 10, lang } = req.body;
    const isFrench = lang === 'fr';

    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validLimit = Math.max(1, parseInt(limit, 10) || 10);

    const skip = (validPage - 1) * validLimit;

    const totalCount = await prisma.districts.count({
      where: {
        is_deleted: false,
      },
    });


    // Fetch districts with nested relationships
    const districts = await prisma.districts.findMany({
      skip,
      take: validLimit,
      where: { is_deleted: false },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        created_at: true,
        langTranslation: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        cities: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            lang: {
              select: {
                fr_string: true,
                en_string: true,
              },
            },
          },
        },
      },
    });

    // Check if districts are found
    if (!districts.length) {
      return response.error(res, res.__('messages.noDistrictsFound'));
    }

    // Transform data
    const transformedDistricts = districts.map((district) => ({
      id: district.id,
      district_name: isFrench
        ? district.langTranslation?.fr_string || 'Unknown'
        : district.langTranslation?.en_string || 'Unknown',
      latitude: district.latitude,
      longitude: district.longitude,
      created_at: district.created_at,
      city: {
        id: district.cities?.id,
        city_name: isFrench
          ? district.cities?.lang?.fr_string || 'Unknown'
          : district.cities?.lang?.en_string || 'Unknown',
        latitude: district.cities?.latitude,
        longitude: district.cities?.longitude,
      },
    }));

    // Send response
    return response.success(
      res,
      res.__('messages.districtsFetchedSuccessfully'),
      { 
        districts: transformedDistricts,
        totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
        currentPage: validPage,
        itemsPerPage: validLimit,
      }
    );
  } catch (error) {
    console.error('Error fetching districts:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
      stack: error.stack,
    });
  }
};


// Update District
// export const updateDistrict = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, en_name, fr_name, city_id, lang_id, slug, latitude, longitude } = req.body;

//     // Validate ID
//     if (!id) {
//       return await response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
//     }

//     // Update district
//     const district = await prisma.districts.update({
//       where: { id },
//       data: {
//         name,
//         en_name,
//         fr_name,
//         city_id,
//         lang_id,
//         slug,
//         latitude,
//         longitude,
//       },
//     });

//     return await response.success(res, res.__('messages.districtUpdatedSuccessfully'), district); // Success message
//   } catch (error) {
//     return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
//   }
// };


export const updateDistrict = async (req, res) => {
  try {
    const { district_id, city_id, en_name, fr_name, latitude, longitude } = req.body;

    if (!district_id) {
      return response.error(res, res.__('messages.districtIdRequired'));
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.error(res, res.__('messages.authTokenRequired'));
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return response.error(res, res.__('messages.invalidToken'));
    }





    const district = await prisma.districts.findUnique({
      where: { id: district_id, is_deleted: false },
    });

    if (!district) {
      return response.error(res, res.__('messages.districtNotFound'));
    }


    if (city_id) {
      const cityExists = await prisma.cities.findUnique({
        where: { id: city_id },
      });

      if (!cityExists) {
        return response.error(res, res.__('messages.cityNotFound'));
      }
    }

    let langTranslation;
    if (en_name || fr_name) {
      const existingTranslation = await prisma.districts.findFirst({
        where: {
          city_id,
          OR: [
            { langTranslation: { en_string: en_name } },
            { langTranslation: { fr_string: fr_name } },
          ],
        },
      });

      if (existingTranslation && existingTranslation.id !== district.id) {
        return response.error(res, res.__('messages.translationAlreadyExists'), {
          en_string: existingTranslation.en_string,
          fr_string: existingTranslation.fr_string,
        });
      }

      langTranslation = await prisma.langTranslations.create({
        data: {
          en_string: en_name,
          fr_string: fr_name,
        },
      });
    }



    const updatedDistrict = await prisma.districts.update({
      where: { id: district.id },
      data: {
        city_id: city_id || district.city_id, // Only update if city_id is provided
        lang_id: langTranslation ? langTranslation.id : district.lang_id,
        latitude: latitude !== undefined ? latitude : district.latitude,
        longitude: longitude !== undefined ? longitude : district.longitude,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    // Prepare response data
    const responseData = {
      id: updatedDistrict.id,
      district_name: langTranslation
        ? res.getLocale() === 'fr'
          ? langTranslation.fr_string
          : langTranslation.en_string
        : district.lang_id,
      is_deleted: updatedDistrict.is_deleted,
      created_at: updatedDistrict.created_at,
      updated_at: updatedDistrict.updated_at,
      created_by: updatedDistrict.created_by,
      updated_by: updatedDistrict.updated_by,
      latitude: updatedDistrict.latitude,
      longitude: updatedDistrict.longitude,
    };

    // Return success response
    return response.success(
      res,
      res.__('messages.districtUpdatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error('Error in updateCity:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};

// Delete District
// export const deleteDistrict = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!id) {
//       return await response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
//     }

//     // Soft delete district
//     const district = await prisma.districts.update({
//       where: { id },
//       data: { is_deleted: true },
//     });

//     return await response.success(res, res.__('messages.districtDeletedSuccessfully'), district); // Success message
//   } catch (error) {
//     return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
//   }
// };


export const deleteDistrict = async (req, res) => {
  try {
    const { district_id } = req.body;

    if (!district_id) {
      return response.error(res, res.__('messages.fieldError'));
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.error(res, res.__('messages.authTokenRequired'));
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (error) {
      return response.error(res, res.__('messages.invalidToken'));
    }

    const district = await prisma.districts.findUnique({
      where: { id: district_id, is_deleted: false },
    });

    if (!district) {
      return response.error(res, res.__('messages.districtNotFound'));
    }

    const associatedDistricts = await prisma.neighborhoods.count({
      where: { district_id: district_id, is_deleted: false },
    });

    if (associatedDistricts > 0) {
      return response.error(res, res.__('messages.districtNotDeleteDueToneighborhood'));
    }

    await prisma.districts.delete({
      where: { id: district_id },
    });

    return response.success(res, res.__('messages.districtDeletedSuccessfully'), { district_id });
  } catch (error) {
    console.error('Error in deleteCity:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};