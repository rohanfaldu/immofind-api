import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();

const serializeBigInt = (data) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};


// Get all project listings
export const getAllProjects = async (req, res) => {
  try {
    // Step 1: Fetch all projects from the database
    const projects = await prisma.projectDetails.findMany({
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
          },
        },
        lang_translations_title: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations_description: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        states: {
          select: { name: true },
        },
        cities: {
          select: { name: true },
        },
        districts: {
          select: { name: true },
        },
        project_meta_details: {
          select: {
            value: true,
            project_type_listing: {
              select: {
                id: true,
                name: true,
                type: true,
                key: true,
                lang_translations: {
                  select: {
                    en_string: true,
                    fr_string: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Step 2: Format the projects data for the response
    const lang = res.getLocale();
    const simplifiedProjects = projects.map((createdProject) => ({
      id: createdProject.id,
      user_name: createdProject.users?.full_name || null,
      user_image: createdProject.users?.image || null,
      title: lang === 'fr' ? createdProject.lang_translations_title.fr_string : createdProject.lang_translations_title.en_string,
      description: lang === 'fr' ? createdProject.lang_translations_description.fr_string : createdProject.lang_translations_description.en_string,
      price: createdProject.price,
      state: createdProject.states?.name || null,
      city: createdProject.cities?.name || null,
      district: createdProject.districts?.name || null,
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      video: createdProject.video,
      meta_details: createdProject.project_meta_details.map((meta) => {
        const langObj = lang === 'en'
          ? meta.project_type_listing?.lang_translations?.en_string
          : meta.project_type_listing?.lang_translations?.fr_string;

        return {
          id: meta.project_type_listing?.id || null,
          type: meta.project_type_listing?.type || null,
          key: meta.project_type_listing?.key || null,
          name: langObj,
          value: meta.value,
        };
      }),
    }));

    // Step 3: Return the response
    return res.status(200).json({
      success: true,
      message: res.__('messages.projectsFetchedSuccessfully'),
      data: simplifiedProjects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: res.__('messages.errorFetchingProjects'),
      error: error.message,
    });
  }
};


// Create a new project
export const createProject = async (req, res) => {
  try {
    // Extracting data from the request body
    const {
      title_en,
      title_fr,
      description_en,
      description_fr,
      price,
      state_id,
      city_id,
      district_id,
      latitude,
      longitude,
      vr_link,
      picture,
      video,
      user_id,
      link_uuid,
      meta_details,
    } = req.body;

    // Validate required fields
    if (
      !title_en ||
      !title_fr ||
      !description_en ||
      !description_fr ||
      !price ||
      !state_id ||
      !city_id ||
      !district_id ||
      !latitude ||
      !longitude ||
      !user_id ||
      !link_uuid
    ) {
      return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
    }

    // Step 1: Create translations for title and description
    const titleTranslation = await prisma.langTranslations.create({
      data: {
        en_string: title_en,
        fr_string: title_fr,
        created_by: user_id, // Assuming user_id is the ID of the user creating the project
      },
    });

    const descriptionTranslation = await prisma.langTranslations.create({
      data: {
        en_string: description_en,
        fr_string: description_fr,
        created_by: user_id,
      },
    });

    // Step 2: Create the project
    const newProject = await prisma.projectDetails.create({
      data: {
        title: titleTranslation.id, // Link to the title translation
        description: descriptionTranslation.id, // Link to the description translation
        price: price,
        state_id: state_id,
        city_id: city_id,
        district_id: district_id,
        latitude: latitude,
        longitude: longitude,
        vr_link: vr_link || null,
        picture: picture || null,
        video: video || null,
        user_id: user_id, // The user creating the project
        link_uuid: link_uuid,
        project_meta_details: {
          create: meta_details.map((meta) => ({
            value: meta.value,
            project_type_listing_id: meta.project_type_listing_id, // Link to the project type listing
          })),
        },
      },
    });

    // Step 3: Fetch the created project with necessary relationships for the response
    const createdProject = await prisma.projectDetails.findUnique({
      where: { id: newProject.id },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
          },
        },
        lang_translations_title: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations_description: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        states: {
          select: { name: true },
        },
        cities: {
          select: { name: true },
        },
        districts: {
          select: { name: true },
        },
        project_meta_details: {
          select: {
            value: true,
            project_type_listing: {
              select: {
                id: true,
                name: true,
                type: true,
                key: true,
                lang_translations: {
                  select: {
                    en_string: true,
                    fr_string: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Step 4: Format the project data for the response
    const lang = res.getLocale();
    const simplifiedProject = {
      id: createdProject.id,
      user_name: createdProject.users?.full_name || null,
      user_image: createdProject.users?.image || null,
      title: lang === 'fr' ? createdProject.lang_translations_title.fr_string : createdProject.lang_translations_title.en_string,
      description: lang === 'fr' ? createdProject.lang_translations_description.fr_string : createdProject.lang_translations_description.en_string,
      price: createdProject.price,
      state: createdProject.states?.name || null,
      city: createdProject.cities?.name || null,
      district: createdProject.districts?.name || null,
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      video: createdProject.video,
      meta_details: createdProject.project_meta_details.map((meta) => {
        const langObj = lang === 'en'
          ? meta.project_type_listing?.lang_translations?.en_string
          : meta.project_type_listing?.lang_translations?.fr_string;

        return {
          id: meta.project_type_listing?.id || null,
          type: meta.project_type_listing?.type || null,
          key: meta.project_type_listing?.key || null,
          name: langObj,
          value: meta.value,
        };
      }),
    };

    // Step 5: Return the response
    return res.status(201).json({
      success: true,
      message: res.__('messages.projectCreatedSuccessfully'),
      data: simplifiedProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({
      success: false,
      message: res.__('messages.errorCreatingProject'),
      error: error.message,
    });
  }
};


// Update an existing project
export const updateProject = async (req, res) => {
  try {
    // Extracting data from the request body
    const {
      project_id,
      title_en,
      title_fr,
      description_en,
      description_fr,
      price,
      state_id,
      city_id,
      district_id,
      latitude,
      longitude,
      vr_link,
      picture,
      video,
      user_id,
      link_uuid,
      meta_details,
    } = req.body;

    // Validate required fields
    if (
      !project_id ||
      !title_en ||
      !title_fr ||
      !description_en ||
      !description_fr ||
      !price ||
      !state_id ||
      !city_id ||
      !district_id ||
      !latitude ||
      !longitude ||
      !user_id ||
      !link_uuid
    ) {
      return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
    }

    // Step 1: Find the existing project
    const existingProject = await prisma.projectDetails.findUnique({
      where: { id: project_id },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: res.__('messages.projectNotFound'),
      });
    }

    // Step 2: Update translations for title and description
    const titleTranslation = await prisma.langTranslations.upsert({
      where: { id: existingProject.title },
      update: {
        en_string: title_en,
        fr_string: title_fr,
        updated_by: user_id, // Assuming user_id is the ID of the user updating the project
      },
      create: {
        en_string: title_en,
        fr_string: title_fr,
        created_by: user_id,
      },
    });

    const descriptionTranslation = await prisma.langTranslations.upsert({
      where: { id: existingProject.description },
      update: {
        en_string: description_en,
        fr_string: description_fr,
        updated_by: user_id,
      },
      create: {
        en_string: description_en,
        fr_string: description_fr,
        created_by: user_id,
      },
    });

    // Step 3: Update the project
    const updatedProject = await prisma.projectDetails.update({
      where: { id: project_id },
      data: {
        title: titleTranslation.id, // Link to the updated title translation
        description: descriptionTranslation.id, // Link to the updated description translation
        price: price,
        state_id: state_id,
        city_id: city_id,
        district_id: district_id,
        latitude: latitude,
        longitude: longitude,
        vr_link: vr_link || null,
        picture: picture || null,
        video: video || null,
        user_id: user_id, // The user updating the project
        link_uuid: link_uuid,
        project_meta_details: {
          deleteMany: {}, // Delete old meta details
          create: meta_details.map((meta) => ({
            value: meta.value,
            project_type_listing_id: meta.project_type_listing_id, // Link to the project type listing
          })),
        },
      },
    });

    // Step 4: Fetch the updated project with necessary relationships for the response
    const createdProject = await prisma.projectDetails.findUnique({
      where: { id: updatedProject.id },
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
          },
        },
        lang_translations_title: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations_description: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        states: {
          select: { name: true },
        },
        cities: {
          select: { name: true },
        },
        districts: {
          select: { name: true },
        },
        project_meta_details: {
          select: {
            value: true,
            project_type_listing: {
              select: {
                id: true,
                name: true,
                type: true,
                key: true,
                lang_translations: {
                  select: {
                    en_string: true,
                    fr_string: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Step 5: Format the updated project data for the response
    const lang = res.getLocale();
    const simplifiedProject = {
      id: createdProject.id,
      user_name: createdProject.users?.full_name || null,
      user_image: createdProject.users?.image || null,
      title: lang === 'fr' ? createdProject.lang_translations_title.fr_string : createdProject.lang_translations_title.en_string,
      description: lang === 'fr' ? createdProject.lang_translations_description.fr_string : createdProject.lang_translations_description.en_string,
      price: createdProject.price,
      state: createdProject.states?.name || null,
      city: createdProject.cities?.name || null,
      district: createdProject.districts?.name || null,
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      video: createdProject.video,
      meta_details: createdProject.project_meta_details.map((meta) => {
        const langObj = lang === 'en'
          ? meta.project_type_listing?.lang_translations?.en_string
          : meta.project_type_listing?.lang_translations?.fr_string;

        return {
          id: meta.project_type_listing?.id || null,
          type: meta.project_type_listing?.type || null,
          key: meta.project_type_listing?.key || null,
          name: langObj,
          value: meta.value,
        };
      }),
    };

    // Step 6: Return the response
    return res.status(200).json({
      success: true,
      message: res.__('messages.projectUpdatedSuccessfully'),
      data: simplifiedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({
      success: false,
      message: res.__('messages.errorUpdatingProject'),
      error: error.message,
    });
  }
};


// Delete a project (soft delete)
export const deleteProject = async (req, res) => {
  try {
    // Extracting the project_id from the request body
    const { project_id } = req.body;

    // Validate required field
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: res.__('messages.projectIdRequired'),
      });
    }

    // Step 1: Check if the project exists
    const existingProject = await prisma.projectDetails.findUnique({
      where: { id: project_id },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: res.__('messages.projectNotFound'),
      });
    }

    // Step 2: Delete related project_meta_details
    await prisma.projectMetaDetails.deleteMany({
      where: { project_detail_id: project_id },
    });

    // Step 3: Delete the project
    await prisma.projectDetails.delete({
      where: { id: project_id },
    });

    // Step 4: Return success response
    return res.status(200).json({
      success: true,
      message: res.__('messages.projectDeletedSuccessfully'),
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({
      success: false,
      message: res.__('messages.errorDeletingProject'),
      error: error.message,
    });
  }
};