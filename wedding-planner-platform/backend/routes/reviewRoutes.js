const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', reviewController.getReviews);
router.post('/', authorizeRoles('CUSTOMER'), reviewController.submitReview);
router.put('/:id/respond', authorizeRoles('VENDOR', 'PLANNER'), reviewController.respondToReview);

module.exports = router;
