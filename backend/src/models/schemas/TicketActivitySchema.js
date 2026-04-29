const mongoose = require('mongoose');

const TicketActivitySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  action_type: {
    type: String,
    required: true,
    enum: ['created', 'assigned', 'status_changed', 'note_added', 'priority_changed']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  description: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

TicketActivitySchema.index({ ticket: 1, timestamp: -1 });

module.exports = mongoose.model('TicketActivity', TicketActivitySchema);