const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const AgencyModel = {
  createAgency: async (data) => {
    return await prisma.agency.create({
      data,
    });
  },
};

module.exports = AgencyModel;
