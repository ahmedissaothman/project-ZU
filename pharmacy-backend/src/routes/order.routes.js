 
const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/order.controller');

const router = express.Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.CASHIER), createOrder);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), updateOrder);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), deleteOrder);

module.exports = router;