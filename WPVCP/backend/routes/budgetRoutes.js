const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/customer/active', authorizeRoles('CUSTOMER'), budgetController.getCustomerBudget);
router.get('/project/:projectId', budgetController.getProjectBudget);
router.post('/items', authorizeRoles('PLANNER'), budgetController.addBudgetItem);
router.put('/items/:id', authorizeRoles('PLANNER'), budgetController.updateBudgetItem);
router.delete('/items/:id', authorizeRoles('PLANNER'), budgetController.deleteBudgetItem);

module.exports = router;
