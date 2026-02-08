const express = require('express');
const controller = require('../controllers/animeController');

const router = express.Router();

router.get('/search', controller.searchAnime);

module.exports = router;
