const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Public or authenticated category & directory lookups
router.get('/categories', vendorController.getCategories);

// Protected routes
router.use(authMiddleware);

// Specific named routes (MUST precede /:id)
router.get('/profile/me', authorizeRoles('VENDOR'), vendorController.getMyVendorProfile);
router.get('/services/all', vendorController.getAllVendorServices);
router.get('/my-customers', authorizeRoles('VENDOR'), vendorController.getVendorConnectedCustomers);

router.get('/', vendorController.getVendors);
router.get('/:id/availability/check', vendorController.checkAvailability);
router.get('/:id/availability', vendorController.getVendorAvailability);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', authorizeRoles('VENDOR', 'PLANNER'), vendorController.updateVendorProfile);

// Availability setting & deletion
router.post('/:id/availability', authorizeRoles('VENDOR', 'PLANNER'), vendorController.setVendorAvailability);
router.delete('/:id/availability/:slotId', authorizeRoles('VENDOR', 'PLANNER'), vendorController.deleteVendorAvailability);

// Catalog service CRUD
router.post('/services', authorizeRoles('VENDOR', 'PLANNER'), vendorController.addVendorService);
router.put('/services/:serviceId', authorizeRoles('VENDOR', 'PLANNER'), vendorController.updateVendorService);
router.put('/services/:serviceId/verify', authorizeRoles('PLANNER', 'ADMIN'), vendorController.verifyVendorService);
router.delete('/services/:serviceId', authorizeRoles('VENDOR', 'PLANNER'), vendorController.deleteVendorService);

module.exports = router;
