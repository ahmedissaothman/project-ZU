const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const { getUsers, updateUser, deleteUser } = require('../controllers/user.controller');

const router = express.Router();

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), getUsers);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.MANAGER), updateUser);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteUser);

module.exports = router;