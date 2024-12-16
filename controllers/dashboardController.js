import { PrismaClient } from '@prisma/client';
import response from '../components/utils/response.js';

const prisma = new PrismaClient();
export const getList = async (req, res) => {
    try {
        const totalNormalUsersCount = await prisma.users.count({ where: { roles: { name: 'user' } } });
        const totalUsersCount = await prisma.users.count();
        const totalAgencyUsersCount = await prisma.users.count({ where: { roles: { name: 'agency' } } });
        const totalDeveloperUsersCount = await prisma.users.count({ where: { roles: { name: 'developer' } } });
        const totalProjectCount = await prisma.projectDetails.count();
        const totalPropertyCount = await prisma.propertyDetails.count();
        const responseData = {
            total_users: totalUsersCount,
            normal_user_count: totalNormalUsersCount,
            agent_ser_count: totalAgencyUsersCount,
            developer_user_count: totalDeveloperUsersCount,
            project_count: totalProjectCount,
            property_count: totalPropertyCount  
        }
        console.log(responseData);
        response.success(res, res.__('messages.dashboardList'), responseData);
    } catch (error) {
        response.serverError(res, error);
    }
}