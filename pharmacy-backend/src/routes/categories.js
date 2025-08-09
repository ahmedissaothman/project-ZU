const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categories.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', authenticate, getCategories);
router.post('/', authenticate, authorize('Admin', 'Manager'), createCategory);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), updateCategory);
router.delete('/:id', authenticate, authorize('Admin'), deleteCategory);

module.exports = router;