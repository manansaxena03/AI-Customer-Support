const express = require('express');
const { createTicket, getTickets, getTicketById } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);

module.exports = router;