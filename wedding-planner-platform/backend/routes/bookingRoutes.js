const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { customerLimiter } = require('../middleware/rateLimitMiddleware');

router.use(authMiddleware);

// Customer endpoints
router.get('/customer/active', authorizeRoles('CUSTOMER'), bookingController.getMyBooking);
router.post('/customer/select-vendor', authorizeRoles('CUSTOMER'), customerLimiter, bookingController.selectVendorForCustomer);
router.post('/customer/remove-vendor', authorizeRoles('CUSTOMER'), customerLimiter, bookingController.removeVendorFromCustomerBooking);
router.put('/:id/approve', authorizeRoles('CUSTOMER'), customerLimiter, bookingController.approveBookingArrangement);
router.put('/:id/request-change', authorizeRoles('CUSTOMER'), customerLimiter, bookingController.requestBookingChanges);

// Vendor endpoints
router.get('/vendor/my-bookings', authorizeRoles('VENDOR'), bookingController.getVendorBookings);

// General & Planner endpoints
router.get('/selected-vendors', authorizeRoles('PLANNER'), bookingController.getSelectedVendors);
router.get('/', authorizeRoles('PLANNER'), bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.put('/:id/status', authorizeRoles('PLANNER'), bookingController.updateBookingStatus);

module.exports = router;
