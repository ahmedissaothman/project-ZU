const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const { getPayments, createPayment, getReceipts } = require('../controllers/payment.controller');

const router = express.Router();

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), getPayments);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), createPayment);
router.get('/receipts', authenticate, getReceipts);

module.exports = router;