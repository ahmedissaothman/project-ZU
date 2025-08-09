const express = require('express');
const router = express.Router();
const { getCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/companies.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', authenticate, getCompanies);
router.post('/', authenticate, authorize('Admin', 'Manager'), createCompany);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), updateCompany);
router.delete('/:id', authenticate, authorize('Admin'), deleteCompany);

module.exports = router;