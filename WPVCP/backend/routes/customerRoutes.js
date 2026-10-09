const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Customer gets own profile
router.get('/me', customerController.getMyCustomerProfile);
router.get('/planners/available', customerController.getAvailablePlanners);
router.post('/request-planner', authorizeRoles('CUSTOMER'), customerController.requestPlanner);

// Planner manages customers
router.get('/', authorizeRoles('PLANNER'), customerController.getAllCustomers);
router.post('/', authorizeRoles('PLANNER'), customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', authorizeRoles('PLANNER', 'CUSTOMER'), customerController.updateCustomer);
router.delete('/:id', authorizeRoles('PLANNER'), customerController.deleteCustomer);
router.put('/:id/assign-planner', authorizeRoles('PLANNER'), customerController.assignPlanner);

module.exports = router;
