const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { getNotifications, createNotification, markAsRead } = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.post('/', authenticate, createNotification);
router.put('/:id/read', authenticate, markAsRead);

module.exports = router;