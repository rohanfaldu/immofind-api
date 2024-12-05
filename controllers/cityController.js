import { PrismaClient } from '@prisma/client';
import response from "../components/utils/response.js";
// Initialize Prisma Client
const prisma = new PrismaClient();

// Create City with LangTranslations
export const createCity = async (req, res) => {
  try {
    const { name, en_name, fr_name, slug, state_id } = req.body;

    if (!name || !en_name || !fr_name || !slug || !state_id) {
      return await response.error(res, res.__('messages.fieldError')); // Error when required fields are missing
    }

    // Create LangTranslation entry for the city
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string: en_name,
        fr_string: fr_name,
      },
    });

    // Create the city with the langTranslation reference
    const city = await prisma.cities.create({
      data: {
        name: name,
        en_name: en_name,
        fr_name: fr_name,
        slug: slug,
        state_id: state_id,        // Link to the state
        lang_id: langTranslation.id,  // Link to LangTranslations ID
      },
    });

    return await response.success(res, res.__('messages.cityCreatedSuccessfully'), city); // Success message
  } catch (error) {
    console.error(error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};

// Get All Cities with States and LangTranslations
export const getCities = async (req, res) => {
  try {
    const { state_id, lang } = req.body; // Extract state_id and lang from the request body

    if (!state_id) {
        return response.error(res, res.__('messages.stateIdRequired'), null);
    }

    const isFrench = lang === 'fr'; // Determine if the language is French

    // Fetch cities, states, and districts with the selected language
    const cities = await prisma.cities.findMany({
      where: { state_id }, // Filter by state_id
      select: {
        id: true, // City ID
        name: true, // Default City Name
        lang: {
          select: {
            fr_string: isFrench, // Include only fr_string if lang = 'fr'
            en_string: !isFrench, // Include only en_string otherwise
          },
        },
        districts: {
          select: {
            id: true, // District ID
            name: true, // Default District Name
            langTranslation: {
              select: {
                fr_string: isFrench, // Include only fr_string if lang = 'fr'
                en_string: !isFrench, // Include only en_string otherwise
              },
            },
          },
        },
        states: {
          select: {
            id: true, // State ID
            name: true, // Default State Name
            lang: {
              select: {
                fr_string: isFrench, // Include only fr_string if lang = 'fr'
                en_string: !isFrench, // Include only en_string otherwise
              },
            },
          },
        },
      },
    });

    // Transform data to simplify language selection
    const transformedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      lang_string: city.lang?.fr_string || city.lang?.en_string,
      districts: city.districts.map((district) => ({
        id: district.id,
        name: district.name,
        lang_string: district.langTranslation?.fr_string || district.langTranslation?.en_string,
      })),
      states: {
        id: city.states.id,
        name: city.states.name,
        lang_string: city.states.lang?.fr_string || city.states.lang?.en_string,
      },
    }));

    // Return the transformed data
    return response.success(
      res,
      res.__('messages.citiesFetchedSuccessfully'),
      transformedCities
    );
  } catch (error) {
    console.error('Error fetching cities:', error);
    return response.error(res, res.__('messages.internalServerError'), {
        message: error.message,
        stack: error.stack,
    });

  }
};



// Get Cities by State Name
export const getCitiesByState = async (req, res) => {
  try {
    const { stateName, lang } = req.body; // Extract stateName and lang from the request body

    if (!stateName) {
      return response.error(res, res.__('messages.stateNameRequired')); // Return error if stateName is missing
    }

    const isFrench = lang === 'fr'; // Determine if the requested language is French

    // Fetch cities and related data by state name
    const cities = await prisma.cities.findMany({
      where: {
        states: {
          name: {
            contains: stateName, // Perform partial match on state name
            mode: 'insensitive', // Case-insensitive search
          },
        },
      },
      select: {
        id: true,
        name: true,
        lang: {
          select: {
            fr_string: isFrench,
            en_string: !isFrench,
          },
        },
        districts: {
          select: {
            id: true,
            name: true,
            langTranslation: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
          },
        },
        states: {
          select: {
            id: true,
            name: true,
            lang: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
          },
        },
      },
    });

    if (!cities.length) {
      return response.error(res, res.__('messages.noCitiesFoundForState')); // Return error if no cities are found
    }

    // Transform data to include dynamic language strings
    const transformedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      lang_string: city.lang?.fr_string || city.lang?.en_string,
      state: {
        id: city.states.id,
        name: city.states.name,
        lang_string: city.states.lang?.fr_string || city.states.lang?.en_string,
      },
      districts: city.districts.map((district) => ({
        id: district.id,
        name: district.name,
        lang_string:
          district.langTranslation?.fr_string || district.langTranslation?.en_string,
      })),
    }));

    return response.success(
      res,
      res.__('messages.citiesFetchedSuccessfully'),
      transformedCities
    ); // Return success response
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
    }); // Handle server error
  }
};
