const express = require('express');
const router = express.Router();
const { getUserHistory, getAllUsers } = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/history', authenticate, getUserHistory);
router.get('/', authenticate, authorizeAdmin, getAllUsers);

module.exports = router;
