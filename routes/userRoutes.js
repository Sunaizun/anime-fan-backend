const express = require('express');
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, controller.getProfile);
router.put('/profile', auth, controller.updateProfile);

module.exports = router;
