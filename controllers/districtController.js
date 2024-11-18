const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require("../components/utils/response");

// Create District
exports.createDistrict = async (req, res) => {
  try {
    const {
      name,
      en_name,
      fr_name,
      city_id,
      slug,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!name || !city_id || !en_name || !fr_name) {
      return await response.error(res, res.__('messages.fieldError')); // Error for missing fields
    }

    // Step 1: Insert into LangTranslations
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string: en_name, // Adjusted to match request body field name
        fr_string: fr_name, // Adjusted to match request body field name
      },
    });

    // Step 2: Use the generated lang_id to insert into Districts
    const district = await prisma.districts.create({
      data: {
        name,
        en_name, // Store the English name in the district
        fr_name, // Store the French name in the district
        city_id,
        lang_id: langTranslation.id, // Use the generated lang_id
        slug,
        latitude,
        longitude,
      },
    });

    return await response.success(
      res,
      res.__('messages.districtCreatedSuccessfully'),
      district
    ); // Success message
  } catch (error) {
    return await response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    ); // Server error
  }
};


// Get Districts by City
exports.getDistrictsByCity = async (req, res) => {
  try {
    const { city_id } = req.body; // Extract city_id from the request body

    // Validate city_id
    if (!city_id) {
      return await response.error(res, res.__('messages.cityIdRequired')); // Error if city_id is missing
    }

    // Fetch districts by city
    const districts = await prisma.districts.findMany({
      where: { city_id },
      include: {
        langTranslation: true, // Include related LangTranslations
      },
    });

    if (!districts || districts.length === 0) {
      return await response.error(res, res.__('messages.noDistrictsFoundForCity')); // No districts found
    }

    return await response.success(res, res.__('messages.districtsFetchedSuccessfully'), districts); // Success message
  } catch (error) {
    console.error('Error fetching districts:', error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};


// Get District by ID
exports.getDistrictById = async (req, res) => {
  try {
    const { id } = req.body; // Extract id from the request body

    // Validate ID
    if (!id) {
      return await response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
    }

    // Fetch district by ID
    const district = await prisma.districts.findUnique({
      where: { id },
      include: {
        langTranslation: true, // Include related LangTranslations
      },
    });

    if (!district) {
      return await response.error(res, res.__('messages.districtNotFound')); // Error if not found
    }

    return await response.success(res, res.__('messages.districtFetchedSuccessfully'), district); // Success message
  } catch (error) {
    console.error('Error fetching district:', error);
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};

// Update District
exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, en_name, fr_name, city_id, lang_id, slug, latitude, longitude } = req.body;

    // Validate ID
    if (!id) {
      return await response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
    }

    // Update district
    const district = await prisma.districts.update({
      where: { id },
      data: {
        name,
        en_name,
        fr_name,
        city_id,
        lang_id,
        slug,
        latitude,
        longitude,
      },
    });

    return await response.success(res, res.__('messages.districtUpdatedSuccessfully'), district); // Success message
  } catch (error) {
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};

// Delete District
exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return await response.error(res, res.__('messages.districtIdRequired')); // Error if id is missing
    }

    // Soft delete district
    const district = await prisma.districts.update({
      where: { id },
      data: { is_deleted: true },
    });

    return await response.success(res, res.__('messages.districtDeletedSuccessfully'), district); // Success message
  } catch (error) {
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};
