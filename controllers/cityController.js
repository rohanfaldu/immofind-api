const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require("../components/utils/response");

// Create City with LangTranslations
exports.createCity = async (req, res) => {
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
exports.getCities = async (req, res) => {
  try {
    const { state_id, lang } = req.body;  // Extract the state_id and lang from the request body

    // Build the where clause for filtering by state_id and lang
    const where = {};

    if (state_id) {
      where.state_id = state_id;  // Filter by state_id if provided
    }



    // Fetch cities based on the filters
    const cities = await prisma.cities.findMany({
      where,  // Apply the filtering conditions
      include: {
        states: true,  // Include associated state
        lang: true,    // Include LangTranslations associated with each city
        districts: true, // Include associated districts
        property_details: true // Include associated property details
      },
    });

    // Return success response with cities data
    return await response.success(res, res.__('messages.citiesFetchedSuccessfully'), cities);
  } catch (error) {
    console.error(error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Handle server error
  }
};


// Get Cities by State Name
exports.getCitiesByState = async (req, res) => {
  try {
    const { stateName, lang } = req.body; // Get state name and lang from request body

    if (!stateName) {
      return await response.error(res, res.__('messages.stateNameRequired')); // Error when state name is missing
    }

    // Fetch cities by state name
    const cities = await prisma.cities.findMany({
      where: {
        states: {
          name: {
            contains: stateName, // Perform partial match search (case insensitive)
            mode: 'insensitive', // Makes the search case-insensitive
          },
        },
      },
      include: {
        states: true, // Include associated state
        lang: true,   // Include LangTranslations associated with each city
        districts: true, // Include associated districts
        property_details: true, // Include associated property details
      },
    });

    if (!cities.length) {
      return await response.error(res, res.__('messages.noCitiesFoundForState')); // No cities found for the state
    }

    return await response.success(res, res.__('messages.citiesFetchedSuccessfully'), cities); // Success message
  } catch (error) {
    console.error(error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};
