const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getAllTickets, 
  getTicketById,
  assignTicket,
  updateTicketStatus,
  addNote,
  addSurvey,
  getStats
} = require('../controllers/ticketController');

// Routes tickets
router.post('/tickets', createTicket);
router.get('/tickets', getAllTickets);
router.get('/tickets/stats', getStats);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id/assign', assignTicket);
router.put('/tickets/:id/status', updateTicketStatus);
router.post('/tickets/:id/notes', addNote);
router.post('/tickets/:id/survey', addSurvey);

module.exports = router;