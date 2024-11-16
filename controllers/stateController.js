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
    const states = await prisma.states.findMany({
      include: {
        cities: true, // Include associated cities
        lang: true,   // Include LangTranslations associated with each state
      },
    });

    return await response.success(res, res.__('messages.statesFetchedSuccessfully'), states); // Success message for fetching states
  } catch (error) {
    console.error(error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};
