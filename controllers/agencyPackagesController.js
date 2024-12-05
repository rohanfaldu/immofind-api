import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();

/**
 * Fetch all agency packages
 */
export const getAgencyPackage = async (req, res) => {
  try {
    const agencyPackages = await prisma.agencyPackages.findMany({
      where: { is_deleted: false },
      include: {
        developers: true, // Include related developers if needed
      },
    });
    return response.success(res, res.__('messages.listFetchedSuccessfully'), agencyPackages);
  } catch (error) {
    console.error('Error fetching agency packages:', error);
        return await response.serverError(res, res.__('messages.internalServerError'));
  }
};

/**
 * Create a new agency package
 */
export const createAgencyPackage = async (req, res) => {
  try {
    const { en_string, fr_string, created_by, is_deleted, type } = req.body;

    // Insert translations into LangTranslations
    const langTranslation = await prisma.langTranslations.create({
      data: {
        en_string, // English string
        fr_string, // French string
        created_by: created_by,
      },
    });



    // Creating a new agency package with the current time for 'created_at'
    const newPackage = await prisma.agencyPackages.create({
      data: {
        name: langTranslation.id, // Store the LangTranslation ID as a reference
        type: type, // Use the `Package` directly from the request (should be "BASIC", "PREMIUM", etc.)
        created_by,
        is_deleted,
        created_at: new Date(), // Manually set created_at to the current time
      },
    });

    return response.success(res, res.__('messages.agencyPackageCreatedSuccessfully'), newPackage);
    } catch (error) {
        console.error('Error creating agency package:', error);
        return response.error(
        res,
        res.__('messages.errorCreatingagencyPackage'),
        500,
        error.message
        );
    }
};

const isValidUUID = (id) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

/**
 * Update an agency package
 */
export const updateAgencyPackage = async (req, res) => {
    try {
        const rawId = req.params.id.trim();
        const id = rawId.startsWith(':') ? rawId.slice(1) : rawId;

        // Validate UUID format
        if (!isValidUUID(id)) {
            return response.error(res, res.__('messages.invalidUUIDFormat'));
        }
        console.log('Received ID:', id);

        const { en_string, fr_string, created_by, is_deleted, type } = req.body;

        // Find the existing agency package by ID
        const existingPackage = await prisma.agencyPackages.findUnique({
            where: { id },
        });

        if (!existingPackage) {
            return response.error(res, res.__('messages.agencyPackageNotFound'), 404);
        }

        console.log('Existing package name:', existingPackage.name);

        // Validate the `name` field as UUID if required
        if (!isValidUUID(existingPackage.name)) {
            return response.error(res, res.__('messages.invalidNameFormatInPackage'));
        }

        // Find the existing translation
        const existingTranslation = await prisma.langTranslations.findUnique({
            where: { id: existingPackage.name },
        });

        if (!existingTranslation) {
            return response.error(res, res.__('messages.translationNotFound'), 404);
        }

        // Update the translation record
        const updatedTranslation = await prisma.langTranslations.update({
            where: { id: existingTranslation.id },
            data: {
                en_string,
                fr_string,
                updated_by: created_by,
            },
        });

        // Update the agency package
        const updatedPackage = await prisma.agencyPackages.update({
            where: { id: id },
            data: {
                type,
                updated_by: created_by,
                is_deleted,
                updated_at: new Date(),
            },
        });

        return response.success(
            res,
            res.__('messages.agencyPackageUpdatedSuccessfully'),
            updatedPackage
        );
    } catch (error) {
        console.error('Error updating agency package:', error);
        return response.error(res, res.__('messages.internalServerError'), 500);
    }
};






/**
 * Soft delete an agency package
 */
export const deleteAgencyPackage = async (req, res) => {
    try {
        const rawId = req.params.id.trim();
        const id = rawId.startsWith(':') ? rawId.slice(1) : rawId;

        // Find the agency package
        const existingPackage = await prisma.agencyPackages.findUnique({
            where: { id: id },
        });

        if (!existingPackage) {
            return response.error(res, res.__('messages.agencyPackageNotFound'), 404);
        }

        // Delete the agency package
        await prisma.agencyPackages.delete({
            where: { id: id },
        });

        return response.success(
            res,
            res.__('messages.agencyPackageDeletedSuccessfully')
        );
    } catch (error) {
        console.error("Error deleting agency package:", error);
        return response.error(res, res.__('messages.internalServerError'), 500);
    }
};
