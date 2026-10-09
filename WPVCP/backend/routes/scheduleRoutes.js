const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/customer/active', authorizeRoles('CUSTOMER'), scheduleController.getCustomerSchedule);
router.get('/vendor/my-schedule', authorizeRoles('VENDOR'), scheduleController.getVendorSchedule);
router.get('/project/:projectId', scheduleController.getProjectSchedule);
router.get('/', authorizeRoles('PLANNER'), scheduleController.getAllSchedules);
router.post('/', authorizeRoles('PLANNER', 'VENDOR'), scheduleController.addScheduleEvent);
router.put('/:id', authorizeRoles('PLANNER', 'VENDOR'), scheduleController.updateScheduleEvent);
router.delete('/:id', authorizeRoles('PLANNER', 'VENDOR'), scheduleController.deleteScheduleEvent);

module.exports = router;
