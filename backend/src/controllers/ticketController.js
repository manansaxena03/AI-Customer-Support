const tickets = [];

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message, category } = req.body;
    const newTicket = { id: Date.now(), customer_id: req.user.id, subject, message, category, status: 'Open', created_at: new Date() };
    tickets.push(newTicket);
    res.status(201).json({ success: true, message: 'Ticket created', data: newTicket });
  } catch (error) {
    next(error);
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const userTickets = req.user.role === 'customer' ? tickets.filter(t => t.customer_id === req.user.id) : tickets;
    res.status(200).json({ success: true, data: userTickets });
  } catch (error) {
    next(error);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};