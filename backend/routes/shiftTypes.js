const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to protect all shift type routes
router.use(authenticateToken);

// GET all shift types (accessible to all authenticated users)
router.get('/', async (req, res) => {
  try {
    const shiftTypes = await prisma.shiftType.findMany();
    res.json(shiftTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new shift type (Admin/Manager only)
router.post('/', authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  const { name, startTime, endTime } = req.body;
  if (!name || !startTime || !endTime) {
    return res.status(400).json({ message: 'Name, startTime, and endTime are required' });
  }

  try {
    const newShiftType = await prisma.shiftType.create({
      data: { name, startTime, endTime },
    });
    res.status(201).json(newShiftType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT to update a shift type (Admin/Manager only)
router.put('/:id', authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  const { id } = req.params;
  const { name, startTime, endTime } = req.body;

  try {
    const updatedShiftType = await prisma.shiftType.update({
      where: { id: parseInt(id) },
      data: { name, startTime, endTime },
    });
    res.json(updatedShiftType);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'ShiftType not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a shift type (Admin/Manager only)
router.delete('/:id', authorize(['ADMIN', 'MANAGER']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.shiftType.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'ShiftType not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;