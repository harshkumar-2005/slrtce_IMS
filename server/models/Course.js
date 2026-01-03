import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: true,
            unique: true,
        },
        courseName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        semester: {
            type: Number,
            required: true,
        },
        credits: {
            type: Number,
            default: 3,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        schedule: {
            days: [String],
            time: String,
            room: String,
        },
    },
    { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
