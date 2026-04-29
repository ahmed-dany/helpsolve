const mongoose = require('mongoose');

const InternalNoteSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

InternalNoteSchema.index({ ticket: 1, createdAt: -1 });

module.exports = mongoose.model('InternalNote', InternalNoteSchema);