const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authMiddleware = require('../middleware/authMiddleware');
const { chatbotLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/message', chatbotLimiter, chatbotController.handleChatbotMessage);
router.get('/history', chatbotController.getChatbotHistory);

module.exports = router;
