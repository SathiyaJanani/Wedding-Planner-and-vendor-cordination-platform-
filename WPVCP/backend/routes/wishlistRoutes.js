const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { customerLimiter } = require('../middleware/rateLimitMiddleware');

router.use(authMiddleware);

router.get('/', authorizeRoles('CUSTOMER'), wishlistController.getWishlist);
router.post('/', authorizeRoles('CUSTOMER'), customerLimiter, wishlistController.addToWishlist);
router.delete('/:id', authorizeRoles('CUSTOMER'), customerLimiter, wishlistController.removeFromWishlist);

module.exports = router;
