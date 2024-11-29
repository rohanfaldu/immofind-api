import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';
import propertyModel from '../models/propertyModel.js';
import commonFunction from '../components/utils/commonFunction.js';
const prisma = new PrismaClient();

// Get all property type listings
export const getAllProperty = async (req, res) => {
    const properties = await prisma.propertyDetails.findMany({
        include: {
            users: {
                select:{
                    full_name: true,
                    image: true,
                }
            },
            lang_translations_property_details_descriptionTolang_translations: 
            {
                select: {
                    en_string: true, // Select only the role name
                    fr_string: true, // Select only the role name
                },
            },
            lang_translations: 
            {
                select: {
                    en_string: true, // Select only the role name
                    fr_string: true, // Select only the role name
                },
            },
            districts: {
                select: {
                  name: true, // Select only the role name
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
                      key: true,
                      lang_translations: { // Assuming property_type_listings has lang_translations relation
                        select: {
                          en_string: true,  // English translation of name
                          fr_string: true,  // French translation of name
                        },
                      },
                    },
                  },
                },
              },
              property_types: {
                select: {
                    id: true,
                    title: true,
                    lang_translations: { // Assuming property_type_listings has lang_translations relation
                      select: {
                        en_string: true,  // English translation of name
                        fr_string: true,  // French translation of name
                      },
                    },
                  },
              },
        },
    });
    if(properties){
        const lang = res.getLocale();
        
        const simplifiedProperties = properties.map((property) => {
            const description = (lang == 'fr') ? property.lang_translations_property_details_descriptionTolang_translations.fr_string : property.lang_translations_property_details_descriptionTolang_translations.en_string;
            const title = (lang == 'fr') ? property.lang_translations.fr_string : property.lang_translations.en_string;
            const type = (lang == 'fr') ? property.property_types?.lang_translations?.fr_string : property.property_types?.lang_translations?.en_string;
            const metaDetails = property.property_meta_details.map((meta) => {
                let langObj;
                if (lang === 'en') {
                    langObj = meta.property_type_listings?.lang_translations?.en_string || null;
                } else if (lang === 'fr') {
                    langObj = meta.property_type_listings?.lang_translations?.fr_string || null;
                }
            
                return {
                    id: meta.property_type_listings?.id || null,
                    type: meta.property_type_listings?.type || null,
                    key: meta.property_type_listings?.key || null,
                    name: langObj,
                    value: meta.value,
                };
            });
            const bathRooms = metaDetails.find((meta) => meta.key === 'bathrooms')?.value || 0;
            const bedRooms = metaDetails.find((meta) => meta.key === 'rooms')?.value || 0;
            const propertyType = res.__('messages.propertyType')+" "+property.transaction;
            // const typeText = commonFunction.capitalize(type);
            // console.log(typeText);
            return ({
                id: property.id,
                user_name: property.users?.full_name || null,
                user_image: property.users?.image || null,
                description: description,
                title: title,
                transaction: propertyType,
                transaction_type: property.transaction,
                latitude: property.latitude,
                longitude: property.longitude,
                size: property.size,
                price: property.price,
                bathRooms: bathRooms,
                bedRooms: bedRooms,
                district: property.districts?.name || null,
                meta_details: metaDetails,
                type: type
            });
        })
            
        return response.success(res, res.__('messages.agencyDeletedSuccessfully'), simplifiedProperties);   
    }
      
};