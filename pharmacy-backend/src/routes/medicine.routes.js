 
const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getBatches,
  createBatch
} = require('../controllers/medicine.controller');

const router = express.Router();

// Medicine routes
router.get('/', authenticate, getMedicines);
router.get('/:id', authenticate, getMedicine);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), createMedicine);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), updateMedicine);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), deleteMedicine);

// Batch routes
router.get('/batches/all', authenticate, getBatches);
router.post('/batches', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN), createBatch);

module.exports = router;