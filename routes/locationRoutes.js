import express from 'express';
import { readJsonFile } from '../components/utils/readJsonFile.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const parseCoordinate = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}
// Helper function to find or create a langTranslation
async function findOrCreateLangTranslation(en_string, fr_string) {
    let translation = await prisma.langTranslations.findFirst({
        where: { en_string },
    });
    if (!translation) {
        translation = await prisma.langTranslations.create({
            data: { en_string, fr_string },
        });
    }
    return translation;
}

router.post('/allLocations', async (_req, res) => {
    try {
        const allLocationData = await readJsonFile();
        console.log(allLocationData, ' >>>>>>>>>>>> allLocationData');
        for (const [stateName, stateData] of Object.entries(allLocationData)) {
            const stateLat = stateData.lat;
            const stateLong = stateData.lon;

            console.log(stateLat, ' >>>>>>>>>>>> stateLat');
            console.log(stateLong, ' >>>>>>>>>>>> stateLong');
            console.log(stateName, ' >>>>>>>>>>>> stateName');

            const getStateDetail = await prisma.states.findFirst({
                where: {
                    lang: {
                        OR: [
                            { en_string: stateName },
                            { fr_string: stateName }
                        ]
                    }
                }
            });

            if (getStateDetail) {
              
                // Update latitude and longitude
                const updatedState = await prisma.states.update({
                    where: {
                        id: getStateDetail.id
                    },
                    data: {
                        latitude: parseCoordinate(stateData.lat),
                        longitude: parseCoordinate(stateData.lon)
                    }
                });

                console.log(updatedState.id, " >>>>>>>>>>> Updated State Data");
                console.log("State coordinates updated successfully");
            } else {
                const createdState = await prisma.states.create({
                    data: {
                        latitude: parseCoordinate(stateData.lat),
                        longitude: parseCoordinate(stateData.lon),
                        lang: {
                            create: {
                                en_string: stateName,
                                fr_string: stateName
                            }
                        }
                    }
                });
                console.log(createdState.id, " >>>>>>>>>>> Created State Data");
            }

            // const fr_stateName = stateData.fr_name || stateName;


            // let state = await prisma.states.findFirst({
            //     where: { lang_id: stateLangTranslation.id },
            // });

            // // Find or create langTranslation for state
            // const stateLangTranslation = await findOrCreateLangTranslation(stateName, fr_stateName);

            // // Find or create state by lang_id
            // let state = await prisma.states.findFirst({
            //     where: { lang_id: stateLangTranslation.id },
            // });

            // if (!state) {
            //     state = await prisma.states.create({
            //         data: {
            //             lang_id: stateLangTranslation.id,
            //             latitude: parseFloat(stateData.lat),
            //             longitude: parseFloat(stateData.lon),
            //         },
            //     });
            // }

            // // Cities
            // for (const [cityName, cityData] of Object.entries(stateData.cities || {})) {
            //     const fr_cityName = cityData.fr_name || cityName;

            //     const cityLangTranslation = await findOrCreateLangTranslation(cityName, fr_cityName);

            //     let city = await prisma.cities.findFirst({
            //         where: {
            //             lang_id: cityLangTranslation.id,
            //             state_id: state.id,
            //         },
            //     });

            //     if (!city) {
            //         city = await prisma.cities.create({
            //             data: {
            //                 lang_id: cityLangTranslation.id,
            //                 state_id: state.id,
            //                 latitude: parseFloat(cityData.lat),
            //                 longitude: parseFloat(cityData.lon),
            //             },
            //         });
            //     }

            //     // Districts
            //     for (const [districtName, districtData] of Object.entries(cityData.districts || {})) {
            //         if (districtName.trim() === '') continue;

            //         const fr_districtName = districtData.fr_name || districtName;
            //         const districtLangTranslation = await findOrCreateLangTranslation(districtName, fr_districtName);

            //         let district = await prisma.districts.findFirst({
            //             where: {
            //                 lang_id: districtLangTranslation.id,
            //                 city_id: city.id,
            //             },
            //         });

            //         if (!district) {
            //             district = await prisma.districts.create({
            //                 data: {
            //                     lang_id: districtLangTranslation.id,
            //                     city_id: city.id,
            //                     latitude: parseFloat(districtData.lat),
            //                     longitude: parseFloat(districtData.lon),
            //                 },
            //             });
            //         }

            //         // Neighborhoods (towns)
            //         for (const [townName, townData] of Object.entries(districtData.towns || {})) {
            //             if (townName.trim() === '') continue;

            //             const fr_townName = townData.fr_name || townName;
            //             const townLangTranslation = await findOrCreateLangTranslation(townName, fr_townName);

            //             await prisma.neighborhoods.create({
            //                 data: {
            //                     lang_id: townLangTranslation.id,
            //                     city_id: city.id,
            //                     district_id: district.id,
            //                     latitude: parseFloat(townData.lat),
            //                     longitude: parseFloat(townData.lon),
            //                 },
            //             });
            //         }
            //     }
            // }
        }




        res.json({ status: true, message: 'Locations stored successfully', });
    } catch (error) {
        console.error('Error storing locations:', error);
        res.status(500).json({ success: false, message: 'Failed to store locations', error: error.message });
    }
});

export default router;
