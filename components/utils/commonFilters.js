import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const commonFilter = {
    titleCondition: async (title, lang) => {
        return title
            ? {
                OR: [
                    {
                        cities: {
                            lang: {
                                [lang === 'fr' ? 'fr_string' : 'en_string']: {
                                    contains: title,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                    {
                        lang_translations: {
                            [lang === 'fr' ? 'fr_string' : 'en_string']: {
                                contains: title,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }
            : undefined;
    },

    titleConditionProject: async (title, lang) => {
        return title
            ? {
                OR: [
                    {
                        lang_translations_title: {
                            [lang === 'fr' ? 'fr_string' : 'en_string']: {
                                contains: title,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }
            : undefined;
    },


    descriptionCondition: async (description, lang) => {
        description ? {
            lang_translations_property_details_descriptionTolang_translations: {
                [lang === 'fr' ? 'fr_string' : 'en_string']: {
                    contains: description,
                    mode: 'insensitive',
                },
            },
        } : undefined;
    },

    cityCondition: async (city_id) => {
        return city_id
            ? {
                city_id: city_id,
            }
            : undefined;
    },
    cityDistrictNeightborhoodCondition: async (city_id) => {
        return city_id
            ? {
                OR: [
                    { state_id: city_id },
                    { city_id: city_id },
                    { district_id: city_id },
                    { neighborhoods_id: city_id },
                ],
            }
            : undefined;
    },

    districtCondition: async (district_id) => {
        return district_id
            ? {
                district_id: district_id,
            }
            : undefined;
    },

    neighborhoodCondition: async (neighborhoods_id) => {
        return neighborhoods_id
            ? {
                neighborhoods_id: neighborhoods_id,
            }
            : undefined;
    },

    addressCondition: async (address) => {
        return address
            ? {
                address: {
                    contains: address,
                    mode: 'insensitive',
                },
            }
            : undefined;
    },

    typeCondition: async (type_id) => {
        return type_id
            ? {
                property_types: {
                    id: type_id,
                },
            }
            : undefined;
    },

    priceCondition: async (minPrice, maxPrice, minPriceExtra, maxPriceExtra) => {
        const priceCondition = {}
        if (minPriceExtra) {
            priceCondition.gte = parseFloat(minPriceExtra)
        }
        if (maxPriceExtra) {
            priceCondition.lte = parseFloat(maxPriceExtra)
        }
        return {
            price: priceCondition,
        }
    },

    squareFootSize: async (minSize, maxSize, minSizeExtra, maxSizeExtra) => {
        const sizeCondition = {}
        if (minSizeExtra) {
            sizeCondition.gte = parseFloat(minSizeExtra)
        }
        if (maxSizeExtra) {
            sizeCondition.lte = parseFloat(maxSizeExtra)
        }
        return {
            size: sizeCondition,
        }
    },

    getLocationLatLong: async (id) => {
        let allData = {
            latitude: null,
            longitude: null,
            location_name: null
        };

        if (id) {
            const neighborhood = await prisma.neighborhoods.findFirst({
                where: { is_deleted: false, id },
            });

            if (neighborhood) {
                allData.latitude = neighborhood.latitude;
                allData.longitude = neighborhood.longitude;
                allData.location_name = "neighborhood";
            } else {
                const district = await prisma.districts.findFirst({
                    where: { is_deleted: false, id },
                });

                if (district) {
                    allData.latitude = district.latitude;
                    allData.longitude = district.longitude;
                    allData.location_name = "district";
                } else {
                    const city = await prisma.cities.findFirst({
                        where: { is_deleted: false, id },
                    });

                    if (city) {
                        allData.latitude = city.latitude;
                        allData.longitude = city.longitude;
                        allData.location_name = "city";
                    }
                }
            }
            if (allData.latitude && allData.longitude) {
                return allData;
            }
            return null; 
        } 
    },

    amenitiesCondition: async (amenities_id) => {
        if (Array.isArray(amenities_id) && amenities_id.length > 0) {
            return {
                property_meta_details: {
                    some: {
                        property_type_listings: {
                            id: {
                                in: amenities_id,
                            },
                        },
                    },
                },
            };
        }
        return undefined;
    },

    amenitiesConditionProperty: async (amenities_id) => {
        if (Array.isArray(amenities_id) && amenities_id.length > 0) {
            return {
                project_meta_details: {
                    some: {
                        project_type_listing: {
                            id: {
                                in: amenities_id,
                            },
                        },
                    },
                },
            };
        }
        return undefined;
    },


    amenitiesNumberCondition: async (amenitiesNumbers_id) => {
        if (typeof amenitiesNumbers_id === 'object' && amenitiesNumbers_id !== null) {
            const conditions = Object.entries(amenitiesNumbers_id).map(([id, minValue]) => {
                const condition = {
                    property_meta_details: {
                        some: {
                            property_type_listings: {
                                id: id,
                            },
                            value: minValue.toString() == "4" ? { lte: "4" } : minValue.toString(),

                        },
                    },
                };
                return condition;
            });

            return {
                OR: conditions,
            };
        }
        return undefined;
    },
    amenitiesOnlyBedRoomCondition: async (amenitiesNumbersArray) => {
        if (!Array.isArray(amenitiesNumbersArray) || amenitiesNumbersArray.length === 0) {
            return {};
        }

        const roomConditions = [];
        const otherConditions = [];

        for (const item of amenitiesNumbersArray) {
            const condition = {
                property_meta_details: {
                    some: {
                        property_type_listings: {
                            id: item.id,
                        },
                        value: item.value.toString() === "4" ? { lte: "4" } : item.value.toString(),
                    },
                },
            };

            if (item.slug === "rooms") {
                roomConditions.push(condition); // Only consider 'rooms' for AND
            } else {
                otherConditions.push(condition); // Everything else for OR
            }
        }

        if (roomConditions.length > 0) {
            return {
                AND: roomConditions,
            };
        }

        // if (otherConditions.length > 0) {
        //     return {
        //         OR: otherConditions,
        //     };
        // }

        return {};
    },


    amenitiesNumberConditionProject: async (amenitiesNumbers_id) => {
        if (typeof amenitiesNumbers_id === 'object' && amenitiesNumbers_id !== null) {
            const conditions = Object.entries(amenitiesNumbers_id).map(([id, minValue]) => {
                const condition = {
                    project_meta_details: {
                        some: {
                            project_type_listing: {
                                id: id,
                            },
                            value: minValue.toString()

                        },
                    },
                };
                console.log(condition);
                return condition;
            });

            return {
                OR: conditions,
            };
        }
        return undefined;
    },

    directionCondition: async (direction) => {
        return direction
            ? {
                direction: {
                    equals: direction.toLowerCase(),
                },
            }
            : undefined;
    },

    developerCondition: async (developer_id) => {
        return developer_id
            ? {
                user_id: developer_id,
            }
            : undefined;
    },

    transactionCondition: async (transaction) => {
        return transaction
            ? {
                transaction: transaction,
            }
            : undefined;
    }

}

export default commonFilter;