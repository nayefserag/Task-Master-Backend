
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['completed', 'pending'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
