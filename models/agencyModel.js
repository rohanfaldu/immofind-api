const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AgencyModel = {
  createAgency: async (data) => {
    return await prisma.agencies.create({ data });
  },

  getAllAgencies: async () => {
    return await prisma.agencies.findMany();
  },

  getAgencyById: async (id) => {
    return await prisma.agencies.findUnique({
      where: { id },
    });
  },
};

module.exports = AgencyModel;
