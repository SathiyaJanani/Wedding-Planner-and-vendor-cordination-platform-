const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Customer gets own active project
router.get('/customer/active', authorizeRoles('CUSTOMER'), projectController.getCustomerProject);

// Get projects (Planner gets all, Vendor gets assigned, Customer gets own)
router.get('/', authorizeRoles('PLANNER', 'VENDOR', 'CUSTOMER'), projectController.getAllProjects);
router.post('/', authorizeRoles('PLANNER'), projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', authorizeRoles('PLANNER'), projectController.updateProject);

module.exports = router;
