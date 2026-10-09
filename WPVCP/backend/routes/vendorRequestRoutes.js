const express = require('express');
const router = express.Router();
const vendorRequestController = require('../controllers/vendorRequestController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { vendorRequestLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/', authorizeRoles('PLANNER'), vendorRequestLimiter, vendorRequestController.createVendorRequest);
router.get('/', authorizeRoles('PLANNER', 'VENDOR'), vendorRequestController.getVendorRequests);
router.put('/:id/accept', authorizeRoles('VENDOR', 'PLANNER'), vendorRequestLimiter, vendorRequestController.acceptVendorRequest);
router.put('/:id/decline', authorizeRoles('VENDOR', 'PLANNER'), vendorRequestLimiter, vendorRequestController.declineVendorRequest);
router.post('/arrange', authorizeRoles('PLANNER'), vendorRequestLimiter, vendorRequestController.arrangeAcceptedVendor);

module.exports = router;
