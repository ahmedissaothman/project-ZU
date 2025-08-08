const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const { 
  getDeliveries, 
  createDelivery, 
  updateDeliveryStatus,
  getFeedback,
  createFeedback 
} = require('../controllers/delivery.controller');

const router = express.Router();

router.get('/', authenticate, getDeliveries);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), createDelivery);
router.put('/:id/status', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.DELIVERY), updateDeliveryStatus);
router.get('/feedback', authenticate, getFeedback);
router.post('/feedback', authenticate, createFeedback);

module.exports = router;