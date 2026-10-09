const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const { messageLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/', messageLimiter, messageController.sendMessage);

module.exports = router;
