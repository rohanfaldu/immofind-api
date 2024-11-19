const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require("../components/utils/response");

// Create State with LangTranslations
exports.createState = async (req, res) => {
  try {
    const { name, en_name, fr_name, slug } = req.body;

    if (!name || !en_name || !fr_name || !slug) {
      return await response.error(res, res.__('messages.fieldError')); // Error when required fields are missing
    }

    // Create LangTranslation entry for the state
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string: en_name,
        fr_string: fr_name,
      },
    });

    // Create the state with the langTranslation reference
    const state = await prisma.states.create({
      data: {
        name: name,
        en_name: en_name,
        fr_name: fr_name,
        slug: slug,
        lang_id: langTranslation.id,  // Link to LangTranslations ID
      },
    });

    return await response.success(res, res.__('messages.stateCreatedSuccessfully'), state); // Success message
  } catch (error) {
    console.error(error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};

// Get All States with Cities and LangTranslations
exports.getStates = async (req, res) => {
  try {
    const { lang } = req.query; // Language parameter (e.g., `?lang=fr` or `?lang=en`)
    const isFrench = lang === 'fr'; // Determine if the language is French

    const states = await prisma.states.findMany({
      select: {
        id: true, // Include the state ID
        name: true, // State name
        lang: {
          select: {
            // Select either `fr_string` or `en_string` for the state based on the language
            fr_string: isFrench,
            en_string: !isFrench,
          },
        },
        cities: {
          select: {
            id: true, // Include city ID
            name: true, // City name
            lang: {
              select: {
                // Select either `fr_string` or `en_string` for the city based on the language
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
          },
        },
      },
    });

    // Transform results to include the selected language string for states and cities
    const transformedStates = states.map((state) => ({
      ...state,
      lang_string: isFrench ? state.lang.fr_string : state.lang.en_string, // State language string
      cities: state.cities.map((city) => ({
        ...city,
        lang_string: isFrench ? city.lang.fr_string : city.lang.en_string, // City language string
      })),
      lang: undefined, // Remove the `lang` object if not needed
    }));

    return await response.success(
      res,
      res.__('messages.statesFetchedSuccessfully'),
      transformedStates
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
