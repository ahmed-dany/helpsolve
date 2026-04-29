const mongoose = require('mongoose');

const SatisfactionSurveySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  verbatim: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

SatisfactionSurveySchema.index({ ticket: 1 });
SatisfactionSurveySchema.index({ rating: 1 });

module.exports = mongoose.model('SatisfactionSurvey', SatisfactionSurveySchema);