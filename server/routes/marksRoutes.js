import express from 'express';
import Marks from '../models/Marks.js';
import Course from '../models/Course.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Add marks (teacher only)
router.post('/', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { courseId, studentId, exam, totalMarks, obtainedMarks } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Calculate percentage and grade
        const percentage = (obtainedMarks / totalMarks) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';

        const marks = new Marks({
            course: courseId,
            student: studentId,
            exam,
            totalMarks,
            obtainedMarks,
            percentage,
            grade,
        });

        await marks.save();
        res.status(201).json({ message: 'Marks added', marks });
    } catch (error) {
        res.status(500).json({ message: 'Error adding marks', error: error.message });
    }
});

// Get marks for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
    try {
        const marks = await Marks.find({ course: req.params.courseId })
            .populate('student', 'name email studentId')
            .populate('course', 'courseName');

        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
});

// Get marks for a student
router.get('/student/:studentId', verifyToken, async (req, res) => {
    try {
        const marks = await Marks.find({ student: req.params.studentId })
            .populate('course', 'courseName courseCode');

        res.json(marks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marks', error: error.message });
    }
});

// Update marks
router.put('/:id', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { obtainedMarks } = req.body;
        const marks = await Marks.findById(req.params.id);

        if (!marks) {
            return res.status(404).json({ message: 'Marks not found' });
        }

        marks.obtainedMarks = obtainedMarks;
        marks.percentage = (obtainedMarks / marks.totalMarks) * 100;

        // Recalculate grade
        if (marks.percentage >= 90) marks.grade = 'A';
        else if (marks.percentage >= 80) marks.grade = 'B';
        else if (marks.percentage >= 70) marks.grade = 'C';
        else if (marks.percentage >= 60) marks.grade = 'D';
        else marks.grade = 'F';

        await marks.save();
        res.json({ message: 'Marks updated', marks });
    } catch (error) {
        res.status(500).json({ message: 'Error updating marks', error: error.message });
    }
});

export default router;
