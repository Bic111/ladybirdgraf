const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// All employee routes should be protected and accessible only by ADMIN or MANAGER
router.use(authenticateToken, authorize(['ADMIN', 'MANAGER']));

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE an employee's details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, position, employmentType } = req.body;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        position,
        employmentType,
      },
    });
    res.json(updatedEmployee);
  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Employee not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an employee
// This is a sensitive operation. It deletes the employee and the associated user.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Prisma doesn't support cascading deletes for one-to-one relations easily on the DB level.
    // We must do it in a transaction.
    const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
    }

    await prisma.$transaction([
      prisma.employee.delete({ where: { id: parseInt(id) } }),
      prisma.user.delete({ where: { id: employee.userId } }),
    ]);

    res.status(204).send(); // No Content
  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Employee not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;