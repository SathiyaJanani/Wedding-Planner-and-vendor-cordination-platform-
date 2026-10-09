const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const { messageLimiter } = require('../middleware/rateLimiter');

// Ensure voice uploads folder exists
const voiceUploadsDir = path.resolve(__dirname, '../uploads/voice');
if (!fs.existsSync(voiceUploadsDir)) {
  fs.mkdirSync(voiceUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, voiceUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `voice-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/contacts', messageController.getContacts);
router.get('/:conversationId', messageController.getMessages);
router.post('/', messageLimiter, messageController.sendMessage);
router.post('/voice', upload.single('audio'), messageController.sendVoiceMessage);

module.exports = router;

