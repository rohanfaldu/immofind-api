 const commonFilter = {
    titleCondition: async (title, lang) => {
        return title ? {
          lang_translations: {
            [lang === 'fr' ? 'fr_string' : 'en_string']: {
              contains: title,
              mode: 'insensitive',
            },
          },
        } : undefined;
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

    priceCondition: async (minPrice, maxPrice) => {
        const priceCondition = {}
        if (minPrice) {
          priceCondition.gte = parseFloat(minPrice)
        }
        if (maxPrice) {
          priceCondition.lte = parseFloat(maxPrice)
        }
        return {
          price: priceCondition,
        }
    },

    squareFootSize: async (minSize, maxSize) => {
        const sizeCondition = {}
        if (minSize) {
            sizeCondition.gte = parseFloat(minSize)
        }
        if (maxSize) {
            sizeCondition.lte = parseFloat(maxSize)
        }
        return {
          size: sizeCondition,
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
    

    amenitiesNumberCondition: async (amenitiesNumbers_id) => {
        if (typeof amenitiesNumbers_id === 'object' && amenitiesNumbers_id !== null) {
            const conditions = Object.entries(amenitiesNumbers_id).map(([id, minValue]) => {
                const condition = {
                    property_meta_details: {
                        some: {
                            property_type_listings: {
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