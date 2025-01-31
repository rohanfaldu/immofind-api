export const userInclude = {
    users: {
      select: {
        full_name: true,
        image: true,
        email_address: true,
        id: true,
        mobile_number: true,
        country_code: true
      },
    },
  };
  
export  const langTranslationsInclude = {
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
};
  
export  const currencyInclude = {
    currency: {
      select: {
        name: true,
        symbol: true,
        status: true,
        id: true
      },
    },
  };
  
export const neighborhoodInclude = {
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
};

export const districtsInclude = {
    districts: {
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
  };

  export const cityInclude = {
    cities: {
        select: {
          id: true,
          lang: {
            select: {
              en_string: true,
              fr_string: true,
            },
          },
        },
    },
  };

export const stateInclude = {
    states:{
        select: {
          id: true,
          lang: {
            select: {
              en_string: true,
              fr_string: true,
            },
          },
          latitude: true,
          longitude: true,
        },
    },
};
  
export const propertyMetaDetailsInclude = {
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
            is_filtered: true,
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
  };
  
export const propertyTypesInclude = {
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
  };
  