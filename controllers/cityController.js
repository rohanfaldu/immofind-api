import { PrismaClient } from '@prisma/client';
import response from "../components/utils/response.js";
import { validate as isUuid } from 'uuid';
import jwt from 'jsonwebtoken';
// Initialize Prisma Client
const prisma = new PrismaClient();

// Create City with LangTranslations
export const createCity = async (req, res) => {
  try {
    const { en_name, fr_name, state_id, latitude, longitude } = req.body;
    if (!en_name || !fr_name || !state_id) {
      return await response.error(res, res.__('messages.fieldError'));
    }

    const isValidLatitude = typeof latitude === 'number' && latitude >= -90 && latitude <= 90;
    const isValidLongitude = typeof longitude === 'number' && longitude >= -180 && longitude <= 180;

    if (!isValidLatitude || !isValidLongitude) {
      return await response.error(
        res,
        res.__('messages.invalidCoordinates'),
        { latitude, longitude }
      );
    }


    const stateExists = await prisma.states.findUnique({
      where: { id: state_id },
    });

    if (!stateExists) {
      return await response.error(
        res,
        res.__('messages.invalidStateId')
      );
    }

    let langTranslation;
    if (en_name || fr_name) {
      const existingTranslation = await prisma.cities.findFirst({
        where: {
          OR: [
            { lang: { en_string: en_name } },
            { lang: { fr_string: fr_name } },
          ],
        },
      });

      if (existingTranslation) {
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

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return await response.error(res, res.__('messages.authTokenRequired'));
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id; 
    } catch (error) {
      return await response.error(res, res.__('messages.invalidToken'));
    }

    const city = await prisma.cities.create({
      data: {
        state_id,
        lang_id: langTranslation.id,
        latitude: latitude,
        longitude: longitude,
        created_by: userId,
      },
    });

    const stateTranslation = await prisma.langTranslations.findUnique({
      where: { id: stateExists.lang_id },
    });

    const lang = res.getLocale();
    const responseData = {
      id: city.id,
      is_deleted: city.is_deleted,
      created_at: city.created_at,
      updated_at: city.updated_at,
      created_by: city.created_by,
      updated_by: city.updated_by,
      latitude: city.latitude,
      longitude: city.longitude,
      state: lang === 'fr' ? stateTranslation.fr_string : stateTranslation.en_string,
      city: lang === 'fr' ? langTranslation.fr_string : langTranslation.en_string,
    };

    return await response.success(
      res,
      res.__('messages.cityCreatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error(error);
    return await response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    );
  }
};



  export const getCitiesByStateId = async (req, res) => {
    try {
      const { state_id, lang } = req.body;
      if (!state_id) {
        return response.error(res, res.__('messages.stateIdRequired'));
      }
      if (!isUuid(state_id)) {
        return response.error(
          res,
          res.__('messages.invalidStateIdFormat')
        );
      }

      const isFrench = lang === 'fr';

      // Fetch state by state_id
      const state = await prisma.states.findUnique({
        where: {
          id: state_id, // Use state_id to directly fetch state
        },
        select: {
          id: true,
          lang: {
            select: {
              fr_string: isFrench,
              en_string: !isFrench,
            },
          },
          latitude: true,
          longitude: true,
        },
      });

      if (!state) {
        return response.error(res, res.__('messages.stateNotFound')); // Error if state is not found
      }

      // Fetch cities for the state
      const cities = await prisma.cities.findMany({
        where: {
          state_id: state.id, // Match cities by state_id
          is_deleted: false,
        },
        select: {
          id: true,
          lang: {
            select: {
              fr_string: isFrench,
              en_string: !isFrench,
            },
          },
          districts: {
            select: {
              id: true,
              langTranslation: {
                select: {
                  fr_string: isFrench,
                  en_string: !isFrench,
                },
              },
            },
          },
          latitude: true,
          longitude: true,
        },
      });

      if (!cities.length) {
        return response.error(res, res.__('messages.noCitiesFoundForState')); // Error if no cities are found
      }

      // Transform the results to include only the necessary language strings
      const transformedCities = cities.map((city) => ({
        id: city.id,
        name: isFrench ? city.lang.fr_string : city.lang.en_string, // City name in the requested language
        latitude: city.latitude, // Include latitude
        longitude: city.longitude, // Include longitude
        districts: city.districts.map((district) => ({
          id: district.id,
          name: district.langTranslation
            ? (isFrench
                ? district.langTranslation.fr_string
                : district.langTranslation.en_string)
            : null, // Handle missing translations
        })),
      }));

      // Include state details in the response
      const result = {
        state: {
          id: state.id,
          name: isFrench && state.lang ? state.lang.fr_string : state.lang?.en_string, // State name in the requested language
          latitude: state.latitude, // Include latitude
          longitude: state.longitude, // Include longitude
        },
        cities: transformedCities,
      };

      return response.success(res, res.__('messages.citiesFetchedSuccessfully'), result); // Success response
    } catch (error) {
      console.error('Error fetching cities:', error);
      return response.error(res, res.__('messages.internalServerError'), {
        message: error.message,
        stack: error.stack,
      }); // Server error
    }
  };


// Get Cities by State Name
// export const getCitiesByState = async (req, res) => {
//   try {
//     const { stateName, lang } = req.body; // Extract stateName and lang from the request body

//     if (!stateName) {
//       return response.error(res, res.__('messages.stateNameRequired')); // Error if stateName is missing
//     }

//     const isFrench = lang === 'fr'; // Determine the requested language

//     // Fetch state by name (match on lang table)
//     const state = await prisma.states.findFirst({
//       where: {
//         is_deleted: false, // Ensure the state is not soft-deleted
//         lang: {
//           OR: [
//             { fr_string: isFrench ? stateName : null }, // Match French name if lang is 'fr'
//             { en_string: !isFrench ? stateName : null }, // Match English name otherwise
//           ],
//         },
//       },
//     });

//     if (!state) {
//       return response.error(res, res.__('messages.stateNotFound')); // Error if no state matches the name
//     }

//     // Check if the state has a valid language translation
//     if (!state.lang_id) {
//       return response.error(res, res.__('messages.stateLanguageNotFound')); // Error if state doesn't have language translations
//     }

//     // Fetch cities for the state
//    const cities = await prisma.cities.findMany({
//     where: { state_id },
//     select: {
//         id: true,
//         latitude: true, // Include latitude
//         longitude: true, // Include longitude
//         lang: {
//         select: {
//             fr_string: isFrench,
//             en_string: !isFrench,
//         },
//         },
//         districts: {
//         select: {
//             id: true,
//             latitude: true, // Include district latitude
//             longitude: true, // Include district longitude
//             langTranslation: {
//             select: {
//                 fr_string: isFrench,
//                 en_string: !isFrench,
//             },
//             },
//         },
//         },
//     },
//     });

//     if (!cities.length) {
//       return response.error(res, res.__('messages.noCitiesFoundForState')); // Error if no cities are found
//     }

//     // Transform the results to include only the necessary language strings
//     const transformedCities = cities.map((city) => ({
//       id: city.id,
//       name: isFrench ? city.lang.fr_string : city.lang.en_string, // City name in the requested language
//       districts: city.districts.map((district) => ({
//         id: district.id,
//         // Safely check if langTranslation exists before accessing strings
//         name: district.langTranslation
//           ? (isFrench
//               ? district.langTranslation.fr_string // District name in the requested language
//               : district.langTranslation.en_string)
//           : null, // Return null if langTranslation is missing
//       })),
//     }));

//     // Include state details in the response
//     const result = {
//         state: {
//             id: state.id,
//             name: isFrench && state.lang ? state.lang.fr_string : state.lang?.en_string, // State name in requested language
//             latitude: state.latitude, // Include latitude
//             longitude: state.longitude, // Include longitude
//         },
//         cities: transformedCities, // Include transformed cities
//     };

//     return response.success(res, res.__('messages.citiesFetchedSuccessfully'), result); // Success response
//   } catch (error) {
//     console.error(error);
//     return response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
//   }
// };

// export const getCities = async (req, res) => {
//   try {
//     const { lang } = req.body; // Extract state_id and lang from the request body
//     const isFrench = lang === 'fr'; // Determine if the language is French

//     // Fetch cities related to the provided state_id
//     const cities = await prisma.cities.findMany({
//     where: { is_deleted: false },
//     select: {
//         id: true,
//         latitude: true,
//         longitude: true,
//         lang: {
//         select: {
//             fr_string: isFrench,
//             en_string: !isFrench,
//         },
//         },
//     },
//     });

//     if (!cities.length) {
//     return response.error(res, res.__('messages.noCitiesFoundForState'), null);
//     }

//     const transformedCities = cities.map((city) => ({
//     id: city.id,
//     name: city.lang?.fr_string || city.lang?.en_string,
//     latitude: city.latitude,
//     longitude: city.longitude,
//     }));

//     return response.success(
//       res,
//       res.__('messages.citiesFetchedSuccessfully'),
//       transformedCities
//     );
//   } catch (error) {
//     console.error('Error fetching cities:', error);
//     return response.error(res, res.__('messages.internalServerError'), {
//       message: error.message,
//       stack: error.stack,
//     }); // Server error
//   }
// };


export const getCities = async (req, res) => {
  try {
    const { page = 1, limit = 10, lang, city_name } = req.body;

    const isFrench = lang === 'fr'; 

    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validLimit = Math.max(1, parseInt(limit, 10) || 10);

    const skip = (validPage - 1) * validLimit;

    const totalCount = await prisma.cities.count({
      where: {
        is_deleted: false,
        lang: city_name
          ? {
              OR: [
                { fr_string: { contains: city_name, mode: 'insensitive' } },
                { en_string: { contains: city_name, mode: 'insensitive' } },
              ],
            }
          : undefined,
      },
    });

    const cities = await prisma.cities.findMany({
      skip,
      take: validLimit,
      where: {
        is_deleted: false, // Only fetch non-deleted cities
        lang: city_name
          ? {
              OR: [
                { fr_string: { contains: city_name, mode: 'insensitive' } },
                { en_string: { contains: city_name, mode: 'insensitive' } },
              ],
            }
          : undefined,
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
        states: {
          select: {
            id: true,
            lang: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
            latitude: true,
            longitude: true,
          },
        },
        districts: {
          select: {
            id: true,
            langTranslation: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
          },
        },
      },
    });


    // Transform the results to include only the necessary language strings
    const transformedCities = cities.map((city) => ({
      id: city.id,
      city_name: isFrench ? city.lang.fr_string : city.lang.en_string, // City name in the requested language
      latitude: city.latitude, // Include latitude
      longitude: city.longitude, // Include longitude
      created_at: city.created_at,  
      state: {
        id: city.states.id,
        state_name: isFrench && city.states.lang ? city.states.lang.fr_string : city.states.lang?.en_string, // State name in the requested language
        latitude: city.states.latitude,
        longitude: city.states.longitude,
      },
      districts: city.districts.map((district) => ({
        id: district.id,
        district_name: isFrench && district.langTranslation ? district.langTranslation.fr_string : district.langTranslation
          ? (isFrench
              ? district.langTranslation.fr_string
              : district.langTranslation.en_string)
          : null,
      })),
    }));

    return response.success(
      res,
      res.__('messages.citiesFetchedSuccessfully'),
      { 
        cities: transformedCities,
        totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
        currentPage: validPage,
        itemsPerPage: validLimit,
      }
    );
  } catch (error) {
    console.error('Error fetching cities:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
      stack: error.stack,
    }); // Server error
  }
};



export const getCityById = async (req, res) => {
  try {
    const { city_id } = req.body;

    if (!city_id) {
      return response.error(res, res.__('messages.cityIdRequired'));
    }

    if (!isUuid(city_id)) {
      return response.error(res, res.__('messages.invalidCityIdFormat'));
    }


    const city = await prisma.cities.findUnique({
      where: { id: city_id },
      select: {
        id: true,
        lang: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        latitude: true,
        state_id: true,
        longitude: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!city) {
      return response.error(res, res.__('messages.cityNotFound'));
    }

    const transformedCity = {
      id: city.id,
      en_name: city.lang?.en_string || 'Unknown',
      fr_name: city.lang?.fr_string || 'Inconnu',
      latitude: city.latitude,
      state_id: city.state_id,
      longitude: city.longitude,
      created_at: city.created_at,
      updated_at: city.updated_at,
    };

    return response.success(res, res.__('messages.cityFetchedSuccessfully'), transformedCity);
  } catch (error) {
    console.error('Error fetching city:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { city_id, state_id, en_name, fr_name, latitude, longitude } = req.body;

    // Check if city_id is provided
    if (!city_id) {
      return response.error(res, res.__('messages.cityIdRequired'));
    }

    // Validate the Authorization token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.error(res, res.__('messages.authTokenRequired'));
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id; // Extract user ID from the token
    } catch (error) {
      return response.error(res, res.__('messages.invalidToken'));
    }

    // Find the existing city
    const city = await prisma.cities.findUnique({
      where: { id: city_id, is_deleted: false },
    });

    if (!city) {
      return response.error(res, res.__('messages.cityNotFound'));
    }

    // Check if state_id is provided and exists in the states table
    if (state_id) {
      const stateExists = await prisma.states.findUnique({
        where: { id: state_id },
      });

      if (!stateExists) {
        return response.error(res, res.__('messages.stateNotFound'));
      }
    }

    // Handle language translation
    let langTranslation;
    if (en_name || fr_name) {
      // Check if the translation already exists
      const existingTranslation = await prisma.cities.findFirst({
        where: {
          OR: [
            { lang: { en_string: en_name } },
            { lang: { fr_string: fr_name } },
          ],
        },
      });

      if (existingTranslation && existingTranslation.id !== city.id) {
        return response.error(res, res.__('messages.translationAlreadyExists'), {
          en_string: existingTranslation.en_string,
          fr_string: existingTranslation.fr_string,
        });
      }

      // Create a new translation if it doesn't exist
      langTranslation = await prisma.langTranslations.create({
        data: {
          en_string: en_name,
          fr_string: fr_name,
        },
      });
    }

    // Update the city with new data
    const updatedCity = await prisma.cities.update({
      where: { id: city.id },
      data: {
        state_id: state_id || city.state_id, // Only update if state_id is provided
        lang_id: langTranslation ? langTranslation.id : city.lang_id,
        latitude: latitude !== undefined ? latitude : city.latitude,
        longitude: longitude !== undefined ? longitude : city.longitude,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    // Prepare response data
    const responseData = {
      id: updatedCity.id,
      state: langTranslation ? (res.getLocale() === 'fr' ? langTranslation.fr_string : langTranslation.en_string) : city.lang_id,
      is_deleted: updatedCity.is_deleted,
      created_at: updatedCity.created_at,
      updated_at: updatedCity.updated_at,
      created_by: updatedCity.created_by,
      updated_by: updatedCity.updated_by,
      latitude: updatedCity.latitude,
      longitude: updatedCity.longitude,
    };

    // Return success response
    return response.success(
      res,
      res.__('messages.cityUpdatedSuccessfully'),
      responseData
    );
  } catch (error) {
    console.error('Error in updateCity:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};


export const deleteCity = async (req, res) => {
  try {
    const { city_id } = req.body;

    if (!city_id) {
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

    const city = await prisma.cities.findUnique({
      where: { id: city_id, is_deleted: false },
    });

    if (!city) {
      return response.error(res, res.__('messages.cityNotFound'));
    }

    const associatedDistricts = await prisma.districts.count({
      where: { city_id: city_id, is_deleted: false },
    });

    if (associatedDistricts > 0) {
      return response.error(res, res.__('messages.cityNotDeleteDueToDistricts'));
    }

    await prisma.cities.delete({
      where: { id: city_id },
    });

    return response.success(res, res.__('messages.cityDeletedSuccessfully'), { city_id });
  } catch (error) {
    console.error('Error in deleteCity:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};
