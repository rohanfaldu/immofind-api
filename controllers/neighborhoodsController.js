import { PrismaClient } from '@prisma/client';
import response from "../components/utils/response.js";
import { validate as isUuid } from 'uuid';
import jwt from 'jsonwebtoken';


// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Neighborhood
export const createNeighborhood = async (req, res) => {
  try {
    const { district_id, en_name, fr_name, latitude, longitude, lang } = req.body;

    // Validate required fields
    if (!district_id || (!en_name && !fr_name)) {
      return response.error(
        res,
        res.__('messages.fieldError', { field: 'district_id, en_name, or fr_name' })
      );
    }

    // Validate `district_id` format
    if (!isUuid(district_id)) {
      return response.error(
        res,
        res.__('messages.invalidDistrictIdFormat') // Error if district_id is not a valid UUID
      );
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

    
    // Verify `district_id` exists in Districts table
    const districtExists = await prisma.districts.findUnique({
      where: { id: district_id },
      include: { langTranslation: true }, // Include langTranslation
    });

    if (!districtExists) {
      return response.error(
        res,
        res.__('messages.invalidDistrictId') // Error if district_id does not exist
      );
    }

    // Check if `en_name` or `fr_name` already exists
    let langTranslation;
    if (en_name || fr_name) {
      const existingTranslation = await prisma.neighborhoods.findFirst({
        where: {
          OR: [
            { langTranslation: { en_string: en_name } },
            { langTranslation: { fr_string: fr_name } },
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

    // Create the neighborhood
    const neighborhood = await prisma.neighborhoods.create({
      data: {
        district_id,
        lang_id: langTranslation.id,
        latitude,
        longitude,
        created_by: userId,
        updated_by: userId,
      },
    });

    // Fetch the created neighborhood with translations
    const stateTranslation = await prisma.langTranslations.findUnique({
      where: { id: districtExists.langTranslation.id }, // Access the correct id
    });


    return response.success(
      res,
      res.__('messages.neighborhoodCreatedSuccessfully'),
      {
        id: neighborhood.id,
        district_id: neighborhood.district_id,
        neighborhood_name: lang === 'fr' ? stateTranslation.fr_string : stateTranslation.en_string,
        latitude: neighborhood.latitude,
        longitude: neighborhood.longitude,
        is_deleted: neighborhood.is_deleted,
        created_at: neighborhood.created_at,
        updated_at: neighborhood.updated_at,
        created_by: neighborhood.created_by,
        updated_by: neighborhood.updated_by,
      }
    );
  } catch (error) {
    console.error('Error creating neighborhood:', error);
    return response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    );
  }
};


export const getAllNeighborhoods = async (req, res) => {
  try {
    const { page = 1, limit = 10, lang } = req.query;

    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validLimit = Math.max(1, parseInt(limit, 10) || 10);

    const skip = (validPage - 1) * validLimit;

    const totalCount = await prisma.neighborhoods.count({
      where: {
        is_deleted: false,
      },
    });

    const neighborhoods = await prisma.neighborhoods.findMany({
      skip,
      take: validLimit,
      include: {
        langTranslation: true,
        district: {
          include: {
            langTranslation: true,
          },
        },
      },
    });

    if (!neighborhoods.length) {
      return response.error(res, res.__('messages.noNeighborhoodsFound'));
    }

    const neighborhoodList = neighborhoods.map(neighborhood => {
      // Check if langTranslation exists for the neighborhood
      const neighborhoodTranslation = neighborhood.langTranslation || {};
      const districtTranslation = neighborhood.district.langTranslation || {};

      // Get district name based on the requested language, with fallback
      const districtName = lang === 'fr' 
        ? districtTranslation.fr_string || 'District name not available' 
        : districtTranslation.en_string || 'District name not available';

      return {
        id: neighborhood.id,
        district_name: districtName,
        neighborhood_name: lang === 'fr'
          ? neighborhoodTranslation.fr_string || 'Neighborhood name not available'
          : neighborhoodTranslation.en_string || 'Neighborhood name not available',
        latitude: neighborhood.latitude,
        longitude: neighborhood.longitude,
        is_deleted: neighborhood.is_deleted,
        created_at: neighborhood.created_at,
        updated_at: neighborhood.updated_at,
        created_by: neighborhood.created_by,
        updated_by: neighborhood.updated_by,
      };
    });

    return response.success(
      res,
      res.__('messages.neighborhoodsRetrievedSuccessfully'),
      {
        neighborhoods: neighborhoodList,
        totalCount,
        totalPages: Math.ceil(totalCount / validLimit),
        currentPage: validPage,
        itemsPerPage: validLimit,
      }
    );

  } catch (error) {
    console.error('Error retrieving neighborhoods:', error);
    return response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    );
  }
};


// Get Neighborhoods by District
export const getNeighborhoodsByDistrict = async (req, res) => {
  try {
    const { district_id, lang } = req.body;

    // Validate district_id
    if (!district_id) {
      return response.error(
        res,
        res.__('messages.districtIdRequired')
      );
    }

    if (!isUuid(district_id)) {
      return response.error(
        res,
        res.__('messages.invalidDistrictIdFormat')
      );
    }

    // Verify if district_id exists
    const districtExists = await prisma.districts.findUnique({
      where: { id: district_id },
    });

    if (!districtExists) {
      return response.error(
        res,
        res.__('messages.invalidDistrictId')
      );
    }

    const isFrench = lang === 'fr';

    // Fetch neighborhoods by district_id
    const neighborhoods = await prisma.neighborhoods.findMany({
      where: { district_id },
      select: {
        id: true,
        langTranslation: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        latitude: true,
        longitude: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!neighborhoods.length) {
      return response.error(res, res.__('messages.noNeighborhoodsFoundForDistrict'));
    }

    const transformedNeighborhoods = neighborhoods.map((neighborhood) => ({
      id: neighborhood.id,
      name: lang === 'fr'
        ? neighborhood.langTranslation?.fr_string
        : neighborhood.langTranslation?.en_string,
      latitude: neighborhood.latitude,
      longitude: neighborhood.longitude,
      created_at: neighborhood.created_at,
      updated_at: neighborhood.updated_at,
    }));

    return response.success(
      res,
      res.__('messages.neighborhoodsFetchedSuccessfully'),
      transformedNeighborhoods
    );
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    );
  }
};

// Get Neighborhood by ID
export const getNeighborhoodById = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return response.error(res, res.__('messages.neighborhoodIdRequired'));
    }

    if (!isUuid(id)) {
      return response.error(
        res,
        res.__('messages.invalidNeighborhoodIdFormat')
      );
    }


    // Fetch neighborhood by ID
    const neighborhood = await prisma.neighborhoods.findUnique({
      where: { id },
      select: {
        id: true,
        langTranslation: {
          select: {
            fr_string: true,
            en_string: true,
          },
        },
        district_id: true,
        latitude: true,
        longitude: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!neighborhood) {
      return response.error(res, res.__('messages.neighborhoodNotFound'));
    }

    const transformedNeighborhood = {
      id: neighborhood.id,
      en_name: neighborhood.langTranslation?.en_string,
      fr_name: neighborhood.langTranslation?.fr_string,
      latitude: neighborhood.latitude,
      district_id: neighborhood.district_id,
      longitude: neighborhood.longitude,
      created_at: neighborhood.created_at,
      updated_at: neighborhood.updated_at,
    };

    return response.success(res, res.__('messages.neighborhoodFetchedSuccessfully'), transformedNeighborhood);
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};

// Update Neighborhood
export const updateNeighborhood = async (req, res) => {
  try {
    const { id } = req.params;
    const { en_name, fr_name, latitude, longitude, district_id, lang } = req.body;

    if (!id) {
      return response.error(res, res.__('messages.neighborhoodIdRequired'));
    }

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

    // Fetch the existing neighborhood with lang_id
    const neighborhood = await prisma.neighborhoods.findUnique({
      where: { id },
      select: {
        lang_id: true, // Fetch lang_id for language updates
      },
    });

    if (!neighborhood) {
      return response.error(res, res.__('messages.neighborhoodNotFound'));
    }

    // Update language translations
    let langTranslation;
    if (en_name || fr_name) {
      // Check if the translation already exists
      const existingTranslation = await prisma.neighborhoods.findFirst({
        where: {
          OR: [
            { langTranslation: { en_string: en_name } },
            { langTranslation: { fr_string: fr_name } },
          ],
        },
      });

      if (existingTranslation) {
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

    // Update neighborhood details
    const updatedNeighborhood = await prisma.neighborhoods.update({
      where: { id },
      data: {
        latitude,
        longitude,
        district_id,
        lang_id: langTranslation ? langTranslation.id : neighborhood.lang_id, // Update lang_id if translation exists
        updated_by: userId, // Track who updated
        updated_at: new Date(),
      },
      include: {
        langTranslation: true, // Include language translations in response
      },
    });

    // Determine which name to show based on language
    const name =
      lang === 'fr'
        ? updatedNeighborhood.langTranslation.fr_string
        : updatedNeighborhood.langTranslation.en_string;

    // Prepare response object
    const responseData = {
      id: updatedNeighborhood.id,
      district_id: updatedNeighborhood.district_id,
      name, // Include name instead of lang_id
      latitude: updatedNeighborhood.latitude,
      longitude: updatedNeighborhood.longitude,
      is_deleted: updatedNeighborhood.is_deleted,
      created_at: updatedNeighborhood.created_at,
      updated_at: updatedNeighborhood.updated_at,
      updated_by: updatedNeighborhood.updated_by, // Include updated_by in response
    };

    return response.success(res, res.__('messages.neighborhoodUpdatedSuccessfully'), responseData);
  } catch (error) {
    console.error('Error updating neighborhood:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};

// Delete Neighborhood
export const deleteNeighborhood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return response.error(res, res.__('messages.neighborhoodIdRequired'));
    }

    // Attempt to delete the neighborhood
    const deletedNeighborhood = await prisma.neighborhoods.delete({
      where: { id },
    });

    return response.success(
      res,
      res.__('messages.neighborhoodDeletedSuccessfully'),
      deletedNeighborhood
    );
  } catch (error) {
    if (error.code === 'P2003') {
      // Handle foreign key constraint error
      console.error(
        `Neighborhood deletion failed due to foreign key constraint: ${error.meta.field_name}`
      );
      return response.error(
        res,
        res.__('messages.neighborhoodInUse'),
        { message: 'The neighborhood is in use by another table (e.g., Property Details).' }
      );
    }

    // General error handling
    console.error('Error deleting neighborhood:', error);
    return response.error(
      res,
      res.__('messages.internalServerError'),
      { message: error.message }
    );
  }
};


