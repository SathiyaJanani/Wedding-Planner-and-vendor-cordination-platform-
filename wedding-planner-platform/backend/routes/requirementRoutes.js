const express = require('express');
const router = express.Router();
const requirementController = require('../controllers/requirementController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Customer submits & views own requirements
router.post('/', authorizeRoles('CUSTOMER'), requirementController.submitRequirements);
router.put('/:id', authorizeRoles('CUSTOMER'), requirementController.updateRequirement);
router.put('/:id/send-to-planner', authorizeRoles('CUSTOMER'), requirementController.sendRequirementToPlanner);
router.get('/me', authorizeRoles('CUSTOMER'), requirementController.getMyRequirements);

// Planner reviews & converts to project
router.get('/', authorizeRoles('PLANNER'), requirementController.getAllRequirements);
router.post('/:id/convert', authorizeRoles('PLANNER'), requirementController.convertRequirementToProject);
router.put('/:id/decline', authorizeRoles('PLANNER'), requirementController.declineRequirement);

module.exports = router;
