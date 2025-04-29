
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Task = require('../models/task.model');

// Get all tasks for current user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // Format tasks to match frontend expectations
    const formattedTasks = tasks.map(task => ({
      id: task._id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate.toISOString(),
      createdAt: task.createdAt.toISOString()
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Create new task
    const task = new Task({
      userId: req.user._id,
      title,
      description,
      status,
      dueDate
    });
    
    await task.save();
    
    // Format response
    res.status(201).json({
      id: task._id,
      userId: task.userId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate.toISOString(),
      createdAt: task.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Build update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    
    // Check if task exists and belongs to user
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    // Format response
    res.json({
      id: task._id,
      userId: task.userId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate.toISOString(),
      createdAt: task.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if task exists and belongs to user
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    
    // Delete task
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
