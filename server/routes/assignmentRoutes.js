import express from 'express';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create assignment (teacher only)
router.post('/', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { courseId, title, description, dueDate, attachmentUrl } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const assignment = new Assignment({
            course: courseId,
            title,
            description,
            dueDate,
            attachmentUrl,
        });

        await assignment.save();
        res.status(201).json({ message: 'Assignment created', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error creating assignment', error: error.message });
    }
});

// Get assignments for a course
router.get('/course/:courseId', verifyToken, async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId })
            .populate('course', 'courseName');

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
});

// Get all assignments for a student
router.get('/student/:studentId', verifyToken, async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate('course', 'courseName courseCode')
            .exec();

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
});

// Submit assignment
router.post('/:id/submit', verifyToken, async (req, res) => {
    try {
        const { submittedUrl } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = {
            student: req.userId,
            submittedUrl,
            submittedAt: new Date(),
        };

        // Check if student already submitted
        const existingSubmission = assignment.submissions.findIndex(
            (sub) => sub.student.toString() === req.userId
        );

        if (existingSubmission !== -1) {
            assignment.submissions[existingSubmission] = submission;
        } else {
            assignment.submissions.push(submission);
        }

        await assignment.save();
        res.json({ message: 'Assignment submitted', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting assignment', error: error.message });
    }
});

// Grade assignment
router.put('/:id/grade/:studentId', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = assignment.submissions.find(
            (sub) => sub.student.toString() === req.params.studentId
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;

        await assignment.save();
        res.json({ message: 'Assignment graded', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error grading assignment', error: error.message });
    }
});

export default router;
