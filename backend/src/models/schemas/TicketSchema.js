const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticket_number: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['New', 'Open', 'Pending', 'Resolved', 'Closed'],
    default: 'New'
  },
  channel: {
    type: String,
    enum: ['Email', 'Web', 'Phone', 'Social'],
    default: 'Email'
  },
  sentiment_score: {
    type: Number,
    min: -1,
    max: 1
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  sla_deadline: {
    type: Date,
    required: true
  },
  resolved_at: {
    type: Date
  }
}, {
  timestamps: true
});

TicketSchema.index({ ticket_number: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ customer: 1 });
TicketSchema.index({ agent: 1 });
TicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);