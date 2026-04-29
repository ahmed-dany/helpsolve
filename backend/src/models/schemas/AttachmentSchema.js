const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  file_size: {
    type: Number
  },
  mime_type: {
    type: String
  }
}, {
  timestamps: true
});

AttachmentSchema.index({ ticket: 1 });

module.exports = mongoose.model('Attachment', AttachmentSchema);