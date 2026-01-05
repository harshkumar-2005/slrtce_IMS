import express from 'express';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Mark attendance (teacher only)
router.post('/', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { courseId, studentId, status, date } = req.body;

        // Verify course and user is instructor
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const attendance = new Attendance({
            course: courseId,
            student: studentId,
            status,
            date: date || new Date(),
        });

        await attendance.save();
        res.status(201).json({ message: 'Attendance marked', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
});

// Get attendance for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
    try {
        const attendance = await Attendance.find({ course: req.params.courseId })
            .populate('student', 'name email studentId')
            .populate('course', 'courseName');

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

// Get attendance for a student
router.get('/student/:studentId', verifyToken, async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.params.studentId })
            .populate('course', 'courseName courseCode')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
});

// Update attendance
router.put('/:id', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json({ message: 'Attendance updated', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error updating attendance', error: error.message });
    }
});

export default router;
