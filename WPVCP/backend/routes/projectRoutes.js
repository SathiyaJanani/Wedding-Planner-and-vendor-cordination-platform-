const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Customer gets own active project
router.get('/customer/active', authorizeRoles('CUSTOMER'), projectController.getCustomerProject);

// Get projects (Planner gets all, Vendor gets assigned, Customer gets own, Admin gets all)
router.get('/', authorizeRoles('PLANNER', 'VENDOR', 'CUSTOMER', 'ADMIN'), projectController.getAllProjects);
router.post('/', authorizeRoles('PLANNER', 'ADMIN'), projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authorizeRoles('PLANNER', 'ADMIN'), projectController.updateProject);
router.put('/:id/customer-verify', authorizeRoles('CUSTOMER', 'ADMIN'), projectController.customerVerifyProject);

module.exports = router;
