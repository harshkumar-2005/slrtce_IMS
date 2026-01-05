import express from 'express';
import Course from '../models/Course.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create course (teacher/admin only)
router.post('/', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { courseCode, courseName, description, semester, credits, schedule } = req.body;

        const course = new Course({
            courseCode,
            courseName,
            description,
            semester,
            credits,
            instructor: req.userId,
            schedule,
        });

        await course.save();
        res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
});

// Get all courses
router.get('/', verifyToken, async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name email').populate('students', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Get single course
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('students', 'name email studentId');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
});

// Update course (instructor/admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is instructor or admin
        if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const { courseName, description, credits, schedule } = req.body;
        course.courseName = courseName || course.courseName;
        course.description = description || course.description;
        course.credits = credits || course.credits;
        course.schedule = schedule || course.schedule;

        await course.save();
        res.json({ message: 'Course updated successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// Enroll student in course
router.post('/:id/enroll', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.students.includes(req.userId)) {
            return res.status(400).json({ message: 'Student already enrolled' });
        }

        course.students.push(req.userId);
        await course.save();

        res.json({ message: 'Enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error: error.message });
    }
});

// Delete course
router.delete('/:id', verifyToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is instructor or admin
        if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

export default router;
