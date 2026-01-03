import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        exam: {
            type: String,
            enum: ['midterm', 'final', 'quiz', 'assignment'],
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        obtainedMarks: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
        },
        grade: {
            type: String,
        },
    },
    { timestamps: true }
);

const Marks = mongoose.model('Marks', marksSchema);

export default Marks;
