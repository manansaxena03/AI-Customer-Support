const { analyzeTextMock } = require('../services/aiService');

exports.analyzeMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const analysis = analyzeTextMock(message);
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};