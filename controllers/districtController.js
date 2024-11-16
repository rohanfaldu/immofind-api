const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require("../components/utils/response");

// Create District
exports.createDistrict = async (req, res) => {
  try {
    const { name, city_id } = req.body;

    if (!name || !city_id) {
      return await response.error(res, res.__('messages.fieldError')); // Error for missing fields
    }

    const district = await prisma.districts.create({
      data: {
        name,
        city_id,
      },
    });

    return await response.success(res, res.__('messages.districtCreatedSuccessfully'), district); // Success message
  } catch (error) {
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};

// Get Districts by City
exports.getDistrictsByCity = async (req, res) => {
  try {
    const { city_id } = req.query;

    if (!city_id) {
      return await response.error(res, res.__('messages.cityIdRequired')); // Error if city_id is missing
    }

    const districts = await prisma.districts.findMany({
      where: { city_id },
    });

    return await response.success(res, res.__('messages.districtsFetchedSuccessfully'), districts); // Success message
  } catch (error) {
    return await response.error(res, res.__('messages.internalServerError'), { message: error.message }); // Server error
  }
};
