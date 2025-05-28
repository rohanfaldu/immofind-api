import express from 'express';
import { visitSchedule, getVisitSchedule, getAcceptedVisitSchedule, getPendingVisitScheduleForCreators, acceptPendingVisit, declinePendingVisit, getRejectedVisitScheduleForCreators, getUserVisitSchedule, visitReschedule, getVisitUserSchedule, visitUpdateSchedule } from '../controllers/visitController.js';
import { authorize } from '../middleware/authorization.js'; // Import the authorization middleware
const router = express.Router();

router.post('/visit-schedule', authorize, visitSchedule);
router.post('/get-visit-schedule', authorize, getVisitSchedule);
router.post('/get-user-visit-schedule', authorize, getUserVisitSchedule);
router.post('/get-accepted-visit-schedule', authorize, getAcceptedVisitSchedule);
router.post('/get-pending-visit-schedule-creators', authorize, getPendingVisitScheduleForCreators);
router.post('/get-rejected-visit-schedule-creators', authorize, getRejectedVisitScheduleForCreators);
router.post('/accept-pending-Visit', authorize, acceptPendingVisit);
router.post('/reject-pending-Visit', authorize, declinePendingVisit);
router.post('/visit-reschedule', authorize, visitReschedule);
router.post('/get-visit-user-detail', authorize, getVisitUserSchedule);
router.post('/visit-update-schedule', authorize, visitUpdateSchedule);

export default router;
