exports.getStats = async (req, res, next) => {
  try {
    const stats = {
      totalCustomers: 125,
      totalTickets: 84,
      openTickets: 12,
      resolvedTickets: 72,
      averageResponseTime: '2.4 hours',
      customerSatisfaction: '92%'
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};