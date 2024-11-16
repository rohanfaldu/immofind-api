const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const response = require("../components/utils/response");

// Get all property type listings
exports.getAllPropertyTypeListings = async (req, res) => {
  try {
    const listings = await prisma.propertyTypeListings.findMany();
    response.success(res, res.__('messages.listFetchedSuccessfully'), listings);
  } catch (error) {
    response.serverError(res, error);
  }
};

// Get a single property type listing by ID
exports.getPropertyTypeListingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response.error(res, res.__('messages.stateIdRequired'), 400);
    }

    const listing = await prisma.propertyTypeListings.findUnique({
      where: { id },
    });

    if (!listing) {
      return response.notFound(res, res.__('messages.listingNotFound'));
    }

    response.success(res, res.__('messages.listingFetchedSuccessfully'), listing);
  } catch (error) {
    response.serverError(res, error);
  }
};

// Create a new property type listing
exports.createPropertyTypeListing = async (req, res) => {
  try {
    const { name, property_option, property_cat, icon, created_by } = req.body;

    if (!name || !property_option) {
      return response.error(res, res.__('messages.requiredFieldsMissing'), 400);
    }

    const newListing = await prisma.propertyTypeListings.create({
      data: { name, property_option, property_cat, icon, created_by },
    });

    response.success(res, res.__('messages.listingCreatedSuccessfully'), newListing);
  } catch (error) {
    response.serverError(res, error);
  }
};

// Update an existing property type listing
exports.updatePropertyTypeListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, property_option, property_cat, icon, updated_by } = req.body;

    if (!id) {
      return response.error(res, res.__('messages.stateIdRequired'), 400);
    }

    const updatedListing = await prisma.propertyTypeListings.update({
      where: { id },
      data: { name, property_option, property_cat, icon, updated_by },
    });

    response.success(res, res.__('messages.listingUpdatedSuccessfully'), updatedListing);
  } catch (error) {
    response.serverError(res, error);
  }
};

// Delete a property type listing
exports.deletePropertyTypeListing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return response.error(res, res.__('messages.stateIdRequired'), 400);
    }

    await prisma.propertyTypeListings.update({
      where: { id },
      data: { is_deleted: true },
    });

    response.success(res, res.__('messages.listingDeletedSuccessfully'));
  } catch (error) {
    response.serverError(res, error);
  }
};
