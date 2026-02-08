const express = require('express');
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/reviewController');
const { validateReview } = require('../middleware/validate');

const router = express.Router();

router.post('/', auth, controller.createReview);
router.get('/', auth, controller.getMyReviews);
router.get('/:id', auth, controller.getReviewById);
router.put('/:id', auth, controller.updateReview);
router.delete('/:id', auth, controller.deleteReview);
router.post('/', auth, validateReview, controller.createReview);

module.exports = router;
