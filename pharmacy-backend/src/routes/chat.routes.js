const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { getMessages, sendMessage, getConversations } = require('../controllers/chat.controller');

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/messages', authenticate, getMessages);
router.post('/messages', authenticate, sendMessage);

module.exports = router;