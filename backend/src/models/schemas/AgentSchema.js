const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['Available', 'Busy', 'Offline'],
    default: 'Available'
  }
}, {
  timestamps: true
});

AgentSchema.index({ email: 1 });
AgentSchema.index({ team: 1 });

module.exports = mongoose.model('Agent', AgentSchema);