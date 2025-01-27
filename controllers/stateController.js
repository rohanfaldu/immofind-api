import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from '../components/utils/commonFunction.js';
const prisma = new PrismaClient();

// Create State with LangTranslations
import jwt from 'jsonwebtoken';

export const createState = async (req, res) => {
  try {
    const { en_name, fr_name, latitude, longitude } = req.body;

    // Validate input fields
    if (!en_name || !fr_name || 
        typeof latitude !== 'number' || latitude < -90 || latitude > 90 || 
        typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return response.error(res, res.__('messages.fieldError'));
    }

    const userId = req.user.id;

    // Use a transaction to check for existing state and create a new lang translation
    const [existingState, langTranslation] = await prisma.$transaction([
      prisma.states.findFirst({
        where: {
          OR: [
            { lang: { en_string: en_name } },
            { lang: { fr_string: fr_name } },
          ],
        },
      }),
      prisma.langTranslations.create({
        data: {
          en_string: en_name,
          fr_string: fr_name,
        },
      }),
    ]);

    if (existingState) {
      return response.error(res, res.__('messages.stateAlreadyExists'), { existingState });
    }

    const state = await prisma.states.create({
      data: {
        lang_id: langTranslation.id,
        latitude,
        longitude,
        created_by: userId,
      },
    });

    const responseData = {
      id: state.id,
      state: res.getLocale() === 'fr' ? langTranslation.fr_string : langTranslation.en_string,
      ...state,
    };

    return response.success(res, res.__('messages.stateCreatedSuccessfully'), responseData);
  } catch (error) {
    console.error(error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};
export const updateState = async (req, res) => {
  try {
    const { state_id, en_name, fr_name, latitude, longitude } = req.body;

    if (!state_id || (!en_name && !fr_name && latitude === undefined && longitude === undefined)) {
      return response.error(res, res.__('messages.fieldError'));
    }

    if (
      (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) ||
      (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180))
    ) {
      return response.error(res, res.__('messages.invalidCoordinates'), { latitude, longitude });
    }

    const userId = req.user.id;

    const state = await prisma.states.findUnique({
      where: { id: state_id, is_deleted: false },
    });

    if (!state) {
      return response.error(res, res.__('messages.stateNotFound'));
    }

    const translationData = {};
    if (en_name) translationData.en_string = en_name;
    if (fr_name) translationData.fr_string = fr_name;

    const langTranslation = await prisma.langTranslations.upsert({
      where: { id: state.lang_id },
      update: translationData,
      create: { ...translationData },
    });

    const updatedState = await prisma.states.update({
      where: { id: state.id },
      data: {
        lang_id: langTranslation.id,
        latitude: latitude !== undefined ? latitude : state.latitude,
        longitude: longitude !== undefined ? longitude : state.longitude,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    const responseData = {
      id: updatedState.id,
      state: res.getLocale() === 'fr' ? langTranslation.fr_string : langTranslation.en_string,
      is_deleted: updatedState.is_deleted,
      created_at: updatedState.created_at,
      updated_at: updatedState.updated_at,
      created_by: updatedState.created_by,
      updated_by: updatedState.updated_by,
      latitude: updatedState.latitude,
      longitude: updatedState.longitude,
    };

    return response.success(res, res.__('messages.stateUpdatedSuccessfully'), responseData);
  } catch (error) {
    console.error('Error in updateState:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};
export const getStateByStateId = async (req, res) => {
  try {
    const { state_id } = req.body;
    if (!state_id) {
      return response.error(res, res.__('messages.stateIdRequired'));
    }

    const state = await prisma.states.findUnique({
      where: {
        id: state_id,
      },
      include: {
        lang:{
          select:{
            fr_string: true,
            en_string: true,
          }
        }
      }
    });

    console.log(state,"state")

    if (!state) {
      return response.error(res, res.__('messages.stateNotFound'));
    }

    const result = {
      state: {
        id: state.id,
        en_name: state.lang?.en_string,
        fr_name: state.lang?.fr_string,
        is_deleted: state.is_deleted,
        created_at: state.created_at,
        updated_at: state.updated_at,
        created_by: state.created_by,
        updated_by: state.updated_by,
        latitude: state.latitude,
        longitude: state.longitude,
      },
    };

    return response.success(res, res.__('messages.statesFetchedSuccessfully'), result);
  } catch (error) {
    console.error('Error fetching state:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
      stack: error.stack,
    });
  }
};
export const deleteState = async (req, res) => {
  try {
    const { state_id } = req.body;
    if (!state_id) {
      return response.error(res, res.__('messages.fieldError'));
    }

    const state = await prisma.states.findUnique({
      where: { id: state_id, is_deleted: false },
    });

    if (!state) {
      return response.error(res, res.__('messages.stateNotFound'));
    }

    const associatedCities = await prisma.cities.count({
      where: { state_id: state_id, is_deleted: false },
    });

    if (associatedCities > 0) {
      return response.error(res, res.__('messages.stateNotDeleteDueToCities'));
    }


    await prisma.states.delete({
      where: { id: state_id },
    });

    return response.success(
      res,
      res.__('messages.stateDeletedSuccessfully'),
      { state_id }
    );
  } catch (error) {
    console.error('Error in deleteState:', error);
    return response.error(res, res.__('messages.internalServerError'), { message: error.message });
  }
};
export const getAllStates = async (req, res) => {
  try {
    const { page, limit } = req.body;

    const lang = res.getLocale();
    const where = {
      is_deleted: false,
    };
    const include = {
      lang: true,
    };
    const orderBy = {};

    const paginationResult = await commonFunction.pagination(page, limit, where, orderBy, include, 'states');
    console.log('Pagination Result:', paginationResult);

    const { totalCount, validPage: currentPage, validLimit: itemsPerPage, finding: states } = paginationResult;

    if (states.length === 0) {
      return response.error(res, res.__('messages.noStatesFound'));
    }

    const result = states.map((state) => {
      const name = lang === 'fr' && state.lang 
        ? state.lang.fr_string 
        : state.lang?.en_string || 'Unknown';

      return {
        id: state.id,
        name,
        is_deleted: state.is_deleted,
        created_at: state.created_at,
        updated_at: state.updated_at,
        created_by: state.created_by,
        updated_by: state.updated_by,
        latitude: state.latitude,
        longitude: state.longitude,
      };
    });

    // console.log(">");
    return response.success(res, res.__('messages.statesFetchedSuccessfully'), { 
      states: result,
      totalCount,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      currentPage,
      itemsPerPage,
    });

  } catch (error) {
    console.error('Error fetching states:', error);
    return response.error(res, res.__('messages.internalServerError'), {
      message: error.message,
      stack: error.stack,
    });
  }
};