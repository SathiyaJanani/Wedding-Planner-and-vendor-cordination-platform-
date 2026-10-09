const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

// Customer endpoints
router.get('/customer/my-payments', authorizeRoles('CUSTOMER'), paymentController.getCustomerPayments);
router.post('/process', authorizeRoles('CUSTOMER'), paymentLimiter, paymentController.processPayment);

// Vendor endpoints
router.get('/vendor/earnings', authorizeRoles('VENDOR'), paymentController.getVendorPayments);

// Planner endpoints
router.get('/', authorizeRoles('PLANNER'), paymentController.getAllPayments);

module.exports = router;
