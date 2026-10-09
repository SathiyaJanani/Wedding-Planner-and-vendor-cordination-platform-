const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { reportLimiter } = require('../middleware/rateLimitMiddleware');

router.use(authMiddleware);

router.get('/', reportLimiter, reportController.getReports);

module.exports = router;
