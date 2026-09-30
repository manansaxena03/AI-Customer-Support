const express = require('express');
const { analyzeMessage } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeMessage);

module.exports = router;