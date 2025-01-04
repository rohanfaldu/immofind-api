import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import commonFunction from "../components/utils/commonFunction.js";
import slugify from 'slugify';
const prisma = new PrismaClient();

const serializeBigInt = (data) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

const generateUniqueSlug = async (baseSlug, attempt = 0) => {
  const slug = attempt > 0 ? `${baseSlug}_${attempt}` : baseSlug;
  const existingSlug = await prisma.projectDetails.findUnique({
    where: { slug: slug || undefined }, // Handle null or undefined slugs
  });
  
  return existingSlug ? generateUniqueSlug(baseSlug, attempt + 1) : slug;
};


// Get all project listings
export const getAllProjects = async (req, res) => {
  try {
    const lang = res.getLocale();
    // Validate and parse pagination inputs
    const { page = 1, limit = 5, title, description, minPrice, maxPrice, amenities_id } = req.body;
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, parseInt(limit, 10));
    const skip = (validPage - 1) * validLimit;

    const titleCondition = title ? lang === 'fr'? 
        {
          lang_translations_title: {
            fr_string: {
              contains: title,
              mode: 'insensitive',
            },
          },
        }
      : {
          lang_translations_title: {
            en_string: {
              contains: title,
              mode: 'insensitive',
            },
          },
        }: undefined;


        const descriptionCondition = description
        ? lang === 'fr'
          ? {
              lang_translations_description: {
                fr_string: {
                  contains: description,
                  mode: 'insensitive',
                },
              },
            }
          : {
              lang_translations_description: {
                en_string: {
                  contains: description,
                  mode: 'insensitive',
                },
              },
            }
        : undefined;

        const priceCondition = {
          price: {
            gte: minPrice ? parseFloat(minPrice) : undefined,
            lte: maxPrice ? parseFloat(maxPrice) : undefined,
          },
        };

        const amenitiesCondition = Array.isArray(amenities_id) && amenities_id.length > 0
      ? {
        project_meta_details: {
          some: {
            project_type_listing_id: {
              in: amenities_id, // Use "in" to match any ID in the array
            },
          },
        },
        }
      : undefined;
      console.log(amenitiesCondition);

      const cityCondition = {
        city_id: req.body.city_id,
      };

      const districtCondition = {
        district_id: req.body.district_id,
      };

      const stateCondition = {
        state_id: req.body.state_id,
      };
      
    // Get the total count of projects
    const combinedCondition = {
      AND: [titleCondition, descriptionCondition, priceCondition, amenitiesCondition, cityCondition, districtCondition, stateCondition].filter(Boolean),
    };
    
    const totalCount = await prisma.projectDetails.count({
      where: combinedCondition,
    });

    // Fetch all projects with pagination
    const projects = await prisma.projectDetails.findMany({
      skip,
      take: validLimit,
      orderBy: {
        created_at: 'desc',
      },
      where: combinedCondition,
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
          select: {
            lang: { select: { fr_string: true, en_string: true } },
          },
        },
        cities: {
          select: {
            lang: { select: { fr_string: true, en_string: true } },
          },
        },
        districts: {
          select: {
            langTranslation: { select: { fr_string: true, en_string: true } },
          },
        },
        currency: {
          select: {
            id: true,
            symbol: true,
            name: true,
          },
        },
        neighborhoods: {
          select: {
            langTranslation: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
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



    const isFrench = lang === 'fr'; 
    const cities = await prisma.cities.findMany({
      where: {
        is_deleted: false,
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        created_at: true,
        lang: {
          select: {
            fr_string: isFrench,
            en_string: !isFrench,
          },
        },
        states: {
          select: {
            id: true,
            lang: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
            latitude: true,
            longitude: true,
          },
        },
        districts: {
          select: {
            id: true,
            langTranslation: {
              select: {
                fr_string: isFrench,
                en_string: !isFrench,
              },
            },
          },
        },
      },
    });

    if (!cities.length) {
      return response.error(res, res.__('messages.noCitiesFound')); // Error if no cities are found
    }

    console.log(cities);
    // Transform the results to include only the necessary language strings
    const transformedCities = cities.map((city) => ({
      id: city.id,
      city_name: isFrench ? city.lang.fr_string : city.lang.en_string, // City name in the requested language
      latitude: city.latitude, // Include latitude
      longitude: city.longitude, // Include longitude
      created_at: city.created_at, 
      state: city.states.id
      // state: {
      //   id: city.states.id,
      //   state_name: isFrench && city.states.lang ? city.states.lang.fr_string : city.states.lang?.en_string, // State name in the requested language
      //   latitude: city.states.latitude,
      //   longitude: city.states.longitude,
      // },
      // districts: city.districts.map((district) => ({
      //   id: district.id,
      //   district_name: isFrench && district.langTranslation ? district.langTranslation.fr_string : district.langTranslation
      //     ? (isFrench
      //         ? district.langTranslation.fr_string
      //         : district.langTranslation.en_string)
      //     : null,
      // })),
    }));




    console.log(projects);
    // Format the response
    const simplifiedProjects = projects.map((project) => ({
      id: project.id,
      user_name: project.users?.full_name || null,
      user_image: project.users?.image || null,
      title: lang === 'fr' ? project.lang_translations_title?.fr_string : project.lang_translations_title?.en_string,
      description: lang === 'fr' ? project.lang_translations_description?.fr_string : project.lang_translations_description?.en_string,
      state: lang === 'fr' ? project.states?.lang?.fr_string : project.states?.lang?.en_string,
      city: lang === 'fr' ? project.cities?.lang?.fr_string : project.cities?.lang?.en_string,
      district: lang === 'fr' ? project.districts?.langTranslation?.fr_string : project.districts?.langTranslation?.en_string,
      neighborhood: lang === 'fr' ? project.neighborhoods?.langTranslation?.fr_string : project.neighborhoods?.langTranslation?.en_string,
      latitude: project.latitude,
      currency: project.currency?.name || null,
      longitude: project.longitude,
      address: project.address,
      vr_link: project.vr_link,
      picture: project.picture,
      icon: project.icon,
      video: project.video,
      price: project.price,
      slug: project.slug,
      created_at: project.created_at,
      updated_at: project.updated_at,
      created_by: project.created_by,
      updated_by: project.updated_by,
      status: project.status,
      meta_details: project.project_meta_details.map((meta) => ({
        id: meta.project_type_listing?.id || null,
        type: meta.project_type_listing?.type || null,
        key: meta.project_type_listing?.key || null,
        name:
          lang === 'fr'
            ? meta.project_type_listing?.lang_translations?.fr_string
            : meta.project_type_listing?.lang_translations?.en_string,
        value: meta.value,
      })),
    }));

    const maxPriceSliderRange = Math.max(
      ...simplifiedProjects.map((property) => property.price || 0)
    );

    const listings = await prisma.projectTypeListings.findMany({
      include: {
        lang_translations: true, // Include the related LangTranslations based on `name`
      },
    });

    // Map the results and apply language selection
    const simplifiedListings = listings.map((listing) => ({
      id: listing.id,
      name:
        listing.lang_translations
          ? lang === 'fr'
            ? listing.lang_translations.fr_string
            : listing.lang_translations.en_string
          : 'No name available',
      type: listing.type,
      key: listing.key,
      category: listing.category?.toString() || null,
    }));



    // Return the response
    return await response.success(res, res.__('messages.projectsFetchedSuccessfully'),
    { 
      projects: simplifiedProjects,
      project_meta_details: simplifiedListings,
      cities: transformedCities,
      maxPriceSliderRange,
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return await response.serverError(res, res.__('messages.errorFetchingProjects'));
  }
};


export const getProjectsById = async (req, res) => {
  try {
    // Step 1: Validate `project_id`
    const { project_slug } = req.body;

    if (!project_slug) {
      return response.error(res, res.__('messages.projectIdRequired'));
    }

    // Step 2: Fetch project details
    const project = await prisma.projectDetails.findUnique({
      where: { slug: project_slug },
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
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        districts: {
          select: { 
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
        },
        currency: {  // Include the currency relation
          select: {
            id: true,
            name: true,
            symbol: true,  // Adjust this field name based on your Currency model definition
          },
        },
        neighborhoods: {
          select: {
            langTranslation: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
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
                icon: true,
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

    // Step 3: Handle case where project is not found
    if (!project) {
      return response.error(res, res.__('messages.projectNotFound'));
    }

    const lang = res.getLocale();

      const properties = await prisma.propertyDetails.findMany({
      where: { project_id: project.id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address:true,
          },
        },
        lang_translations_property_details_descriptionTolang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        districts: {
        select: {
            langTranslation: {
            select: {
                en_string: true,
                fr_string: true,
            },
            },
        },
        },
        property_meta_details: {
          select: {
            value: true,
            property_type_listings: {
              select: {
                id: true,
                name: true,
                type: true,
                icon: true,
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
        currency: {
          select: {
              name: true,
              symbol: true,
              status: true
          }
        },
        neighborhoods: {
          select: {
              langTranslation: {
              select: {
                  en_string: true,
                  fr_string: true,
              },
              },
          },
          },
        property_types: {
          select: {
            id: true,
            title: true,
            lang_translations: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
      },
    });

    // Simplify and process the property details
    const simplifiedProperties = properties.map((property) => {
      console.log(property);
      const description =
        lang === 'fr'
          ? property.lang_translations_property_details_descriptionTolang_translations.fr_string
          : property.lang_translations_property_details_descriptionTolang_translations.en_string;
      const title =
        lang === 'fr'
          ? property.lang_translations.fr_string
          : property.lang_translations.en_string;
      const type =
        lang === 'fr'
          ? property.property_types?.lang_translations?.fr_string
          : property.property_types?.lang_translations?.en_string;
      const neighborhood =
        lang === 'fr'
          ? property.neighborhoods?.langTranslation?.fr_string
          : property.neighborhoods?.langTranslation?.en_string;

      const metaDetails = property.property_meta_details.map((meta) => {
        const langObj =
          lang === 'fr'
            ? meta.property_type_listings?.lang_translations?.fr_string
            : meta.property_type_listings?.lang_translations?.en_string;

        return {
          id: meta.property_type_listings?.id || null,
          type: meta.property_type_listings?.type || null,
          key: meta.property_type_listings?.key || null,
          icon: meta.property_type_listings?.icon || null,
          name: langObj,
          value: meta.value,
        };
      });

      const bathRooms =
        metaDetails.find((meta) => meta.key === 'bathrooms')?.value || "0";
      const bedRooms =
        metaDetails.find((meta) => meta.key === 'rooms')?.value || "0";
      const propertyType = res.__('messages.propertyType') + " " + property.transaction;

      return {
        id: property.id,
        user_name: property.users?.full_name || null,
        user_image: property.users?.image || null,
        email_address:property.users?.email_address || null,
        description,
        title,
        transaction: propertyType,
        transaction_type: property.transaction,
        picture: property.picture,
        video: property.video,
        latitude: property.latitude,
        longitude: property.longitude,
        address: property.address,
        size: property.size,
        price: property.price,
        created_at: property.created_at,
        bathRooms,
        bedRooms,
        district: 
        property.districts?.langTranslation &&
        (lang === "fr"
          ? property.districts.langTranslation.fr_string
          : property.districts.langTranslation.en_string),
        images: property.images_data,
        currency: property.currency?.name || null,
        neighborhood,
        type_details: [{
          id: property.property_types?.id || null,
          title: type,
        }],
      };
    });


    // Step 4: Format the project data for the response
    const simplifiedProject = {
      id: project.id,
      user_name: project.users?.full_name || null,
      user_image: project.users?.image || null,
      title_en: project.lang_translations_title?.en_string,
      title_fr: project.lang_translations_title?.fr_string,
      description_fr: project.lang_translations_description?.fr_string,
      description_en: project.lang_translations_description?.en_string,
      state: lang === 'fr' ? project.states?.lang?.fr_string : project.states?.lang?.en_string,
      city: lang === 'fr' ? project.cities?.lang?.fr_string : project.cities?.lang?.en_string,
      district: lang === 'fr' ? project.districts?.langTranslation?.fr_string : project.districts?.langTranslation?.en_string,
      neighborhood: lang === 'fr' ? project.neighborhoods?.langTranslation?.fr_string : project.neighborhoods?.langTranslation?.en_string,
      latitude: project.latitude,
      longitude: project.longitude,
      currency: project.currency?.name || null,
      address: project.address,
      price: project.price,
      icon: project.icon,
      vr_link: project.vr_link,
      picture: project.picture,
      video: project.video,
      created_at: project.created_at,
      updated_at: project.updated_at,
      created_by: project.created_by,
      updated_by: project.updated_by,
      status: project.status,
      meta_details: project.project_meta_details.map((meta) => ({
        id: meta.project_type_listing?.id || null,
        type: meta.project_type_listing?.type || null,
        key: meta.project_type_listing?.key || null,
        name: lang === 'en'
          ? meta.project_type_listing?.lang_translations?.en_string
          : meta.project_type_listing?.lang_translations?.fr_string,
        value: meta.value,
        icon: meta.project_type_listing?.icon || null,
      })),
      property_details: simplifiedProperties,
    };

    // Step 5: Return the response
    return response.success(res, res.__('messages.projectsFetchedSuccessfully'), simplifiedProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return response.serverError(res, res.__('messages.errorFetchingProjects'), { message: error.message });
  }
};


export const getProjectsByIdWithId = async (req, res) => {
  try {
    // Step 1: Validate `project_id`
    const { project_slug } = req.body;

    if (!project_slug) {
      return response.error(res, res.__('messages.projectIdRequired'));
    }

    // Step 2: Fetch project details
    const project = await prisma.projectDetails.findUnique({
      where: { slug: project_slug },
      include: {
        users: {
          select: {
            id: true,
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
          select: { 
            id: true,
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            id: true,
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        districts: {
          select: { 
            id: true,
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
        },
        currency: {  // Include the currency relation
          select: {
            id: true,
            symbol: true,  // Adjust this field name based on your Currency model definition
          },
        },
        neighborhoods: {
          select: {
            id: true,
            langTranslation: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
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
                icon: true,
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

    // Step 3: Handle case where project is not found
    if (!project) {
      return response.error(res, res.__('messages.projectNotFound'));
    }

    const lang = res.getLocale();

      const properties = await prisma.propertyDetails.findMany({
      where: { project_id: project.id },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        users: {
          select: {
            full_name: true,
            image: true,
            email_address:true,
          },
        },
        lang_translations_property_details_descriptionTolang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        lang_translations: {
          select: {
            en_string: true,
            fr_string: true,
          },
        },
        districts: {
        select: {
            langTranslation: {
            select: {
                en_string: true,
                fr_string: true,
            },
            },
        },
        },
        property_meta_details: {
          select: {
            value: true,
            property_type_listings: {
              select: {
                id: true,
                name: true,
                type: true,
                icon: true,
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
        currency: {
          select: {
              name: true,
              symbol: true,
              status: true
          }
        },
        neighborhoods: {
          select: {
              langTranslation: {
              select: {
                  en_string: true,
                  fr_string: true,
              },
              },
          },
          },
        property_types: {
          select: {
            id: true,
            title: true,
            lang_translations: {
              select: {
                en_string: true,
                fr_string: true,
              },
            },
          },
        },
      },
    });

    // Simplify and process the property details
    const simplifiedProperties = properties.map((property) => {
      console.log(property);
      const description =
        lang === 'fr'
          ? property.lang_translations_property_details_descriptionTolang_translations.fr_string
          : property.lang_translations_property_details_descriptionTolang_translations.en_string;
      const title =
        lang === 'fr'
          ? property.lang_translations.fr_string
          : property.lang_translations.en_string;
      const type =
        lang === 'fr'
          ? property.property_types?.lang_translations?.fr_string
          : property.property_types?.lang_translations?.en_string;
      const neighborhood =
        lang === 'fr'
          ? property.neighborhoods?.langTranslation?.fr_string
          : property.neighborhoods?.langTranslation?.en_string;

    

      const metaDetails = property.property_meta_details.map((meta) => {
        const langObj =
          lang === 'fr'
            ? meta.property_type_listings?.lang_translations?.fr_string
            : meta.property_type_listings?.lang_translations?.en_string;

        return {
          id: meta.property_type_listings?.id || null,
          type: meta.property_type_listings?.type || null,
          key: meta.property_type_listings?.key || null,
          icon: meta.property_type_listings?.icon || null,
          name: langObj,
          value: meta.value,
        };
      });

      const bathRooms =
        metaDetails.find((meta) => meta.key === 'bathrooms')?.value || "0";
      const bedRooms =
        metaDetails.find((meta) => meta.key === 'rooms')?.value || "0";
      const propertyType = res.__('messages.propertyType') + " " + property.transaction;

      return {
        id: property.id,
        user_name: property.users?.full_name || null,
        user_image: property.users?.image || null,
        email_address:property.users?.email_address || null,
        description,
        title,
        transaction: propertyType,
        transaction_type: property.transaction,
        picture: property.picture,
        video: property.video,
        latitude: property.latitude,
        longitude: property.longitude,
        address: property.address,
        size: property.size,
        price: property.price,
        created_at: property.created_at,
        bathRooms,
        bedRooms,
        district: 
        property.districts?.langTranslation &&
        (lang === "fr"
          ? property.districts.langTranslation.fr_string
          : property.districts.langTranslation.en_string),
        images: property.images_data,
        currency: property.currency?.name || null,
        neighborhood,
        type_details: [{
          id: property.property_types?.id || null,
          title: type,
        }],
      };
    });

    const stateObj = {
      id: project.states?.id || null,
      name: project.states?.lang?.[lang === 'fr' ? 'fr_string' : 'en_string'] || null,
    };
    const citiesObj = {
      id: project.cities?.id || null,
      name: project.cities?.lang?.[lang === 'fr' ? 'fr_string' : 'en_string'] || null,
    };
    const districtsObj = {
      id: project.districts?.id || null,
      name: project.districts?.langTranslation?.[lang === 'fr' ? 'fr_string' : 'en_string'] || null,
    };
    const neighborhoodsObj = {
      id: project.neighborhoods?.id || null,
      name: project.neighborhoods?.langTranslation?.[lang === 'fr' ? 'fr_string' : 'en_string'] || null,
    };

    
    // Step 4: Format the project data for the response
    const simplifiedProject = {
      id: project.id,
      user: project.users?.id || null,
      user_image: project.users?.image || null,
      title_en: project.lang_translations_title?.en_string,
      title_fr: project.lang_translations_title?.fr_string,
      description_fr: project.lang_translations_description?.fr_string,
      description_en: project.lang_translations_description?.en_string,
      state:  stateObj || null,
      city: citiesObj || null,
      district: districtsObj || null,
      neighborhood: neighborhoodsObj || null,
      latitude: project.latitude,
      longitude: project.longitude,
      currency: project.currency?.id || null,
      address: project.address,
      price: project.price,
      icon: project.icon,
      vr_link: project.vr_link,
      picture: project.picture,
      video: project.video,
      created_at: project.created_at,
      updated_at: project.updated_at,
      created_by: project.created_by,
      updated_by: project.updated_by,
      status: project.status,
      meta_details: project.project_meta_details.map((meta) => ({
        id: meta.project_type_listing?.id || null,
        type: meta.project_type_listing?.type || null,
        key: meta.project_type_listing?.key || null,
        name: lang === 'en'
          ? meta.project_type_listing?.lang_translations?.en_string
          : meta.project_type_listing?.lang_translations?.fr_string,
        value: meta.value,
        icon: meta.project_type_listing?.icon || null,
      })),
      property_details: simplifiedProperties,
    };

    // Step 5: Return the response
    return response.success(res, res.__('messages.projectsFetchedSuccessfully'), simplifiedProject);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return response.serverError(res, res.__('messages.errorFetchingProjects'), { message: error.message });
  }
};



export const getAgentDeveloperProjects = async (req, res) => {
  try {
    const userInfo = await commonFunction.getLoginUser(req.user.id);
    const { page = 1, limit = 10 } = req.body;

    // Ensure page and limit are valid numbers
    const validPage = Math.max(1, parseInt(page, 10)); // Default to 1 if invalid
    const validLimit = Math.max(1, parseInt(limit, 10)); // Default to 1 if invalid

    // Calculate the offset (skip) for pagination
    const skip = (validPage - 1) * validLimit;

    // Fetch total count for properties
    
    const whereCondition = (userInfo !== 'admin')?{ user_id: req.user.id }:{};
    const totalCount = await prisma.projectDetails.count({where: whereCondition});

    // Step 1: Fetch all projects from the database
    const projects = await prisma.projectDetails.findMany({
      skip,
      take: validLimit,
      where: whereCondition,
      orderBy:{
        created_at: 'desc',
      },
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
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        districts: {
          select: { 
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
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
      state: lang === 'fr' ? createdProject.states.lang.fr_string : createdProject.states.lang.en_string,
      city: lang === 'fr' ? createdProject.cities.lang.fr_string : createdProject.cities.lang.en_string,
      district: lang === 'fr' ? createdProject.districts.langTranslation.fr_string : createdProject.districts.langTranslation.en_string,
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      video: createdProject.video,
      created_at: createdProject.created_at,
      status: createdProject.status,
      slug: createdProject.slug,
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

    const responsePayload = {
      totalCount,
      totalPages: Math.ceil(totalCount / validLimit),
      currentPage: validPage,
      itemsPerPage: validLimit,
      list: simplifiedProjects,
    };
    // Step 3: Return the response
    return await response.success(res, res.__('messages.projectsFetchedSuccessfully'), responsePayload);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return await response.serverError(res, res.__('messages.errorFetchingProjects'));
  }
};


// Create a new project
export const createProject = async (req, res) => {
  try {
    // Extracting data from the request body
    const createdBy = req.user.id;
    const {
      title_en,
      title_fr,
      description_en,
      description_fr,
      state_id,
      city_id,
      district_id,
      latitude,
      longitude,
      address,
      vr_link,
      picture,
      icon,
      video,
      user_id,
      meta_details,
      neighborhoods_id,
      price,
      currency_id
    } = req.body;

    // Validate required fields
    if (
      !title_en ||
      !title_fr ||
      !description_en ||
      !description_fr ||
      !state_id ||
      !city_id ||
      !district_id ||
      !latitude ||
      !longitude ||
      !user_id ||
      !neighborhoods_id
    ) {
      return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
    }

    
    const user = await prisma.users.findFirst({
      where: {
        id: user_id,
        roles: {
          name: 'developer',  // Ensure the variable `type` has a correct role name
        },
      },
    })
    console.log(user);
    if(!user){
      return response.error(res, res.__('messages.onlyDeveloperCreat'), null, 400);
    }

    const projectCount = await prisma.projectDetails.count();
    if(projectCount > 0 ){
      const projectTitleExist = await prisma.projectDetails.findFirst({
        where: {
          OR: [
            { lang_translations_title: { en_string: title_en } },
            { lang_translations_title: { fr_string: title_fr } },
          ],
        },
      })
      
      if(projectTitleExist){
        return response.error(res, res.__('messages.projectCreated'), null, 400);
      }
    }
    

    const baseSlug = slugify(title_en, { lower: true, replacement: '_', strict: true });
    const uniqueSlug = await generateUniqueSlug(baseSlug);
    // // Step 1: Create translations for title and description
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

    // // Step 2: Create the project
    const newProject = await prisma.projectDetails.create({
      data: {
        title: titleTranslation.id, // Link to the title translation
        description: descriptionTranslation.id, // Link to the description translation
        state_id: state_id,
        city_id: city_id,
        district_id: district_id,
        neighborhoods_id: neighborhoods_id,
        price: price,
        latitude: latitude,
        longitude: longitude,
        currency_id: currency_id,
        address: address,
        slug: uniqueSlug,
        vr_link: vr_link || null,
        picture: picture || null,
        icon: icon || null,
        video: video || null,
        user_id: user_id,
        created_by: createdBy,
        created_at: new Date(),
        updated_at: new Date(),
        project_meta_details: {
          create: meta_details.map((meta) => ({
            value: meta.value,
            project_type_listing_id: meta.project_type_listing_id, // Link to the project type listing
          })),
        },
      },
    });

    // // Step 3: Fetch the created project with necessary relationships for the response
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
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        districts: {
          select: { 
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
        },
        neighborhoods: {
          select: {
            langTranslation: {
              select: { en_string: true, fr_string: true },
            },
          },
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

    // // Step 4: Format the project data for the response
    const lang = res.getLocale();
    const simplifiedProject = {
      id: createdProject.id,
      user_name: createdProject.users?.full_name || null,
      user_image: createdProject.users?.image || null,
      title: lang === 'fr' ? createdProject.lang_translations_title.fr_string : createdProject.lang_translations_title.en_string,
      description: lang === 'fr' ? createdProject.lang_translations_description.fr_string : createdProject.lang_translations_description.en_string,
      state:
      createdProject.states?.lang &&
        (lang === "fr"
          ? createdProject.states.lang.fr_string
          : createdProject.states.lang.en_string),
      city:
      createdProject.cities?.lang &&
        (lang === "fr"
          ? createdProject.cities.lang.fr_string
          : createdProject.cities.lang.en_string),
      district:
      createdProject.districts?.langTranslation &&
        (lang === "fr"
          ? createdProject.districts.langTranslation.fr_string
          : createdProject.districts.langTranslation.en_string),
      neighborhood:
      createdProject.neighborhoods?.langTranslation &&
        (lang === "fr"
          ? createdProject.neighborhoods.langTranslation.fr_string
          : createdProject.neighborhoods.langTranslation.en_string),
      currency_id: createdProject.currency_id,
      price: createdProject.price,
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      address: createdProject.address,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      icon: createdProject.icon,
      video: createdProject.video,
      created_at: createdProject.created_at,
      updated_at: createdProject.updated_at,
      created_by: createdProject.created_by,
      updated_by: createdProject.updated_by,
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

    // // Step 5: Return the response
    return await response.success(res, res.__('messages.projectCreatedSuccessfully'), simplifiedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return await response.serverError(res, res.__('messages.errorCreatingProject'));
  }
};


// Update an existing project
export const updateProject = async (req, res) => {
  try {
    // Extracting data from the request body
    const updatedBy = req.user.id;
    const {
      project_id,
      title_en,
      title_fr,
      description_en,
      description_fr,
      neighborhoods_id,
      state_id,
      city_id,
      district_id,
      latitude,
      longitude,
      address,
      vr_link,
      picture,
      icon,
      video,
      user_id,
      meta_details,
      currency_id,
      price
    } = req.body;

    // Validate required fields
    if (
      !project_id ||
      !title_en ||
      !title_fr ||
      !description_en ||
      !description_fr ||
      !state_id ||
      !city_id ||
      !district_id ||
      !latitude ||
      !longitude ||
      !user_id
    ) {
      return response.error(res, res.__('messages.allFieldsRequired'), null, 400);
    }

    // Step 1: Find the existing project
    const existingProject = await prisma.projectDetails.findUnique({
      where: { id: project_id },
    });

    if (!existingProject) {
      return res.status(404).json({
        status: false,
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
        state_id: state_id,
        city_id: city_id,
        currency_id: currency_id,
        price: price,
        district_id: district_id,
        neighborhoods_id: neighborhoods_id,
        latitude: latitude,
        longitude: longitude,
        address: address,
        vr_link: vr_link || null,
        picture: picture || null,
        icon: icon || null,
        video: video || null,
        user_id: user_id, // The user updating the project
        updated_by:updatedBy,
        updated_at: new Date(),
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
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        cities: {
          select: { 
            lang: { select: { fr_string: true, en_string: true } } 
          },
        },
        neighborhoods: {
          select: {
            langTranslation: {
              select: { en_string: true, fr_string: true },
            },
          },
        },
        districts: {
          select: { 
            langTranslation: { select: { fr_string: true, en_string: true } } 
          },
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
      neighborhood:
      createdProject.neighborhoods?.langTranslation &&
        (lang === "fr"
          ? createdProject.neighborhoods.langTranslation.fr_string
          : createdProject.neighborhoods.langTranslation.en_string),
      state:
      createdProject.states?.lang &&
        (lang === "fr"
          ? createdProject.states.lang.fr_string
          : createdProject.states.lang.en_string),
      city: 
      createdProject.cities?.lang &&
        (lang === "fr"
          ? createdProject.cities.lang.fr_string
          : createdProject.cities.lang.en_string),
      district:
      createdProject.districts?.langTranslation &&
        (lang === "fr"
          ? createdProject.districts.langTranslation.fr_string
          : createdProject.districts.langTranslation.en_string),
      latitude: createdProject.latitude,
      longitude: createdProject.longitude,
      address: createdProject.address,
      vr_link: createdProject.vr_link,
      picture: createdProject.picture,
      icon: createdProject.icon,
      video: createdProject.video,
      created_at: createdProject.created_at,
      currency_id: createdProject.currency_id,
      price: createdProject.price,
      updated_at: createdProject.updated_at,
      created_by: createdProject.created_by,
      updated_by: createdProject.updated_by,
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
    return await response.success(res, res.__('messages.projectUpdatedSuccessfully'), simplifiedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return await response.serverError(res, res.__('messages.errorCreatingProject'));
  }
};


// Delete a project (soft delete)
export const deleteProject = async (req, res) => {
  console.log(req.body);
  try {
    // Extracting the project_id from the request body
    //const { project_id } = req.body;
    const { id } = req.params;

    // Validate required field
    if (!id) {
      return await response.error(res, res.__('messages.projectIdRequired'));
    }

    // Step 1: Check if the project exists
    const existingProject = await prisma.projectDetails.findUnique({
      where: { id: id },
    });

    if (!existingProject) {
      return await response.error(res, res.__('messages.projectNotFound'));
    }

    // Step 2: Delete related project_meta_details
    await prisma.projectMetaDetails.deleteMany({
      where: { project_detail_id: id },
    });

    // Step 3: Delete the project
    await prisma.projectDetails.delete({
      where: { id: id },
    });

    // Step 4: Return success response
    return await response.success(res, res.__('messages.projectDeletedSuccessfully'), null);
  } catch (error) {
    console.error('Error deleting project:', error);
    return await response.serverError(res, res.__('messages.errorDeletingProject'));
  }
};


export const statusUpdateProject = async (req, res) => {
  try {
    // const { id } = req.params; // Extract the project ID from URL params
    const {id, status } = req.body; // Extract the status from the request body

    // Step 1: Validate that the status is provided
    if (status === undefined) {
      return await response.error(res, res.__('messages.statusRequired'));
    }

    // Step 2: Check if the project exists
    const existingProject = await prisma.projectDetails.findUnique({
      where: { id: id },
    });

    if (!existingProject) {
      return await response.error(res, res.__('messages.projectNotFound'));
    }

    // Step 3: Update the project status
    await prisma.projectDetails.update({
      where: { id: id },
      data: {
        status: status, // Update status field of the project
      },
    });

    // Step 4: Update project_meta_details if needed (e.g., for status or related info)
    await prisma.projectMetaDetails.updateMany({
      where: { project_detail_id: id }, // Ensure you update the related meta details
      data: {
        // Add any updates you need to perform on the meta details
        // status: status, // Example: update the status on meta details as well
        // is_deleted: status === 'inactive',
        project_detail_id: id 
      },
    });

    // Step 5: Return success response
    return await response.success(res, res.__('messages.projectStatusUpdatedSuccessfully'));
  } catch (error) {
    console.error('Error updating project status:', error);
    return await response.serverError(res, res.__('messages.errorUpdatingProjectStatus'));
  }
};
