const express = require('express');
const extractorController = require('../controllers/extractorController');

const router = express.Router();

router.get('/', extractorController.getHello)
router.post('/extractor-video/', extractorController.postTelemetryByFilter)
router.get('/extractor-video/', extractorController.getTelemetryByFilter)
router.get('/logging/', extractorController.getLogging)

module.exports = router;
